"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  Star, ExternalLink, Bluetooth, Battery, Zap, Wifi,
  CheckCircle, ShoppingCart, Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Category = "all" | "budget" | "mid" | "premium"

const products = [
  {
    id: 1,
    category: "budget",
    name: "1Mii ML100 Bluetooth Transmitter",
    badge: "Best Budget",
    badgeColor: "bg-green-500",
    rating: 4.3,
    reviews: 8240,
    price: "$22",
    image: "🎵",
    description:
      "A reliable entry-level transmitter with dual-link support. Connects to two Bluetooth headphones simultaneously with aptX Low Latency codec for near-zero audio delay.",
    highlights: ["aptX Low Latency", "10m range", "USB-powered", "3.5mm + optical input"],
    amazonUrl: "https://www.amazon.com/s?k=1mii+ml100+bluetooth+transmitter",
    pros: ["Very affordable", "Easy to use", "Low latency codec"],
    cons: ["Plastic build quality", "Shorter battery life"],
  },
  {
    id: 2,
    category: "mid",
    name: "Avantree Orbit Bluetooth 5.0 Transmitter",
    badge: "Best Overall",
    badgeColor: "bg-primary",
    rating: 4.6,
    reviews: 12500,
    price: "$45",
    image: "🔵",
    description:
      "The gold standard for dual Bluetooth audio. Supports aptX HD and aptX Low Latency, connects to two devices simultaneously, and has an impressive 30m range.",
    highlights: ["aptX HD + Low Latency", "30m range", "15hr battery", "3.5mm + RCA + Optical"],
    amazonUrl: "https://www.amazon.com/s?k=avantree+orbit+bluetooth+transmitter",
    pros: ["Excellent range", "Long battery life", "Multiple input ports", "Premium codecs"],
    cons: ["Slightly bulkier than others"],
  },
  {
    id: 3,
    category: "mid",
    name: "Jabra Link 380 USB Adapter",
    badge: "Best for USB-C",
    badgeColor: "bg-blue-500",
    rating: 4.4,
    reviews: 5100,
    price: "$38",
    image: "💻",
    description:
      "A compact USB-C Bluetooth adapter that works perfectly for phones without a headphone jack. Plug-and-play with no drivers needed and supports Bluetooth 5.0.",
    highlights: ["USB-C native", "BT 5.0", "Compact dongle design", "Wide compatibility"],
    amazonUrl: "https://www.amazon.com/s?k=jabra+link+380+usb+bluetooth",
    pros: ["No headphone jack needed", "Extremely compact", "Reliable connection"],
    cons: ["No optical input", "Shorter range ~10m"],
  },
  {
    id: 4,
    category: "premium",
    name: "Avantree Audikast Plus Bluetooth Transmitter",
    badge: "Premium Pick",
    badgeColor: "bg-purple-500",
    rating: 4.7,
    reviews: 6800,
    price: "$65",
    image: "🏆",
    description:
      "The best of the best. Incredibly long 40m range, simultaneous dual Bluetooth 5.0 connections, and the highest quality aptX HD codec. Perfect for home cinema setups.",
    highlights: ["40m range", "aptX HD", "Dual BT 5.0", "10hr battery", "TV/PC/Phone compatible"],
    amazonUrl: "https://www.amazon.com/s?k=avantree+audikast+plus+transmitter",
    pros: ["Massive range", "Best audio quality", "Rock-solid connection"],
    cons: ["Most expensive option", "Overkill for casual use"],
  },
  {
    id: 5,
    category: "budget",
    name: "TaoTronics TT-BA07 Bluetooth Adapter",
    badge: "Great Value",
    badgeColor: "bg-yellow-500",
    rating: 4.1,
    reviews: 15200,
    price: "$18",
    image: "💛",
    description:
      "One of the most popular budget transmitters. Simple pairing, decent range, and rechargeable battery. Ideal for casual use and short trips.",
    highlights: ["Simple pairing", "8hr battery", "3.5mm input", "USB rechargeable"],
    amazonUrl: "https://www.amazon.com/s?k=taotronics+tt-ba07+bluetooth",
    pros: ["Very affordable", "Compact & lightweight", "Easy setup"],
    cons: ["Basic codec (SBC only)", "No dual audio official support — workaround needed"],
  },
  {
    id: 6,
    category: "premium",
    name: "Sennheiser BTD 600 USB-A/C Dongle",
    badge: "Best Brand",
    badgeColor: "bg-red-500",
    rating: 4.8,
    reviews: 2100,
    price: "$79",
    image: "🎧",
    description:
      "Sennheiser's premium Bluetooth audio dongle. Supports their proprietary high-quality codec alongside aptX and SBC. Great for audiophiles who want the cleanest sound.",
    highlights: ["USB-A + USB-C adapters included", "aptX codec", "Compact & premium build", "Low latency"],
    amazonUrl: "https://www.amazon.com/s?k=sennheiser+btd+600",
    pros: ["Premium sound quality", "Trusted brand", "Dual USB ports included"],
    cons: ["Most expensive", "Primarily single-device focused"],
  },
]

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "All Transmitters" },
  { key: "budget", label: "Budget (Under $30)" },
  { key: "mid", label: "Mid-Range ($30–$60)" },
  { key: "premium", label: "Premium ($60+)" },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating} ({(rating * 1000).toLocaleString()}+)</span>
    </div>
  )
}

export default function TransmittersPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all")

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory)

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl mx-auto text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
          >
            <Bluetooth className="h-4 w-4" />
            Dual Bluetooth Transmitters
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            The Best Transmitters for{" "}
            <span className="text-primary">Shared Listening</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            We've tested and researched the best Dual Bluetooth Transmitters so
            you don't have to. Every product below supports connecting two
            Bluetooth headphones at once.
          </motion.p>
        </div>
      </section>

      {/* What to look for */}
      <section className="py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Bluetooth className="h-6 w-6 text-primary" />, label: "Dual Link", desc: "Connects 2 headphones simultaneously" },
              { icon: <Zap className="h-6 w-6 text-primary" />, label: "Low Latency", desc: "aptX LL codec for zero audio lag" },
              { icon: <Wifi className="h-6 w-6 text-primary" />, label: "Good Range", desc: "At least 10m for freedom of movement" },
              { icon: <Battery className="h-6 w-6 text-primary" />, label: "Battery Life", desc: "8+ hours for all-day use" },
            ].map((item) => (
              <Card key={item.label} className="text-center p-4">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-center">{item.icon}</div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="py-4 px-4 sticky top-16 z-30 bg-background/80 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            {categories.map((cat) => (
              <Button
                key={cat.key}
                variant={activeCategory === cat.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.key)}
                className="shrink-0"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-12 px-4">
        <div className="container max-w-4xl mx-auto space-y-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <Card className="overflow-hidden hover:border-primary/30 transition-colors group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left accent + emoji */}
                    <div className="md:w-48 flex-shrink-0 bg-gradient-to-br from-primary/10 to-purple-900/20 flex flex-col items-center justify-center p-8 gap-3">
                      <span className="text-6xl">{product.image}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${product.badgeColor}`}>
                        {product.badge}
                      </span>
                    </div>

                    {/* Main content */}
                    <div className="flex-grow p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <StarRating rating={product.rating} />
                        </div>
                        <div className="text-2xl font-extrabold text-primary">{product.price}</div>
                      </div>

                      <p className="text-muted-foreground text-sm">{product.description}</p>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2">
                        {product.highlights.map((h) => (
                          <span key={h} className="text-xs bg-secondary border border-border px-2 py-1 rounded-full font-medium">
                            {h}
                          </span>
                        ))}
                      </div>

                      {/* Pros/Cons + CTA */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-border">
                        <div className="flex flex-wrap gap-4 text-xs">
                          <div className="space-y-1">
                            {product.pros.map((p) => (
                              <div key={p} className="flex items-center gap-1.5 text-green-500">
                                <CheckCircle className="h-3 w-3" /> {p}
                              </div>
                            ))}
                          </div>
                        </div>

                        <a
                          href={product.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="gap-2 whitespace-nowrap">
                            <ShoppingCart className="h-4 w-4" />
                            Buy on Amazon
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            📌 Prices and availability may vary. Links above are Amazon search links — we are not affiliated with any brand. Always check current reviews before purchasing.
          </p>
        </div>
      </section>
    </main>
  )
}
