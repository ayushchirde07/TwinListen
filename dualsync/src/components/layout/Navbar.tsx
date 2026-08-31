"use client"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Headphones, Menu, X, ChevronDown, BookOpen, HelpCircle, Bluetooth } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

const primaryLinks = [
  { href: "/sync", label: "Sync Mode" },
  { href: "/one-phone", label: "One Phone Mode" },
]

const moreLinks = [
  { href: "/transmitters", label: "Transmitters", icon: <Bluetooth className="h-4 w-4" />, desc: "Hardware recommendations" },
  { href: "/how-it-works", label: "How It Works", icon: <BookOpen className="h-4 w-4" />, desc: "Step-by-step guide" },
  { href: "/faq", label: "FAQ", icon: <HelpCircle className="h-4 w-4" />, desc: "Common questions answered" },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const navLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary ${pathname === href ? "text-primary" : "text-foreground/70"}`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Headphones className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-primary">DualSync</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {primaryLinks.map((l) => navLink(l.href, l.label))}

            {/* More dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary ${moreLinks.some(l => l.href === pathname) ? "text-primary" : "text-foreground/70"}`}
              >
                More
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-background/95 backdrop-blur shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {moreLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-colors ${pathname === l.href ? "text-primary bg-primary/5" : ""}`}
                    >
                      <span className="mt-0.5 text-primary">{l.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{l.label}</p>
                        <p className="text-xs text-muted-foreground">{l.desc}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="border-t">
                    <Link
                      href="/about"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-sm font-semibold ${pathname === "/about" ? "text-primary" : ""}`}
                    >
                      About DualSync
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <ModeToggle />
          </div>

          {/* Mobile controls */}
          <div className="-mr-2 flex md:hidden items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-accent focus:outline-none"
            >
              <span className="sr-only">Open menu</span>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-b bg-background" id="mobile-menu">
          <div className="px-3 pt-2 pb-4 space-y-1" onClick={() => setMobileOpen(false)}>
            {primaryLinks.map((l) => (
              <Link key={l.href} href={l.href} className={`block px-3 py-2.5 rounded-md text-base font-medium hover:text-primary hover:bg-secondary transition-colors ${pathname === l.href ? "text-primary bg-primary/5" : ""}`}>
                {l.label}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            {moreLinks.map((l) => (
              <Link key={l.href} href={l.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium hover:text-primary hover:bg-secondary transition-colors ${pathname === l.href ? "text-primary bg-primary/5" : ""}`}>
                <span className="text-primary">{l.icon}</span> {l.label}
              </Link>
            ))}
            <Link href="/about" className={`block px-3 py-2.5 rounded-md text-base font-medium hover:text-primary hover:bg-secondary transition-colors ${pathname === "/about" ? "text-primary bg-primary/5" : ""}`}>
              About
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
