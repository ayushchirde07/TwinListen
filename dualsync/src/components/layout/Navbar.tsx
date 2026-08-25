import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">DualSync</Link>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/sync" className="hover:text-primary transition-colors">Sync Mode</Link>
          <Link href="/one-phone" className="hover:text-primary transition-colors">One Phone Mode</Link>
          <Link href="/transmitters" className="hover:text-primary transition-colors">Transmitters</Link>
          <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
        </div>
      </div>
    </nav>
  );
}
