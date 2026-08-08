"use client"

import { useEffect, useState } from "react"
import { Bell, Menu, X } from "lucide-react"

import AppSidebar from "@/components/app-sidebar"
import CairoRouteLogo from "@/components/cairoroute-logo"
import { Button } from "@/components/ui/button"

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!mobileMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-dvh bg-[#f7f5f8] text-slate-900">
      <div className="mx-auto flex min-h-dvh w-full">
        <div className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-[#e8e3eb] lg:block">
          <AppSidebar />
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-[#1f1428]/55 backdrop-blur-[2px]"
            />

            <div className="relative h-full w-[min(86vw,320px)] overflow-hidden border-r border-white/10 bg-[#fbfafc] shadow-2xl">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-900"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>

              <AppSidebar
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:pl-[272px]">
          <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-[#e7e2ea]/90 bg-[#fbfafc]/92 px-4 backdrop-blur-xl sm:px-6 lg:h-[76px] lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="size-10 rounded-xl border border-[#e9e4ec] bg-white text-slate-600 shadow-sm hover:bg-[#f2edf6] hover:text-[#512978] lg:hidden"
              >
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>

              <div className="lg:hidden">
                <CairoRouteLogo />
              </div>

              <div className="hidden lg:block">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8c6ba3]">
                  CairoRoute Passenger
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-500">
                  Plan, book and manage your city trips.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative size-10 rounded-xl border border-[#e9e4ec] bg-white text-slate-500 shadow-sm hover:bg-[#f2edf6] hover:text-[#512978]"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-[#8f4bc0] ring-2 ring-white" />
              <span className="sr-only">Notifications</span>
            </Button>
          </header>

          <main className="min-w-0 flex-1 overflow-x-hidden">
            <div className="relative min-h-full px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[280px] opacity-75"
                style={{
                  background:
                    "radial-gradient(circle at 78% -30%, rgba(137, 89, 178, 0.14), transparent 50%), radial-gradient(circle at 10% 0%, rgba(81, 41, 120, 0.08), transparent 42%)",
                }}
              />

              <div className="relative min-w-0">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}