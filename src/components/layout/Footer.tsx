export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/20 bg-brand-gradient py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <img
            src="/logo.png"
            alt="Cognify"
            className="h-8 w-auto object-contain"
          />
          <span className="text-lg font-bold text-brand-ivory">Cognify™</span>
        </div>
        <p className="text-sm text-brand-ivory/80">
          © {year} Cognify. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
