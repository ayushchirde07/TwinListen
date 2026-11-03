"use client"

// hooks/useDownloadManager.ts
// Centralises all audio download logic for DualSync 2.0

import { useState, useCallback } from "react"
import {
  saveOfflineTrack,
  addDownloadHistory,
  detectSource,
  type OfflineTrack,
} from "@/lib/offlineStorage"

export type DownloadStatus = "idle" | "downloading" | "done" | "error"

export interface DownloadState {
  status: DownloadStatus
  progress: number // 0-100
  error?: string
}

export type DownloadsMap = Record<string, DownloadState>

export function useDownloadManager() {
  const [downloads, setDownloads] = useState<DownloadsMap>({})

  const setTrackState = useCallback((id: string, patch: Partial<DownloadState>) => {
    setDownloads((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { status: "idle", progress: 0 }), ...patch },
    }))
  }, [])

  // Download a single track
  const downloadTrack = useCallback(
    async (item: { id: string; name: string; url: string }) => {
      const { id, name, url } = item

      const current = downloads[id]
      if (current?.status === "downloading" || current?.status === "done") return

      setTrackState(id, { status: "downloading", progress: 0, error: undefined })

      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const contentLength = res.headers.get("content-length")
        const total = contentLength ? parseInt(contentLength, 10) : 0
        const mimeType = res.headers.get("content-type") || "audio/mpeg"

        let loaded = 0
        const chunks: Uint8Array<ArrayBuffer>[] = []

        if (res.body && total > 0) {
          const reader = res.body.getReader()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value as Uint8Array<ArrayBuffer>)
            loaded += value.length
            setTrackState(id, { progress: Math.round((loaded / total) * 100) })
          }
        } else {
          setTrackState(id, { progress: 50 })
          const buffer = await res.arrayBuffer()
          chunks.push(new Uint8Array(buffer) as Uint8Array<ArrayBuffer>)
          loaded = buffer.byteLength
        }

        const blob = new Blob(chunks as BlobPart[], { type: mimeType })
        const source = detectSource(url)

        const track: OfflineTrack = {
          id,
          name,
          blob,
          mimeType,
          sizeBytes: blob.size,
          downloadedAt: new Date().toISOString(),
          source,
        }

        await saveOfflineTrack(track)
        await addDownloadHistory({
          id: `hist-${id}-${Date.now()}`,
          name,
          sizeBytes: blob.size,
          downloadedAt: track.downloadedAt,
          source,
          status: "success",
        })

        setTrackState(id, { status: "done", progress: 100 })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error(`Download failed for "${name}":`, message)
        await addDownloadHistory({
          id: `hist-${id}-${Date.now()}`,
          name,
          sizeBytes: 0,
          downloadedAt: new Date().toISOString(),
          source: detectSource(url),
          status: "failed",
        })
        setTrackState(id, { status: "error", progress: 0, error: message })
      }
    },
    [downloads, setTrackState]
  )

  // Download all queue items sequentially
  const downloadAll = useCallback(
    async (items: { id: string; name: string; url: string }[]) => {
      for (const item of items) {
        await downloadTrack(item)
      }
    },
    [downloadTrack]
  )

  const resetTrack = useCallback((id: string) => {
    setDownloads((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  return { downloads, downloadTrack, downloadAll, resetTrack }
}
