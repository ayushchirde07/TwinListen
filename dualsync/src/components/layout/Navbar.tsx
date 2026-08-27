"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Headphones, Menu, X } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Headphones className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tight text-primary">DualSync</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/sync" className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Sync Mode</Link>
              <Link href="/one-phone" className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">One Phone Mode</Link>
              <Link href="/about" className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
              <ModeToggle />
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b">
            <Link href="/sync" className="hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Sync Mode</Link>
            <Link href="/one-phone" className="hover:text-primary block px-3 py-2 rounded-md text-base font-medium">One Phone Mode</Link>
            <Link href="/about" className="hover:text-primary block px-3 py-2 rounded-md text-base font-medium">About</Link>
            <div className="px-3 py-2">
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
