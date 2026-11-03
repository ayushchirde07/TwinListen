"use client"

// components/DownloadHistoryPanel.tsx
// Collapsible panel showing a log of all download events with clear option

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Trash2, CheckCircle, AlertCircle, Upload, Link, Music2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getDownloadHistory,
  clearDownloadHistory,
  formatFileSize,
  type DownloadHistoryEntry,
} from "@/lib/offlineStorage"
import { toast } from "sonner"

interface DownloadHistoryPanelProps {
  refreshKey?: number
}

const SourceIcon = ({ source }: { source: string }) => {
  if (source === "upload") return <Upload className="h-3 w-3 shrink-0" />
  if (source === "youtube") return <Music2 className="h-3 w-3 shrink-0" />
  return <Link className="h-3 w-3 shrink-0" />
}

const SOURCE_LABELS: Record<string, string> = {
  upload: "Uploaded",
  youtube: "YouTube",
  url: "URL",
}

export function DownloadHistoryPanel({ refreshKey }: DownloadHistoryPanelProps) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<DownloadHistoryEntry[]>([])

  const load = useCallback(async () => {
    setHistory(await getDownloadHistory())
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const handleClear = async () => {
    await clearDownloadHistory()
    setHistory([])
    toast.success("Download history cleared.", { icon: "🗑️", duration: 2000 })
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-primary" />
          Download History
          {history.length > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-secondary text-foreground text-xs font-bold flex items-center justify-center">
              {history.length}
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
            key="history-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 opacity-30" />
                  <p className="text-xs">No download history yet.</p>
                </div>
              ) : (
                <>
                  {/* Clear button */}
                  <div className="flex justify-end px-4 py-2 border-b border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1.5"
                      onClick={handleClear}
                    >
                      <Trash2 className="h-3 w-3" /> Clear History
                    </Button>
                  </div>

                  <div className="max-h-52 overflow-y-auto divide-y divide-border">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        {/* Status icon */}
                        {entry.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}

                        {/* Info */}
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium truncate">{entry.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <SourceIcon source={entry.source} />
                            {SOURCE_LABELS[entry.source] ?? entry.source}
                            {entry.status === "success" && entry.sizeBytes > 0 && (
                              <> · {formatFileSize(entry.sizeBytes)}</>
                            )}
                            {entry.status === "failed" && (
                              <span className="text-destructive"> · Failed</span>
                            )}
                          </p>
                        </div>

                        {/* Date */}
                        <span className="text-xs text-muted-foreground shrink-0 font-mono">
                          {formatDate(entry.downloadedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
