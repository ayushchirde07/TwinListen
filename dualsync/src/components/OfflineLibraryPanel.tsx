"use client"

// components/OfflineLibraryPanel.tsx
// Collapsible panel listing all locally stored offline tracks with playback & delete

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HardDrive, Play, Pause, Trash2, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getAllOfflineTracks,
  getOfflineTrackBlob,
  deleteOfflineTrack,
  formatFileSize,
  type OfflineTrack,
} from "@/lib/offlineStorage"
import { toast } from "sonner"

type TrackMeta = Omit<OfflineTrack, "blob">

interface OfflineLibraryPanelProps {
  /** Trigger a refresh whenever a new download completes */
  refreshKey?: number
}

const SOURCE_LABELS: Record<string, string> = {
  upload: "Uploaded",
  youtube: "YouTube",
  url: "URL",
}

export function OfflineLibraryPanel({ refreshKey }: OfflineLibraryPanelProps) {
  const [open, setOpen] = useState(false)
  const [tracks, setTracks] = useState<TrackMeta[]>([])
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  const load = useCallback(async () => {
    const all = await getAllOfflineTracks()
    // Sort newest first
    setTracks(all.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()))
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const stopPlayback = () => {
    audioRef.current?.pause()
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    blobUrlRef.current = null
    audioRef.current = null
    setPlayingId(null)
  }

  const playTrack = async (track: TrackMeta) => {
    if (playingId === track.id) {
      stopPlayback()
      return
    }
    stopPlayback()

    const blob = await getOfflineTrackBlob(track.id)
    if (!blob) {
      toast.error("Could not load audio from offline storage.")
      return
    }

    const url = URL.createObjectURL(blob)
    blobUrlRef.current = url

    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => setPlayingId(null)
    audio.play().catch(console.error)
    setPlayingId(track.id)
  }

  const handleDelete = async (id: string, name: string) => {
    if (playingId === id) stopPlayback()
    await deleteOfflineTrack(id)
    setTracks((prev) => prev.filter((t) => t.id !== id))
    toast.success(`Removed "${name}" from offline library.`, { icon: "🗑️", duration: 2500 })
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Library className="h-4 w-4 text-primary" />
          Offline Library
          {tracks.length > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {tracks.length}
            </span>
          )}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground text-xs"
        >
          ▲
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="library-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {tracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                  <HardDrive className="h-8 w-8 opacity-30" />
                  <p className="text-xs text-center px-4">
                    No offline tracks yet. Download songs to listen anytime.
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-border">
                  {tracks.map((track) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`flex items-center gap-3 px-4 py-2.5 group transition-colors ${
                        playingId === track.id ? "bg-primary/10" : "hover:bg-secondary/40"
                      }`}
                    >
                      {/* Play/Pause */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full shrink-0 hover:bg-primary/20"
                        onClick={() => playTrack(track)}
                        title={playingId === track.id ? "Pause" : "Play offline"}
                      >
                        {playingId === track.id ? (
                          <Pause className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <p className={`text-sm font-medium truncate ${playingId === track.id ? "text-primary" : ""}`}>
                          {track.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(track.sizeBytes)} · {SOURCE_LABELS[track.source] ?? track.source} · {formatDate(track.downloadedAt)}
                        </p>
                      </div>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        title="Remove from offline library"
                        onClick={() => handleDelete(track.id, track.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
