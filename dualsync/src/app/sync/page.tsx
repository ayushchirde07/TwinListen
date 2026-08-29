"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Plus, LogIn, Play, Pause, SkipBack, SkipForward,
  Music, Copy, Upload, Link, RefreshCw, CheckCircle, AlertCircle, Volume2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { socket } from "@/lib/socket"

type Mode = "none" | "url" | "upload"

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function SyncRoom() {
  // Lobby state
  const [step, setStep] = useState<"lobby" | "create" | "join" | "room">("lobby")
  const [customCode, setCustomCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [checkingCode, setCheckingCode] = useState(false)
  const [checkProgress, setCheckProgress] = useState(0)
  const [joinCode, setJoinCode] = useState("")

  // Room state
  const [roomCode, setRoomCode] = useState("")
  const [users, setUsers] = useState<string[]>([])
  const [isHost, setIsHost] = useState(false)

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [audioSrc, setAudioSrc] = useState("")
  const [songName, setSongName] = useState("No Song Selected")
  const [inputMode, setInputMode] = useState<Mode>("none")
  const [urlInput, setUrlInput] = useState("")

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Connect socket when entering a room
  useEffect(() => {
    if (step === "room" && roomCode) {
      socket.connect()
      socket.emit("join-room", roomCode)

      socket.on("room-users", (clients: string[]) => setUsers(clients))
      socket.on("user-joined", (id: string) => setUsers((prev) => [...prev, id]))
      socket.on("user-left", (id: string) => setUsers((prev) => prev.filter((u) => u !== id)))

      socket.on("play-audio", () => {
        setIsPlaying(true)
        audioRef.current?.play().catch(console.error)
      })

      socket.on("pause-audio", () => {
        setIsPlaying(false)
        audioRef.current?.pause()
      })

      socket.on("sync-time", (time: number) => {
        if (audioRef.current && Math.abs(audioRef.current.currentTime - time) > 1) {
          audioRef.current.currentTime = time
        }
      })

      // A non-host received a new audio source from the host
      socket.on("set-audio-url", ({ url, name }: { url: string; name: string }) => {
        setAudioSrc(url)
        setSongName(name)
        setIsPlaying(false)
        setProgress(0)
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.load()
        }
      })

      return () => {
        socket.off("room-users")
        socket.off("user-joined")
        socket.off("user-left")
        socket.off("play-audio")
        socket.off("pause-audio")
        socket.off("sync-time")
        socket.off("set-audio-url")
        socket.disconnect()
      }
    }
  }, [step, roomCode])

  const checkAndCreateRoom = () => {
    const code = customCode.trim().toUpperCase() || generateCode()
    setCheckingCode(true)
    setCodeError("")
    setCheckProgress(0)

    // Pure local animation — no server roundtrip needed
    let current = 0
    const steps = [
      { target: 35, delay: 80 },   // Connecting
      { target: 70, delay: 100 },  // Checking code
      { target: 95, delay: 80 },   // Creating room
    ]

    const runSteps = (index: number) => {
      if (index >= steps.length) {
        // All steps done — snap to 100 and enter
        setCheckProgress(100)
        setTimeout(() => {
          setCheckingCode(false)
          setCheckProgress(0)
          setRoomCode(code)
          setIsHost(true)
          setStep("room")
        }, 350)
        return
      }
      const { target, delay } = steps[index]
      const tick = setInterval(() => {
        current += Math.random() * 10 + 5
        if (current >= target) {
          current = target
          clearInterval(tick)
          setCheckProgress(Math.round(current))
          setTimeout(() => runSteps(index + 1), delay)
        } else {
          setCheckProgress(Math.round(current))
        }
      }, 60)
    }

    runSteps(0)
  }

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinCode.length >= 4) {
      setRoomCode(joinCode.toUpperCase())
      setIsHost(false)
      setStep("room")
    }
  }

  const togglePlay = () => {
    if (!audioSrc) return
    const newState = !isPlaying
    if (newState) {
      socket.emit("play-audio", roomCode)
      setIsPlaying(true)
      audioRef.current?.play().catch(console.error)
    } else {
      socket.emit("pause-audio", roomCode)
      setIsPlaying(false)
      audioRef.current?.pause()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
      if (isPlaying && Math.floor(audioRef.current.currentTime) % 5 === 0) {
        socket.emit("sync-time", { roomCode, time: audioRef.current.currentTime })
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
      socket.emit("sync-time", { roomCode, time })
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value)
    setVolume(vol)
    if (audioRef.current) audioRef.current.volume = vol
  }

  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show a local preview immediately
    const localUrl = URL.createObjectURL(file)
    const name = file.name.replace(/\.[^/.]+$/, "")
    setAudioSrc(localUrl)
    setSongName(`⏫ Uploading: ${name}…`)
    setIsPlaying(false)
    setProgress(0)
    setUploading(true)
    setInputMode("none")

    // Upload to server so all room members can access it
    try {
      const formData = new FormData()
      formData.append("audio", file)
      formData.append("roomCode", roomCode)
      formData.append("songName", name)

      const res = await fetch("/upload-audio", { method: "POST", body: formData })
      const data = await res.json()

      if (data.url) {
        // Switch host to server URL too (so seeking/sync is consistent)
        setAudioSrc(data.url)
        setSongName(data.name)
        // Server already broadcast set-audio-url to all other room members
      }
    } catch (err) {
      console.error("Upload failed:", err)
      setSongName(name) // fallback to local name
    } finally {
      setUploading(false)
    }
  }

  const handleUrlSet = () => {
    if (!urlInput.trim()) return
    setAudioSrc(urlInput.trim())
    const name = urlInput.split("/").pop() || "Track"
    setSongName(name)
    setIsPlaying(false)
    setProgress(0)
    socket.emit("set-audio-url", { roomCode, url: urlInput.trim(), name })
    setUrlInput("")
    setInputMode("none")
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  // ── ROOM VIEW ──────────────────────────────────────────────────
  if (step === "room") {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Player */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-primary/20 overflow-hidden">
              {/* Album art area */}
              <div className="h-48 bg-gradient-to-br from-primary/20 to-purple-900/40 flex items-center justify-center relative group">
                {isPlaying ? (
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Music className="h-20 w-20 text-primary/70" />
                  </motion.div>
                ) : (
                  <Music className="h-20 w-20 text-primary/30" />
                )}
              </div>

              <CardContent className="pt-6 space-y-6">
                {/* Song name */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold truncate">{songName}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {audioSrc ? "Ready to play" : "No song loaded — upload or paste a URL below"}
                  </p>
                </div>

                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src={audioSrc}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Seek bar */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span>{formatTime(progress)}</span>
                    <input
                      type="range" min="0" max={duration || 100} value={progress}
                      onChange={handleSeek}
                      className="flex-grow h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
                    <SkipBack className="h-6 w-6" />
                  </Button>
                  <Button
                    onClick={togglePlay}
                    size="icon"
                    disabled={!audioSrc}
                    className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-40"
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
                    <SkipForward className="h-6 w-6" />
                  </Button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 max-w-xs mx-auto">
                  <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="range" min="0" max="1" step="0.05" value={volume}
                    onChange={handleVolumeChange}
                    className="flex-grow h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Song source (host only) */}
                {isHost && (
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider">Load a Song</p>
                    <div className="flex gap-2">
                      <Button
                        variant={uploading ? "default" : inputMode === "upload" ? "default" : "secondary"}
                        size="sm" className="flex-1 gap-2"
                        disabled={uploading}
                        onClick={() => { setInputMode(inputMode === "upload" ? "none" : "upload"); fileInputRef.current?.click() }}
                      >
                        {uploading ? (
                          <><RefreshCw className="h-4 w-4 animate-spin" /> Uploading…</>
                        ) : (
                          <><Upload className="h-4 w-4" /> Upload MP3</>
                        )}
                      </Button>
                      <Button
                        variant={inputMode === "url" ? "default" : "secondary"}
                        size="sm" className="flex-1 gap-2"
                        onClick={() => setInputMode(inputMode === "url" ? "none" : "url")}
                      >
                        <Link className="h-4 w-4" /> Paste URL
                      </Button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <AnimatePresence>
                      {inputMode === "url" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="flex gap-2"
                        >
                          <Input
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://example.com/song.mp3"
                            className="flex-grow text-sm"
                            onKeyDown={(e) => e.key === "Enter" && handleUrlSet()}
                          />
                          <Button size="sm" onClick={handleUrlSet} disabled={!urlInput.trim()}>Load</Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {!isHost && (
                  <p className="text-xs text-center text-muted-foreground border-t pt-4">
                    Only the room host can change the song.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Room Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
                  <span className="font-mono text-2xl font-bold tracking-widest text-primary">{roomCode}</span>
                  <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(roomCode)} title="Copy Code">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
                {isHost && <p className="text-xs text-muted-foreground mt-2">Share this code with your friends!</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Listeners ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {users.map((id, index) => (
                    <li key={id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium truncate">User {id.substring(0, 4)}</span>
                      {socket.id === id && <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">You</span>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              onClick={() => { setStep("lobby"); audioRef.current?.pause(); setAudioSrc(""); setSongName("No Song Selected") }}
            >
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── LOBBY VIEW ─────────────────────────────────────────────────
  return (
    <div className="container max-w-4xl mx-auto py-24 px-4">
      <div className="text-center mb-16 space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
        >
          Sync <span className="text-primary">Mode</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Create a room and share the code to listen to the exact same audio at the exact same time.
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {/* Initial choice */}
        {step === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          >
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card
                className="h-full flex flex-col border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setStep("create")}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Create Room</CardTitle>
                  <CardDescription>Start a new session and invite a friend. Choose your own code or get a random one.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                  <Button className="w-full h-12 text-lg" onClick={() => setStep("create")}>Get Started</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="h-full flex flex-col" onClick={() => setStep("join")}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                    <LogIn className="h-6 w-6 text-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Join Room</CardTitle>
                  <CardDescription>Enter a code to join an existing session your friend created.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                  <Button variant="secondary" className="w-full h-12 text-lg" onClick={() => setStep("join")}>Join Session</Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Create room step */}
        {step === "create" && (
          <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Create a Room</CardTitle>
                <CardDescription>Pick your own room code or we will generate one randomly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room Code</label>
                  <div className="flex gap-2">
                    <Input
                      value={customCode}
                      onChange={(e) => { setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8)); setCodeError("") }}
                      placeholder="Custom code (optional)"
                      className="font-mono text-lg tracking-widest uppercase"
                      maxLength={8}
                    />
                    <Button variant="outline" size="icon" title="Random Code" onClick={() => { setCustomCode(generateCode()); setCodeError("") }}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Leave blank for a random code, or type your own (4–8 characters).</p>
                </div>

                <AnimatePresence>
                  {codeError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                    >
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {codeError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {checkingCode ? (
                    <motion.div
                      key="progress"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="space-y-3"
                    >
                      {/* Steps row */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                        <span className={checkProgress >= 30 ? "text-primary" : ""}>
                          {checkProgress >= 30 ? "✓" : "○"} Connecting
                        </span>
                        <span className={checkProgress >= 60 ? "text-primary" : ""}>
                          {checkProgress >= 60 ? "✓" : "○"} Checking code
                        </span>
                        <span className={checkProgress >= 100 ? "text-primary" : ""}>
                          {checkProgress >= 100 ? "✓" : "○"} Creating room
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: `${checkProgress}%` }}
                          transition={{ ease: "easeOut", duration: 0.2 }}
                        />
                      </div>

                      {/* Percentage */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          {checkProgress < 100 ? "Verifying availability…" : "All clear! Creating room…"}
                        </span>
                        <span className="font-mono font-bold text-primary">{checkProgress}%</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="button" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                      <Button
                        className="w-full h-12 text-base gap-2"
                        onClick={checkAndCreateRoom}
                      >
                        <CheckCircle className="h-4 w-4" /> Create Room
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button variant="ghost" className="w-full" onClick={() => { setStep("lobby"); setCodeError(""); setCustomCode("") }}>
                  ← Back
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Join room step */}
        {step === "join" && (
          <motion.div key="join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Join a Room</CardTitle>
                <CardDescription>Enter the code your friend shared with you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8))}
                    placeholder="Enter room code"
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono uppercase bg-secondary/50"
                    maxLength={8}
                    autoFocus
                  />
                  <Button type="submit" className="w-full h-12 text-lg" disabled={joinCode.length < 4}>
                    Join Session
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep("lobby"); setJoinCode("") }}>
                    ← Back
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
