"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Wifi, Bluetooth, Plus, LogIn, Music, Play,
  ArrowRight, CheckCircle, X, Smartphone, Server, Headphones
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const mode1Steps = [
  {
    icon: <Plus className="h-6 w-6" />,
    title: "Host creates a room",
    desc: "One person visits DualSync, clicks 'Create Room', and gets a unique 6-character code in under a second.",
  },
  {
    icon: <LogIn className="h-6 w-6" />,
    title: "Friends join with the code",
    desc: "Everyone else opens DualSync on their own device and types in the code. No app download, no account needed.",
  },
  {
    icon: <Music className="h-6 w-6" />,
    title: "Music syncs in real-time",
    desc: "The host uploads a song or pastes a URL. When they hit Play, Pause, or seek — every listener's device reacts instantly.",
  },
]

const mode2Steps = [
  { num: "01", title: "Get a dual Bluetooth transmitter", desc: "A small device ($20–$65) that wirelessly streams to two headphones at once. Check our recommendations." },
  { num: "02", title: "Pair both headphones", desc: "Turn on the transmitter and pair Headphone A, then Headphone B. Most devices have a dedicated dual-mode button." },
  { num: "03", title: "Plug into your phone", desc: "Connect the transmitter to your phone's 3.5mm or USB-C port. Your phone thinks it's regular headphones." },
  { num: "04", title: "Hit play — both hear it!", desc: "Open Spotify, YouTube, or any app. Both headphones receive the exact same audio with zero lag between them." },
]

const comparisonRows = [
  { label: "Works over the internet", m1: true, m2: false },
  { label: "Needs extra hardware", m1: false, m2: true },
  { label: "Audio delay between listeners", m1: "< 1 second", m2: "None" },
  { label: "Max range", m1: "Worldwide", m2: "~10 meters" },
  { label: "Setup time", m1: "30 seconds", m2: "~5 minutes" },
  { label: "Number of listeners", m1: "Unlimited", m2: "2 people" },
  { label: "Cost", m1: "Free", m2: "$20–$65 hardware" },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-24 px-4 bg-gradient-to-b from-primary/10 to-background text-center">
        <div className="container max-w-3xl mx-auto space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
          >
            Two modes. One goal.
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            How <span className="text-primary">DualSync</span> Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground"
          >
            DualSync offers two completely different solutions depending on whether
            your listening partner is across the room or across the world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
              <Wifi className="h-4 w-4" /> Mode 1: Multi-Phone Sync
            </div>
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary border font-semibold text-sm">
              <Bluetooth className="h-4 w-4" /> Mode 2: One Phone Dual
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mode 1 */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto space-y-12">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
              <Wifi className="h-4 w-4" /> Mode 1
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Multi-Phone Sync</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each person uses their own phone. Audio is synchronized in real-time over the internet using WebSockets.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6">
            {mode1Steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
              >
                <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {step.icon}
                      </div>
                      <span className="text-4xl font-black text-primary/20 font-mono">0{i + 1}</span>
                    </div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Network diagram */}
          <motion.div {...fadeUp}>
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wider">How the signal travels</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-12 rounded-xl border-2 border-primary bg-primary/10 flex items-center justify-center">
                      <Smartphone className="h-7 w-7 text-primary" />
                    </div>
                    <span className="text-xs font-medium">Host&apos;s Phone</span>
                    <span className="text-xs text-muted-foreground">Plays & controls</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary/40">
                    <div className="h-0.5 w-8 bg-primary/30 hidden md:block" />
                    <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                      <Server className="h-7 w-7 text-primary" />
                    </div>
                    <span className="text-xs font-medium">DualSync Server</span>
                    <span className="text-xs text-muted-foreground">Broadcasts events</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary/40">
                    <div className="h-0.5 w-8 bg-primary/30 hidden md:block" />
                    <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
                  </div>
                  <div className="flex flex-col gap-3">
                    {[1, 2].map((n) => (
                      <div key={n} className="flex flex-col items-center gap-1">
                        <div className="h-12 w-10 rounded-xl border-2 border-muted bg-secondary flex items-center justify-center">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <span className="text-xs text-muted-foreground">Listener {n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp} className="text-center">
            <Link href="/sync">
              <Button size="lg" className="gap-2">
                <Play className="h-5 w-5" /> Try Sync Mode Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Mode 2 */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container max-w-4xl mx-auto space-y-12">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border text-sm font-bold">
              <Bluetooth className="h-4 w-4 text-primary" /> Mode 2
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">One Phone Dual</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Use a $20–$65 Bluetooth transmitter to connect two headphones to a single phone. Zero lag, no internet required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {mode2Steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 flex gap-4">
                    <span className="text-5xl font-black text-primary/15 font-mono shrink-0">{step.num}</span>
                    <div className="space-y-1">
                      <h3 className="font-bold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center">
            <Link href="/one-phone">
              <Button size="lg" variant="outline" className="gap-2">
                <Headphones className="h-5 w-5" /> Full Setup Guide
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto space-y-10">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Which Mode is Right for You?</h2>
            <p className="text-muted-foreground">A side-by-side comparison of both options.</p>
          </motion.div>

          <motion.div {...fadeUp}>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-secondary/50">
                      <th className="text-left p-4 font-semibold text-muted-foreground w-1/2">Feature</th>
                      <th className="p-4 font-bold text-primary text-center">
                        <div className="flex items-center justify-center gap-1.5"><Wifi className="h-4 w-4" /> Mode 1</div>
                      </th>
                      <th className="p-4 font-bold text-center">
                        <div className="flex items-center justify-center gap-1.5"><Bluetooth className="h-4 w-4" /> Mode 2</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr key={row.label} className={`border-b last:border-0 ${i % 2 === 0 ? "" : "bg-secondary/20"}`}>
                        <td className="p-4 font-medium">{row.label}</td>
                        <td className="p-4 text-center">
                          {typeof row.m1 === "boolean" ? (
                            row.m1 ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-primary font-semibold">{row.m1}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof row.m2 === "boolean" ? (
                            row.m2 ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="font-semibold">{row.m2}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-t from-primary/10 to-background">
        <motion.div {...fadeUp} className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Listen Together?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sync">
              <Button size="lg" className="gap-2">
                <Wifi className="h-5 w-5" /> Try Sync Mode
              </Button>
            </Link>
            <Link href="/one-phone">
              <Button size="lg" variant="outline" className="gap-2">
                <Bluetooth className="h-5 w-5" /> One Phone Mode
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
