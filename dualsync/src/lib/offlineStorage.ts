// lib/offlineStorage.ts
// IndexedDB wrapper for DualSync offline audio library

const DB_NAME = "dualsync-offline"
const DB_VERSION = 1
const STORE_TRACKS = "tracks"
const STORE_HISTORY = "history"

export interface OfflineTrack {
  id: string
  name: string
  blob: Blob
  mimeType: string
  sizeBytes: number
  duration?: number
  downloadedAt: string // ISO string
  source: "upload" | "youtube" | "url"
}

export interface DownloadHistoryEntry {
  id: string
  name: string
  sizeBytes: number
  downloadedAt: string
  source: "upload" | "youtube" | "url"
  status: "success" | "failed"
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        db.createObjectStore(STORE_HISTORY, { keyPath: "id" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Tracks

export async function saveOfflineTrack(track: OfflineTrack): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, "readwrite")
    const store = tx.objectStore(STORE_TRACKS)
    const req = store.put(track)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getAllOfflineTracks(): Promise<Omit<OfflineTrack, "blob">[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, "readonly")
    const store = tx.objectStore(STORE_TRACKS)
    const req = store.getAll()
    req.onsuccess = () => {
      const results = (req.result as OfflineTrack[]).map(({ blob: _blob, ...meta }) => meta)
      resolve(results)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getOfflineTrackBlob(id: string): Promise<Blob | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, "readonly")
    const store = tx.objectStore(STORE_TRACKS)
    const req = store.get(id)
    req.onsuccess = () => {
      const track = req.result as OfflineTrack | undefined
      resolve(track?.blob ?? null)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deleteOfflineTrack(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, "readwrite")
    const store = tx.objectStore(STORE_TRACKS)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function isTrackOffline(id: string): Promise<boolean> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, "readonly")
    const store = tx.objectStore(STORE_TRACKS)
    const req = store.count(id)
    req.onsuccess = () => resolve(req.result > 0)
    req.onerror = () => reject(req.error)
  })
}

// History

export async function addDownloadHistory(entry: DownloadHistoryEntry): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_HISTORY, "readwrite")
    const store = tx.objectStore(STORE_HISTORY)
    const req = store.put(entry)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getDownloadHistory(): Promise<DownloadHistoryEntry[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_HISTORY, "readonly")
    const store = tx.objectStore(STORE_HISTORY)
    const req = store.getAll()
    req.onsuccess = () => {
      const sorted = (req.result as DownloadHistoryEntry[]).sort(
        (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
      )
      resolve(sorted)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function clearDownloadHistory(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_HISTORY, "readwrite")
    const store = tx.objectStore(STORE_HISTORY)
    const req = store.clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// Utilities

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function detectSource(url: string): "upload" | "youtube" | "url" {
  if (url.includes("/audio/")) return "upload"
  if (url.includes("youtube-stream") || url.includes("youtube.com") || url.includes("youtu.be"))
    return "youtube"
  return "url"
}
