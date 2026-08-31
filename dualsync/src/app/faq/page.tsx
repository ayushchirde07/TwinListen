"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
}

const faqs = [
  {
    category: "General",
    color: "bg-primary/10 text-primary border-primary/20",
    items: [
      {
        q: "What is DualSync?",
        a: "DualSync is a free web app that helps two or more people listen to the same audio in perfect sync. It offers two modes: Multi-Phone Sync (real-time synchronization over the internet via WebSockets) and One Phone Mode (using a Bluetooth transmitter to connect two headphones to one device).",
      },
      {
        q: "Is DualSync free to use?",
        a: "Yes, completely free. No account needed, no subscription, no ads. Just open the browser and start listening.",
      },
      {
        q: "Does it work on mobile?",
        a: "Absolutely! DualSync is built mobile-first and works on any modern browser — Chrome, Safari, Firefox — on both iOS and Android.",
      },
      {
        q: "Do I need to install anything?",
        a: "No installation required. DualSync runs entirely in your browser. Just visit the website and you're ready to go.",
      },
    ],
  },
  {
    category: "Sync Mode",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    items: [
      {
        q: "How does Sync Mode work?",
        a: "The host creates a room and gets a 6-character code. Friends enter the code on their devices. When the host plays, pauses, or seeks the audio, those actions are broadcast in real-time to all connected listeners via WebSockets — the same technology used in live chat apps.",
      },
      {
        q: "Is there audio delay between devices?",
        a: "There may be a tiny delay of under 1 second due to network latency. DualSync automatically syncs the audio timestamp every 5 seconds to keep all listeners aligned. If a listener drifts by more than 1 second, they are automatically re-synced.",
      },
      {
        q: "How many people can join a room?",
        a: "There is no hard limit. Rooms of 2–10 people work great for casual listening. For very large groups, performance depends on the server load.",
      },
      {
        q: "Do all listeners need to upload the same song?",
        a: "No! When the host uploads an audio file, it is saved on our server and all listeners in the room automatically receive the same file — no manual sharing needed.",
      },
      {
        q: "Can I use my own custom room code?",
        a: "Yes! When creating a room you can type any custom code (4–8 characters) or click the random button to generate one. The code is yours until you leave the room.",
      },
    ],
  },
  {
    category: "One Phone Mode",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    items: [
      {
        q: "What is a Bluetooth transmitter?",
        a: "It is a small device (typically $20–$65) that plugs into your phone's headphone jack or USB-C port and wirelessly broadcasts audio to two Bluetooth headphones simultaneously.",
      },
      {
        q: "Will there be audio lag between the two headphones?",
        a: "No! Since both headphones connect to the same transmitter, they receive the exact same Bluetooth signal at the exact same time. Look for transmitters with the aptX Low Latency codec for the best experience.",
      },
      {
        q: "Which Bluetooth headphones work?",
        a: "Any standard Bluetooth headphones work. The transmitter handles the wireless broadcasting, so your headphones just need to support Bluetooth 4.0 or higher.",
      },
      {
        q: "What if my phone doesn't have a headphone jack?",
        a: "No problem! Many transmitters connect via USB-C instead of a 3.5mm jack. Check our Transmitters page for USB-C compatible options.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    items: [
      {
        q: "Is my uploaded audio stored permanently?",
        a: "No. Uploaded audio files are stored temporarily on our server to serve room listeners and are automatically deleted after the session ends. We do not analyze, share, or retain your audio.",
      },
      {
        q: "Do you collect personal data?",
        a: "No. DualSync requires no account, no email, and no personal information. We only use temporary in-memory session data to maintain your room connection, which disappears when you disconnect.",
      },
      {
        q: "Are room sessions private?",
        a: "Yes. Rooms are only accessible to people who know the code. Codes are random and not listed anywhere publicly.",
      },
    ],
  },
]

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-secondary/50 transition-colors"
      >
        <span className="font-semibold text-sm md:text-base">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  const toggle = (key: string) => setOpenItem(openItem === key ? null : key)

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-24 px-4 bg-gradient-to-b from-primary/10 to-background text-center">
        <div className="container max-w-3xl mx-auto space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Frequently Asked <span className="text-primary">Questions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground"
          >
            Everything you need to know about DualSync. Can't find an answer? Check out our guides.
          </motion.p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 px-4">
        <div className="container max-w-3xl mx-auto space-y-14">
          {faqs.map((section, si) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.08, duration: 0.4 }}
              className="space-y-4"
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${section.color}`}>
                {section.category}
              </div>
              <div className="space-y-3">
                {section.items.map((item, ii) => {
                  const key = `${si}-${ii}`
                  return (
                    <FAQItem
                      key={key}
                      q={item.q}
                      a={item.a}
                      isOpen={openItem === key}
                      onToggle={() => toggle(key)}
                    />
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-t from-primary/10 to-background">
        <motion.div {...fadeUp} className="container max-w-xl mx-auto text-center space-y-5">
          <h2 className="text-2xl font-bold">Still have questions?</h2>
          <p className="text-muted-foreground">Our step-by-step guide walks through both modes in detail.</p>
          <Link href="/how-it-works">
            <Button size="lg" className="gap-2">
              Read How It Works <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
