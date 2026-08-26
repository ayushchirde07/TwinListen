import React from 'react'
import Link from 'next/link'
import { Headphones } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-background border-t py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Headphones className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tight text-primary">DualSync</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Listen together, anywhere. Share your music with two headphones seamlessly.
            </p>
          </div>
          
          <div className="flex gap-8 text-sm text-muted-foreground">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Product</span>
              <Link href="/sync" className="hover:text-primary transition-colors">Sync Mode</Link>
              <Link href="/one-phone" className="hover:text-primary transition-colors">One Phone Mode</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Company</span>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DualSync. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
