"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Plus, LogIn, Play, Pause, SkipBack, SkipForward,
  Music, Copy, Upload, Link, RefreshCw, CheckCircle, AlertCircle,
  Volume2, ListMusic, X, MessageSquare, Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { socket } from "@/lib/socket"
import { toast } from "sonner"

type Mode = "none" | "url" | "upload"

interface QueueItem {
  id: string
  name: string
  url: string
}

interface ChatMessage {
  id: string
  userId: string
  text: string
  time: string
  isSelf?: boolean
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export default function SyncRoom() {
  // ── Lobby state
  const [step, setStep] = useState<"lobby" | "create" | "join" | "room">("lobby")
  const [customCode, setCustomCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [checkingCode, setCheckingCode] = useState(false)
  const [checkProgress, setCheckProgress] = useState(0)
  const [joinCode, setJoinCode] = useState("")

  // ── Room state
  const [roomCode, setRoomCode] = useState("")
  const [users, setUsers] = useState<string[]>([])
  const [isHost, setIsHost] = useState(false)

  // ── Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [audioSrc, setAudioSrc] = useState("")
  const [songName, setSongName] = useState("No Song Selected")
  const [inputMode, setInputMode] = useState<Mode>("none")
  const [urlInput, setUrlInput] = useState("")
  const [uploading, setUploading] = useState(false)

  // ── Queue state
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  // ── Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatOpen, setChatOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── Broadcast queue to all listeners (host only)
  const broadcastQueue = useCallback((q: QueueItem[], idx: number) => {
    socket.emit("queue-update", { roomCode, queue: q, currentIndex: idx })
  }, [roomCode])

  // ── Play a specific song from the queue
  const playQueueItem = useCallback((item: QueueItem, index: number) => {
    setAudioSrc(item.url)
    setSongName(item.name)
    setCurrentIndex(index)
    setProgress(0)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.load()
    }
    // broadcast to listeners
    socket.emit("play-queue-item", { roomCode, url: item.url, name: item.name, index })
    // auto-play
    setTimeout(() => {
      audioRef.current?.play().then(() => {
        setIsPlaying(true)
        socket.emit("play-audio", roomCode)
      }).catch(console.error)
    }, 100)
  }, [roomCode])

  // ── Auto-advance to next song when current ends
  const handleSongEnded = useCallback(() => {
    setIsPlaying(false)
    if (isHost && currentIndex < queue.length - 1) {
      const next = currentIndex + 1
      playQueueItem(queue[next], next)
      toast(`Now playing: ${queue[next].name}`, { icon: "⏭️", duration: 3000 })
    }
  }, [isHost, currentIndex, queue, playQueueItem])

  // ── Socket setup
  useEffect(() => {
    if (step === "room" && roomCode) {
      socket.connect()
      socket.emit("join-room", roomCode)

      socket.on("room-users", (clients: string[]) => {
        setUsers(clients)
        toast.success(`Joined room ${roomCode}!`, {
          description: `${clients.length} listener${clients.length !== 1 ? "s" : ""} in the room`,
          icon: "🎵",
        })
      })

      socket.on("user-joined", (id: string) => {
        setUsers((prev) => [...prev, id])
        toast("A friend joined the room! 🎉", { description: `User ${id.substring(0, 4)} connected`, duration: 4000 })
      })

      socket.on("user-left", (id: string) => {
        setUsers((prev) => prev.filter((u) => u !== id))
        toast("A listener left the room", { description: `User ${id.substring(0, 4)} disconnected`, duration: 3000 })
      })

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

      socket.on("set-audio-url", ({ url, name }: { url: string; name: string }) => {
        setAudioSrc(url)
        setSongName(name)
        setIsPlaying(false)
        setProgress(0)
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.load() }
        toast.success("Host loaded a new song!", { description: name, icon: "🎵", duration: 4000 })
      })

      // Listener receives full queue update from host
      socket.on("queue-update", ({ queue: q, currentIndex: idx }: { queue: QueueItem[]; currentIndex: number }) => {
        setQueue(q)
        setCurrentIndex(idx)
      })

      // Listener tracks which queue index the host is on
      socket.on("queue-index", (idx: number) => setCurrentIndex(idx))

      // Chat messages — received by everyone including sender
      socket.on("chat-message", (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg])
        // If chat is closed, increment unread
        setChatOpen((open) => {
          if (!open) setUnread((n) => n + 1)
          return open
        })
      })

      return () => {
        socket.off("room-users"); socket.off("user-joined"); socket.off("user-left")
        socket.off("play-audio"); socket.off("pause-audio"); socket.off("sync-time")
        socket.off("set-audio-url"); socket.off("queue-update"); socket.off("queue-index")
        socket.off("chat-message")
        socket.disconnect()
      }
    }
  }, [step, roomCode])

  // ── Auto-scroll chat to bottom when new message arrives
  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
      setUnread(0)
    }
  }, [messages, chatOpen])

  // ── Send a chat message
  const sendMessage = () => {
    const text = chatInput.trim()
    if (!text) return
    const msg: ChatMessage = {
      id: Math.random().toString(36).substring(2),
      userId: socket.id ?? "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    }
    socket.emit("chat-message", { roomCode, message: msg })
    setChatInput("")
  }

  // ── Room creation animation
  const checkAndCreateRoom = () => {
    const code = customCode.trim().toUpperCase() || generateCode()
    setCheckingCode(true); setCodeError(""); setCheckProgress(0)
    let current = 0
    const steps = [{ target: 35, delay: 80 }, { target: 70, delay: 100 }, { target: 95, delay: 80 }]
    const runSteps = (index: number) => {
      if (index >= steps.length) {
        setCheckProgress(100)
        setTimeout(() => { setCheckingCode(false); setCheckProgress(0); setRoomCode(code); setIsHost(true); setStep("room") }, 350)
        return
      }
      const { target, delay } = steps[index]
      const tick = setInterval(() => {
        current += Math.random() * 10 + 5
        if (current >= target) { current = target; clearInterval(tick); setCheckProgress(Math.round(current)); setTimeout(() => runSteps(index + 1), delay) }
        else setCheckProgress(Math.round(current))
      }, 60)
    }
    runSteps(0)
  }

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinCode.length >= 4) { setRoomCode(joinCode.toUpperCase()); setIsHost(false); setStep("room") }
  }

  const togglePlay = () => {
    if (!audioSrc) return
    const newState = !isPlaying
    if (newState) {
      socket.emit("play-audio", roomCode); setIsPlaying(true); audioRef.current?.play().catch(console.error)
    } else {
      socket.emit("pause-audio", roomCode); setIsPlaying(false); audioRef.current?.pause()
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
    if (audioRef.current) { audioRef.current.currentTime = time; setProgress(time); socket.emit("sync-time", { roomCode, time }) }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value); setVolume(vol)
    if (audioRef.current) audioRef.current.volume = vol
  }

  // ── Skip to next / previous
  const skipNext = () => {
    if (!isHost || currentIndex >= queue.length - 1) return
    const next = currentIndex + 1; playQueueItem(queue[next], next)
  }
  const skipPrev = () => {
    if (!isHost || currentIndex <= 0) return
    const prev = currentIndex - 1; playQueueItem(queue[prev], prev)
  }

  // ── Add song to queue via file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const name = file.name.replace(/\.[^/.]+$/, "")
    setUploading(true); setInputMode("none")
    const uploadToast = toast.loading(`Uploading "${name}"…`, { description: "Adding to queue" })
    try {
      const formData = new FormData()
      formData.append("audio", file); formData.append("roomCode", roomCode); formData.append("songName", name)
      const res = await fetch("/upload-audio", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        const newItem: QueueItem = { id: generateId(), name: data.name, url: data.url }
        setQueue((prev) => {
          const updated = [...prev, newItem]
          // If queue was empty, play immediately
          if (prev.length === 0) {
            setAudioSrc(data.url); setSongName(data.name); setCurrentIndex(0); setProgress(0)
            socket.emit("set-audio-url", { roomCode, url: data.url, name: data.name })
            broadcastQueue(updated, 0)
          } else {
            broadcastQueue(updated, currentIndex)
          }
          return updated
        })
        toast.success("Added to queue!", { id: uploadToast, description: data.name, icon: "🎵", duration: 3000 })
      }
    } catch (err) {
      console.error("Upload failed:", err)
      toast.error("Upload failed", { id: uploadToast, description: "Could not upload the song. Try again." })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // ── Add URL to queue
  const handleUrlSet = () => {
    if (!urlInput.trim()) return
    const name = urlInput.split("/").pop()?.split("?")[0] || "Track"
    const newItem: QueueItem = { id: generateId(), name, url: urlInput.trim() }
    setQueue((prev) => {
      const updated = [...prev, newItem]
      if (prev.length === 0) {
        setAudioSrc(urlInput.trim()); setSongName(name); setCurrentIndex(0); setProgress(0)
        socket.emit("set-audio-url", { roomCode, url: urlInput.trim(), name })
        broadcastQueue(updated, 0)
      } else {
        broadcastQueue(updated, currentIndex)
      }
      return updated
    })
    setUrlInput(""); setInputMode("none")
    toast.success("Added to queue!", { description: name, icon: "🔗", duration: 3000 })
  }

  // ── Remove from queue
  const removeFromQueue = (id: string, index: number) => {
    setQueue((prev) => {
      const updated = prev.filter((item) => item.id !== id)
      let newIdx = currentIndex
      if (index < currentIndex) newIdx = currentIndex - 1
      else if (index === currentIndex) newIdx = Math.min(currentIndex, updated.length - 1)
      setCurrentIndex(newIdx)
      broadcastQueue(updated, newIdx)
      return updated
    })
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const m = Math.floor(time / 60); const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  // ──────────────────────────────────────────────────────────────────
  // ROOM VIEW
  // ──────────────────────────────────────────────────────────────────
  if (step === "room") {
    return (
      <div className="container max-w-5xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Player */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-primary/20 overflow-hidden">
              {/* Album art */}
              {uploading ? (
                <div className="h-44 bg-secondary animate-pulse flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="flex flex-col items-center gap-3 z-10">
                    <div className="h-14 w-14 rounded-full bg-muted-foreground/20 animate-pulse" />
                    <div className="h-2 w-28 rounded-full bg-muted-foreground/20 animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="h-44 bg-gradient-to-br from-primary/20 to-purple-900/40 flex items-center justify-center relative">
                  {isPlaying ? (
                    <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Music className="h-18 w-18 text-primary/70" style={{ height: 72, width: 72 }} />
                    </motion.div>
                  ) : (
                    <Music className="text-primary/30" style={{ height: 72, width: 72 }} />
                  )}
                  {/* Now playing badge */}
                  {audioSrc && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                      {isPlaying ? <><span className="flex gap-0.5">{[0,1,2].map(i => <motion.span key={i} className="inline-block w-0.5 h-3 bg-primary rounded-full" animate={{ scaleY: [1, 2, 1] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />)}</span> Playing</> : <><Music className="h-3 w-3 text-primary" /> Paused</>}
                    </div>
                  )}
                  {queue.length > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                      {currentIndex + 1} / {queue.length}
                    </div>
                  )}
                </div>
              )}

              <CardContent className="pt-5 space-y-5">
                {/* Song name */}
                {uploading ? (
                  <div className="text-center space-y-2">
                    <div className="h-7 w-48 rounded-lg bg-muted animate-pulse mx-auto" />
                    <div className="h-4 w-32 rounded-lg bg-muted animate-pulse mx-auto" />
                    <div className="flex items-center justify-center gap-2 text-xs text-primary/70 font-medium mt-1">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Adding to queue…
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h2 className="text-xl font-bold truncate">{songName}</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {audioSrc ? (queue.length > 0 ? `Track ${currentIndex + 1} of ${queue.length} in queue` : "Ready to play") : "No song loaded — add songs to queue below"}
                    </p>
                  </div>
                )}

                <audio ref={audioRef} src={audioSrc} onTimeUpdate={handleTimeUpdate} onEnded={handleSongEnded} />

                {/* Seek bar */}
                {uploading ? (
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
                    <div className="flex justify-between"><div className="h-3 w-8 rounded bg-muted animate-pulse" /><div className="h-3 w-8 rounded bg-muted animate-pulse" /></div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span>{formatTime(progress)}</span>
                    <input type="range" min="0" max={duration || 100} value={progress} onChange={handleSeek}
                      className="flex-grow h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                    <span>{formatTime(duration)}</span>
                  </div>
                )}

                {/* Controls */}
                {uploading ? (
                  <div className="flex items-center justify-center gap-6">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-6">
                    <Button variant="ghost" size="icon"
                      className={`h-12 w-12 rounded-full hover:bg-primary/10 ${(!isHost || currentIndex <= 0) ? "opacity-30 cursor-not-allowed" : ""}`}
                      onClick={skipPrev} disabled={!isHost || currentIndex <= 0}>
                      <SkipBack className="h-6 w-6" />
                    </Button>
                    <Button onClick={togglePlay} size="icon" disabled={!audioSrc}
                      className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-40">
                      {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                    </Button>
                    <Button variant="ghost" size="icon"
                      className={`h-12 w-12 rounded-full hover:bg-primary/10 ${(!isHost || currentIndex >= queue.length - 1) ? "opacity-30 cursor-not-allowed" : ""}`}
                      onClick={skipNext} disabled={!isHost || currentIndex >= queue.length - 1}>
                      <SkipForward className="h-6 w-6" />
                    </Button>
                  </div>
                )}

                {/* Volume */}
                <div className="flex items-center gap-3 max-w-xs mx-auto">
                  <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange}
                    className="flex-grow h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                {/* Add to queue (host only) */}
                {isHost && (
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider">Add to Queue</p>
                    <div className="flex gap-2">
                      <Button variant={uploading ? "default" : inputMode === "upload" ? "default" : "secondary"}
                        size="sm" className="flex-1 gap-2" disabled={uploading}
                        onClick={() => { setInputMode(inputMode === "upload" ? "none" : "upload"); fileInputRef.current?.click() }}>
                        {uploading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Upload MP3</>}
                      </Button>
                      <Button variant={inputMode === "url" ? "default" : "secondary"}
                        size="sm" className="flex-1 gap-2"
                        onClick={() => setInputMode(inputMode === "url" ? "none" : "url")}>
                        <Link className="h-4 w-4" /> Paste URL
                      </Button>
                    </div>

                    <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />

                    <AnimatePresence>
                      {inputMode === "url" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex gap-2">
                          <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://example.com/song.mp3" className="flex-grow text-sm"
                            onKeyDown={(e) => e.key === "Enter" && handleUrlSet()} />
                          <Button size="sm" onClick={handleUrlSet} disabled={!urlInput.trim()}>Add</Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {!isHost && (
                  <p className="text-xs text-center text-muted-foreground border-t pt-4">
                    Only the room host can manage the queue.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Sidebar */}
          <div className="space-y-4">
            {/* Room code */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Room Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
                  <span className="font-mono text-2xl font-bold tracking-widest text-primary">{roomCode}</span>
                  <Button variant="ghost" size="icon" title="Copy Code"
                    onClick={() => { navigator.clipboard.writeText(roomCode); toast.success("Code copied!", { description: `"${roomCode}" is in your clipboard`, icon: "📋", duration: 2500 }) }}>
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
                {isHost && <p className="text-xs text-muted-foreground mt-2">Share this code with your friends!</p>}
              </CardContent>
            </Card>

            {/* Queue */}
            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <ListMusic className="h-4 w-4 text-primary" />
                    Queue
                    {queue.length > 0 && (
                      <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {queue.length}
                      </span>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {queue.length === 0 ? (
                  <div className="px-4 pb-4 text-center">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-2">
                      <ListMusic className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isHost ? "No songs yet. Upload or paste a URL to add to the queue." : "The host hasn't added any songs yet."}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto divide-y divide-border">
                    {queue.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`flex items-center gap-3 px-4 py-2.5 group transition-colors ${index === currentIndex ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-secondary/50"}`}
                      >
                        {/* Index / play indicator */}
                        <div className="shrink-0 w-6 text-center">
                          {index === currentIndex && isPlaying ? (
                            <span className="flex gap-px justify-center">
                              {[0,1,2].map(i => (
                                <motion.span key={i} className="inline-block w-0.5 h-3 bg-primary rounded-full"
                                  animate={{ scaleY: [1, 2, 1] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                              ))}
                            </span>
                          ) : (
                            <span className={`text-xs font-mono ${index === currentIndex ? "text-primary font-bold" : "text-muted-foreground"}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {/* Song name */}
                        <div className="flex-grow min-w-0">
                          <p className={`text-sm font-medium truncate ${index === currentIndex ? "text-primary" : ""}`}>{item.name}</p>
                        </div>

                        {/* Actions (host only) */}
                        {isHost && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {index !== currentIndex && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Play this song"
                                onClick={() => playQueueItem(item, index)}>
                                <Play className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Remove from queue" onClick={() => removeFromQueue(item.id, index)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Listeners */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-primary" /> Listeners ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {users.map((id, index) => (
                    <li key={id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                      <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{index + 1}</div>
                      <span className="text-sm font-medium truncate">User {id.substring(0, 4)}</span>
                      {socket.id === id && <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">You</span>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="overflow-hidden">
              {/* Chat header — click to toggle */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
                onClick={() => { setChatOpen((o) => !o); setUnread(0) }}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Room Chat
                  {unread > 0 && (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-bounce">
                      {unread}
                    </span>
                  )}
                </span>
                <motion.span animate={{ rotate: chatOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                  className="text-muted-foreground text-xs">▲</motion.span>
              </button>

              <AnimatePresence initial={false}>
                {chatOpen && (
                  <motion.div
                    key="chat-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {/* Message list */}
                    <div className="h-56 overflow-y-auto px-3 py-2 space-y-3 border-t border-border bg-secondary/20">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                          <MessageSquare className="h-8 w-8 opacity-30" />
                          <p className="text-xs">No messages yet. Say hi! 👋</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isSelf = msg.userId === socket.id || msg.isSelf
                          // Deterministic avatar color from userId
                          const colors = ["bg-violet-500","bg-blue-500","bg-pink-500","bg-emerald-500","bg-orange-500","bg-cyan-500"]
                          const colorIdx = msg.userId.charCodeAt(0) % colors.length
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
                            >
                              {/* Avatar */}
                              <div className={`h-6 w-6 rounded-full shrink-0 ${colors[colorIdx]} flex items-center justify-center text-white text-[10px] font-bold`}>
                                {msg.userId.substring(0, 2).toUpperCase()}
                              </div>
                              {/* Bubble */}
                              <div className={`max-w-[75%] ${isSelf ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                                <div className={`px-3 py-1.5 rounded-2xl text-sm leading-snug break-words ${isSelf ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-foreground rounded-tl-sm"}`}>
                                  {msg.text}
                                </div>
                                <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
                              </div>
                            </motion.div>
                          )
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input row */}
                    <div className="flex gap-2 p-3 border-t border-border">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                        placeholder="Say something…"
                        className="text-sm h-8"
                        maxLength={300}
                      />
                      <Button size="icon" className="h-8 w-8 shrink-0" onClick={sendMessage} disabled={!chatInput.trim()}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Leave */}
            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              onClick={() => {
                setStep("lobby")
                audioRef.current?.pause()
                setAudioSrc("")
                setSongName("No Song Selected")
                setQueue([])
                setCurrentIndex(-1)
                setMessages([])
                setChatOpen(false)
                setUnread(0)
                toast("Left the room", { description: "See you next time! 👋", duration: 3000 })
              }}>
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    )

  }

  // ──────────────────────────────────────────────────────────────────
  // LOBBY VIEW
  // ──────────────────────────────────────────────────────────────────
  return (
    <div className="container max-w-4xl mx-auto py-24 px-4">
      <div className="text-center mb-16 space-y-4">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Sync <span className="text-primary">Mode</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create a room and share the code to listen to the exact same audio at the exact same time.
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {step === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="h-full flex flex-col border-primary/20 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setStep("create")}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"><Plus className="h-6 w-6 text-primary" /></div>
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
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-4"><LogIn className="h-6 w-6 text-foreground" /></div>
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
                    <Input value={customCode}
                      onChange={(e) => { setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8)); setCodeError("") }}
                      placeholder="Custom code (optional)" className="font-mono text-lg tracking-widest uppercase" maxLength={8} />
                    <Button variant="outline" size="icon" title="Random Code" onClick={() => { setCustomCode(generateCode()); setCodeError("") }}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Leave blank for a random code, or type your own (4–8 characters).</p>
                </div>

                <AnimatePresence>
                  {codeError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{codeError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {checkingCode ? (
                    <motion.div key="progress" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                        <span className={checkProgress >= 30 ? "text-primary" : ""}>{checkProgress >= 30 ? "✓" : "○"} Connecting</span>
                        <span className={checkProgress >= 60 ? "text-primary" : ""}>{checkProgress >= 60 ? "✓" : "○"} Checking code</span>
                        <span className={checkProgress >= 100 ? "text-primary" : ""}>{checkProgress >= 100 ? "✓" : "○"} Creating room</span>
                      </div>
                      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full bg-primary" initial={{ width: "0%" }} animate={{ width: `${checkProgress}%` }} transition={{ ease: "easeOut", duration: 0.2 }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin" />{checkProgress < 100 ? "Verifying availability…" : "All clear! Creating room…"}</span>
                        <span className="font-mono font-bold text-primary">{checkProgress}%</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="button" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                      <Button className="w-full h-12 text-base gap-2" onClick={checkAndCreateRoom}>
                        <CheckCircle className="h-4 w-4" /> Create Room
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button variant="ghost" className="w-full" onClick={() => { setStep("lobby"); setCodeError(""); setCustomCode("") }}>← Back</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "join" && (
          <motion.div key="join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Join a Room</CardTitle>
                <CardDescription>Enter the code your friend shared with you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <Input value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8))}
                    placeholder="Enter room code"
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono uppercase bg-secondary/50"
                    maxLength={8} autoFocus />
                  <Button type="submit" className="w-full h-12 text-lg" disabled={joinCode.length < 4}>Join Session</Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep("lobby"); setJoinCode("") }}>← Back</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
