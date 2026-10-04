import { ShieldCheck } from 'lucide-react'

function Logo() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-600/30">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="9" height="9" rx="1" />
        <path d="M15 10h5v5" />
        <path d="M20 10l-6.5 6.5" />
      </svg>
    </div>
  )
}

export default function Header() {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900">Image Resizer</h1>
          </div>
        </div>

      </div>
      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-1.5 text-xs text-slate-500 sm:px-6">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>100% private — your images are processed on-device and never uploaded anywhere.</span>
        </div>
      </div>
    </header>
  )
}
