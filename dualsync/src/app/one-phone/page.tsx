"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Bluetooth, Headphones, Smartphone, CheckCircle, ArrowRight,
  Zap, Volume2, Wifi, ShoppingBag, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    icon: <ShoppingBag className="h-6 w-6" />,
    title: "Get a Dual Bluetooth Transmitter",
    description:
      "Buy a Bluetooth transmitter that supports dual pairing (connecting to two headphones at once). We recommend a few great options on our Transmitters page.",
    tip: "Look for \"dual link\" or \"multi-point\" in the product description.",
  },
  {
    number: "02",
    icon: <Headphones className="h-6 w-6" />,
    title: "Pair Both Headphones",
    description:
      "Turn on the transmitter and pair your first pair of headphones. Then pair the second pair. Most transmitters have a dedicated dual-mode button.",
    tip: "Keep headphones close to the transmitter during pairing for best results.",
  },
  {
    number: "03",
    icon: <Smartphone className="h-6 w-6" />,
    title: "Plug the Transmitter into Your Phone",
    description:
      "Connect the transmitter to your phone's headphone jack (3.5mm) or USB-C port using the included cable. Your phone treats it like regular headphones.",
    tip: "No Bluetooth needed on your phone — it connects via the headphone jack.",
  },
  {
    number: "04",
    icon: <Volume2 className="h-6 w-6" />,
    title: "Play Your Music",
    description:
      "Hit play on any app — Spotify, YouTube, Apple Music — whatever you like. Both headphones will now receive the same audio with near-zero latency.",
    tip: "Works with every app that plays audio, no setup or pairing required.",
  },
]

const pros = [
  "Works with any phone — no app or internet needed",
  "No audio delay between the two headphones",
  "Simple plug-and-play setup in under 2 minutes",
  "Works with any Bluetooth headphones",
  "No battery drain on your phone",
]

const cons = [
  "Requires buying an extra hardware device",
  "Range limited to ~10m from the transmitter",
  "Both listeners must be in the same physical space",
  "Transmitter needs its own battery charged",
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function OnePhonePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
          >
            <Bluetooth className="h-4 w-4" />
            Mode 2 — One Phone, Two Headphones
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            Share Music Without{" "}
            <span className="text-primary">Sharing Your Phone</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Using a small Dual Bluetooth Transmitter, you can connect two
            headphones to a single phone — perfect for watching movies together
            on a plane, sharing music on a walk, or movie nights in bed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/transmitters">
              <Button size="lg" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                See Recommended Transmitters
              </Button>
            </Link>
            <Link href="/sync">
              <Button size="lg" variant="outline" className="gap-2">
                <Wifi className="h-5 w-5" />
                Try Multi-Phone Sync Instead
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />
      </section>

      {/* Visual diagram */}
      <section className="py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div {...fadeUp}>
            <Card className="border-primary/20 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                  {/* Phone */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-12 rounded-xl border-2 border-primary bg-primary/10 flex items-center justify-center">
                      <Smartphone className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Your Phone</span>
                  </div>

                  {/* Arrow + cable */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-0.5 w-16 bg-border hidden md:block" />
                    <span className="text-xs text-muted-foreground">3.5mm / USB-C cable</span>
                    <div className="h-0.5 w-16 bg-border hidden md:block" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground md:rotate-0 rotate-90" />
                  </div>

                  {/* Transmitter */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                      <Bluetooth className="h-10 w-10 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Transmitter</span>
                  </div>

                  {/* Arrows to headphones */}
                  <div className="flex flex-col items-center gap-6">
                    {/* Headphone 1 */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-0.5 w-8 bg-dashed border-t-2 border-dashed border-primary/40" />
                        <span className="text-xs text-muted-foreground">Bluetooth</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full border-2 border-muted bg-secondary flex items-center justify-center">
                          <Headphones className="h-6 w-6" />
                        </div>
                        <span className="text-xs text-muted-foreground">Person 1</span>
                      </div>
                    </div>
                    {/* Headphone 2 */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-0.5 w-8 border-t-2 border-dashed border-primary/40" />
                        <span className="text-xs text-muted-foreground">Bluetooth</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full border-2 border-muted bg-secondary flex items-center justify-center">
                          <Headphones className="h-6 w-6" />
                        </div>
                        <span className="text-xs text-muted-foreground">Person 2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Step-by-step guide */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">How to Set It Up</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Follow these four simple steps and you&apos;ll be sharing audio in under 5 minutes.
            </p>
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex gap-5 items-start">
                      <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono font-bold text-sm">
                        {step.number}
                      </div>
                      <div className="flex-grow space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-primary">{step.icon}</span>
                          <h3 className="text-lg font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-primary">
                          <Zap className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{step.tip}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pros & Cons */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Pros & Cons</h2>
            <p className="text-muted-foreground">Is this the right mode for you?</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div {...fadeUp}>
              <Card className="border-green-500/20 h-full">
                <CardHeader>
                  <CardTitle className="text-green-500 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pros.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Card className="border-orange-500/20 h-full">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {cons.map((c) => (
                      <li key={c} className="flex items-start gap-3 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-t from-primary/10 to-background">
        <motion.div {...fadeUp} className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground">
            Check out our hand-picked list of the best Dual Bluetooth
            Transmitters available right now.
          </p>
          <Link href="/transmitters">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="h-5 w-5" />
              View Recommended Transmitters
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
