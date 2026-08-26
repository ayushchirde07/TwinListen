"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Headphones, Smartphone, Bluetooth, Users, Music, Wifi, Hash, BookOpen, Star, ArrowRight, Zap, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Section 1: Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden flex-grow flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/20 -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl mx-auto space-y-8"
          >
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
              Listen Together, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Anywhere</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground">
              Share your music with two headphones — whether you&apos;re side by side or miles apart.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                <Link href="/sync">
                  <Users className="mr-2 h-5 w-5" />
                  Sync with a Friend
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-2 hover:bg-primary/5 transition-all">
                <Link href="/one-phone">
                  <Headphones className="mr-2 h-5 w-5" />
                  One Phone, Two Headphones
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Two Mode Cards */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            <motion.div variants={fadeIn}>
              <Card className="h-full flex flex-col hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden group">
                <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/50" />
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Smartphone className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Multi-Phone Sync</CardTitle>
                  <CardDescription className="text-base">For when you both have your own devices</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">
                    Create a room, share the code, and listen in perfect sync. Works over Wi-Fi or cellular data, anywhere in the world. Ideal for long-distance listening parties or quiet study sessions.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                    <Link href="/sync">Try Sync Mode <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="h-full flex flex-col hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden group">
                <div className="h-2 w-full bg-gradient-to-r from-secondary to-secondary-foreground/30" />
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bluetooth className="h-7 w-7 text-foreground" />
                  </div>
                  <CardTitle className="text-2xl">One Phone Dual</CardTitle>
                  <CardDescription className="text-base">For sharing a single device</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">
                    Connect two pairs of Bluetooth headphones to a single phone. We&apos;ll guide you through the setup using built-in phone features or recommend the best dual-Bluetooth transmitters.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/one-phone">Learn How <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, straightforward ways to share your audio experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 md:gap-24">
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold flex items-center gap-2 border-b pb-4">
                <Wifi className="text-primary h-6 w-6" /> Sync Mode
              </h3>
              <ul className="space-y-6">
                {[
                  { icon: Hash, text: "Create a private room and get a simple code" },
                  { icon: Users, text: "Your friend joins using the code on their device" },
                  { icon: Music, text: "Play music or video and it stays in perfect sync" }
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {i + 1}
                    </div>
                    <div className="pt-2">
                      <p className="text-foreground font-medium">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold flex items-center gap-2 border-b pb-4">
                <Bluetooth className="text-foreground h-6 w-6" /> One Phone Mode
              </h3>
              <ul className="space-y-6">
                {[
                  { icon: BookOpen, text: "Select your phone type (iOS or Android)" },
                  { icon: Zap, text: "Follow our quick built-in setup guide if supported" },
                  { icon: Star, text: "Or get recommended hardware splitters/transmitters" }
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">
                      {i + 1}
                    </div>
                    <div className="pt-2">
                      <p className="text-foreground font-medium">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Features */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why DualSync?</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Real-time Sync", desc: "Ultra-low latency keeps audio perfectly matched across devices." },
              { icon: Hash, title: "Easy Room Codes", desc: "No complex pairing. Just a simple 6-digit code to connect." },
              { icon: Globe, title: "No App Required", desc: "Works entirely in your web browser. No downloads needed." },
              { icon: BookOpen, title: "Step-by-step Guides", desc: "Clear, illustrated instructions for complex Bluetooth setups." },
              { icon: Star, title: "Expert Recommendations", desc: "Curated lists of the best dual-audio hardware if you need it." },
              { icon: Smartphone, title: "Mobile-First Design", desc: "Looks and works beautifully on any phone, tablet, or desktop." }
            ].map((feature, i) => (
              <Card key={i} className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-3" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Ready to listen together?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
              <Link href="/sync">Start Syncing Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-2">
              <Link href="/one-phone">Explore One Phone Mode</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
