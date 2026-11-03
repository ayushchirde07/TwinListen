"use client"

// components/DownloadButton.tsx
// Per-track download button with animated progress ring

import React from "react"
import { motion } from "framer-motion"
import { Download, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DownloadState } from "@/hooks/useDownloadManager"

interface DownloadButtonProps {
  state?: DownloadState
  onDownload: () => void
  onReset?: () => void
  size?: "sm" | "xs"
  className?: string
  title?: string
}

const RADIUS = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function DownloadButton({
  state,
  onDownload,
  onReset,
  size = "xs",
  className = "",
  title = "Download for offline listening",
}: DownloadButtonProps) {
  const status = state?.status ?? "idle"
  const progress = state?.progress ?? 0

  const btnClass =
    size === "xs"
      ? "h-7 w-7 rounded-full"
      : "h-8 w-8 rounded-full"

  if (status === "downloading") {
    const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE
    return (
      <div className={`relative flex items-center justify-center ${btnClass} ${className}`} title={`Downloading… ${progress}%`}>
        <svg width="28" height="28" className="absolute inset-0 -rotate-90">
          <circle cx="14" cy="14" r={RADIUS} fill="none" stroke="hsl(var(--secondary))" strokeWidth="2.5" />
          <motion.circle
            cx="14"
            cy="14"
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset }}
            transition={{ ease: "linear", duration: 0.3 }}
          />
        </svg>
        <Loader2 className="h-3 w-3 text-primary animate-spin" />
      </div>
    )
  }

  if (status === "done") {
    return (
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center justify-center ${btnClass} bg-primary/10 text-primary ${className}`}
        title="Saved to Offline Library"
      >
        <Check className="h-3 w-3" />
      </motion.div>
    )
  }

  if (status === "error") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`${btnClass} text-destructive hover:text-destructive hover:bg-destructive/10 ${className}`}
        title={`Download failed. Click to retry.`}
        onClick={onReset ?? onDownload}
      >
        <AlertCircle className="h-3 w-3" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${btnClass} hover:bg-primary/10 hover:text-primary ${className}`}
      title={title}
      onClick={onDownload}
    >
      <Download className="h-3 w-3" />
    </Button>
  )
}
