"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Users, Plus, LogIn, Play, Pause, SkipBack, SkipForward, Music, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { socket } from "@/lib/socket"

export default function SyncRoom() {
  const [inRoom, setInRoom] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [users, setUsers] = useState<string[]>([])
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (inRoom && roomCode) {
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

      return () => {
        socket.off("room-users")
        socket.off("user-joined")
        socket.off("user-left")
        socket.off("play-audio")
        socket.off("pause-audio")
        socket.off("sync-time")
        socket.disconnect()
      }
    }
  }, [inRoom, roomCode])

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(code)
    setInRoom(true)
  }

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinCode.length === 6) {
      setRoomCode(joinCode.toUpperCase())
      setInRoom(true)
    }
  }

  const togglePlay = () => {
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
      
      // Periodically sync time with others if we are playing
      if (isPlaying && Math.floor(audioRef.current.currentTime) % 5 === 0) {
        socket.emit("sync-time", { roomCode, time: audioRef.current.currentTime })
      }
    }
  }
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
      socket.emit("sync-time", { roomCode, time });
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (inRoom) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-primary/20 bg-card overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-purple-900/40 flex items-center justify-center relative group">
                <Music className="h-20 w-20 text-primary/50 group-hover:scale-110 transition-transform" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="bg-background/80 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-primary uppercase">Demo Track</span>
                </div>
              </div>
              <CardContent className="pt-6 text-center space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">Lofi Study Beat</h2>
                  <p className="text-muted-foreground">Streaming to all listeners in sync</p>
                </div>
                
                {/* Hidden Audio Element */}
                <audio 
                  ref={audioRef} 
                  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Player Controls */}
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
                    <span>{formatTime(progress)}</span>
                    <input 
                      type="range" 
                      min="0" 
                      max={duration || 100} 
                      value={progress} 
                      onChange={handleSeek}
                      className="flex-grow h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span>{formatTime(duration)}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 pt-2">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
                      <SkipBack className="h-6 w-6" />
                    </Button>
                    <Button onClick={togglePlay} size="icon" className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-105">
                      {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
                      <SkipForward className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
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
            
            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => { setInRoom(false); audioRef.current?.pause(); }}>
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-24 px-4">
      {/* Lobby UI remains same... */}
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

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full flex flex-col border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create Room</CardTitle>
              <CardDescription>Start a new session and invite a friend.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button onClick={handleCreateRoom} className="w-full h-12 text-lg">Generate Room Code</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <LogIn className="h-6 w-6 text-foreground" />
              </div>
              <CardTitle className="text-2xl">Join Room</CardTitle>
              <CardDescription>Enter a 6-digit code to join an existing session.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().substring(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="h-14 text-center text-2xl tracking-[0.5em] font-mono uppercase bg-secondary/50"
                  maxLength={6}
                />
                <Button type="submit" variant="secondary" className="w-full h-12 text-lg" disabled={joinCode.length !== 6}>
                  Join Session
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
