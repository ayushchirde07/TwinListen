export function Footer() {
  return (
    <footer className="border-t bg-muted/20 py-8 mt-12">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DualSync. All rights reserved.</p>
      </div>
    </footer>
  );
}
