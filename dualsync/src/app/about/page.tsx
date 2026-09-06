"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Zap, Globe, Heart, Lock, Wifi, Bluetooth, ArrowRight, Code2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const techStack = [
  { emoji: "⚡", name: "Next.js 14", desc: "React framework with App Router", color: "border-gray-500/30" },
  { emoji: "🔌", name: "Socket.io", desc: "Real-time WebSocket connections", color: "border-blue-500/30" },
  { emoji: "🎨", name: "Framer Motion", desc: "Smooth animations & transitions", color: "border-pink-500/30" },
  { emoji: "🎯", name: "Tailwind CSS", desc: "Utility-first styling", color: "border-cyan-500/30" },
  { emoji: "🧩", name: "Shadcn/ui", desc: "Accessible UI components", color: "border-purple-500/30" },
  { emoji: "🔷", name: "TypeScript", desc: "Type-safe codebase", color: "border-blue-400/30" },
  { emoji: "🚂", name: "Express.js", desc: "Custom Node.js server", color: "border-green-500/30" },
  { emoji: "📦", name: "Multer", desc: "Audio file upload handling", color: "border-yellow-500/30" },
]

const missions = [
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "No Friction",
    desc: "No app download, no account needed. Just open the browser, share a code, and start listening. That's it.",
  },
  {
    icon: <Lock className="h-6 w-6 text-primary" />,
    title: "Free Forever",
    desc: "DualSync will always be free. Music is better when it's shared, and shared things shouldn't have a price tag.",
  },
  {
    icon: <Globe className="h-6 w-6 text-primary" />,
    title: "Works Everywhere",
    desc: "Any device, any browser, any song. Whether you're on a flight or across the world, DualSync has you covered.",
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-28 px-4 bg-gradient-to-b from-primary/10 to-background text-center">
        <div className="container max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-7xl"
          >
            🎵
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            About <span className="text-primary">DualSync</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-xl text-muted-foreground max-w-xl mx-auto"
          >
            Born from the frustration of trying to share music with a friend on a long flight.
          </motion.p>
        </div>
      </section>

      {/* The Story */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div {...fadeUp}>
            <Card className="border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-2 bg-gradient-to-r from-primary to-purple-400" />
                <div className="p-8 md:p-12 space-y-5">
                  <h2 className="text-2xl font-bold">The Story</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      It started on a 6-hour flight. We wanted to watch the same movie and
                      listen to the same music together — but sharing one pair of earphones
                      is awkward, and syncing two phones manually is nearly impossible.
                    </p>
                    <p>
                      We looked for an app. Nothing existed that was simple, free, and
                      worked without accounts or installs. So we built DualSync.
                    </p>
                    <p>
                      We built two solutions: a <strong className="text-foreground">real-time sync engine</strong> for when
                      you're apart — using WebSockets so every play, pause, and seek is
                      broadcast instantly to everyone in the room — and a <strong className="text-foreground">hardware guide</strong> for
                      when you're together, using a dual Bluetooth transmitter to share
                      audio from a single phone with zero lag.
                    </p>
                    <p className="flex items-center gap-2 text-primary font-medium">
                      <Heart className="h-4 w-4" />
                      Music is better shared. DualSync makes that effortless.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container max-w-4xl mx-auto space-y-12">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground">Three principles that guide everything we build.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {missions.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
              >
                <Card className="h-full text-center border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="p-8 space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      {m.icon}
                    </div>
                    <h3 className="font-bold text-xl">{m.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto space-y-12">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Code2 className="h-4 w-4" /> Built With
            </div>
            <h2 className="text-3xl font-bold">The Tech Stack</h2>
            <p className="text-muted-foreground">Modern tools chosen for performance, developer experience, and reliability.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <Card className={`h-full text-center hover:scale-105 transition-transform border ${tech.color}`}>
                  <CardContent className="p-5 space-y-2">
                    <span className="text-3xl">{tech.emoji}</span>
                    <p className="font-bold text-sm">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">{tech.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Modes Recap */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container max-w-4xl mx-auto space-y-10">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="text-3xl font-bold">Two Ways to Listen Together</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Card className="h-full border-primary/30">
                <CardContent className="p-8 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wifi className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Mode 1 — Multi-Phone Sync</h3>
                  <p className="text-muted-foreground text-sm">
                    Each person uses their own phone. Audio controls are synchronized over the internet via WebSockets. Perfect for long-distance listening.
                  </p>
                  <Link href="/sync">
                    <Button className="gap-2 mt-2">
                      Try It Now <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Card className="h-full">
                <CardContent className="p-8 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Bluetooth className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Mode 2 — One Phone Dual</h3>
                  <p className="text-muted-foreground text-sm">
                    A small Bluetooth transmitter connects two headphones to one phone. No internet needed, zero lag. Perfect for flights, walks, and movie nights.
                  </p>
                  <Link href="/one-phone">
                    <Button variant="outline" className="gap-2 mt-2">
                      Setup Guide <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-t from-primary/10 to-background">
        <motion.div {...fadeUp} className="container max-w-xl mx-auto text-center space-y-6">
          <span className="text-5xl">🎧</span>
          <h2 className="text-3xl font-bold">Start Listening Together</h2>
          <p className="text-muted-foreground">No setup, no account. Just you, a friend, and music.</p>
          <Link href="/sync">
            <Button size="lg" className="gap-2">
              Open Sync Room <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
