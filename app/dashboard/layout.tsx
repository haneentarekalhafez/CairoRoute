"use client"

import { useState } from "react"
import {
  Bell,
  BusFront,
  Menu,
  X,
} from "lucide-react"

import AppSidebar from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  return (
    <div className="flex min-h-dvh w-full max-w-full overflow-hidden bg-white">
      {/* =========================================
          DESKTOP SIDEBAR
          ========================================= */}

      <div className="hidden h-dvh shrink-0 md:block">
        <AppSidebar />
      </div>

      {/* =========================================
          MOBILE SIDEBAR
          ========================================= */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* DARK BACKDROP */}

          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="absolute inset-0 bg-black/40"
          />

          {/* SIDEBAR */}

          <div className="absolute inset-y-0 left-0 z-10 w-[272px] max-w-[85vw] shadow-2xl">
            <AppSidebar
              className="w-full"
              onNavigate={() =>
                setMobileMenuOpen(false)
              }
            />

            {/* CLOSE BUTTON */}

            <button
              type="button"
              aria-label="Close menu"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          PAGE AREA
          ========================================= */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* MOBILE MENU BUTTON */}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="shrink-0 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="size-5" />

              <span className="sr-only">
                Open menu
              </span>
            </Button>

            {/* HEADER BRAND */}

            <div className="flex min-w-0 items-center gap-2.5">
              <BusFront className="size-5 shrink-0 text-[#512978]" />

              <span className="truncate font-semibold text-slate-900">
                CairoRoute
              </span>
            </div>
          </div>

          {/* NOTIFICATIONS */}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="size-5" />

            <span className="sr-only">
              Notifications
            </span>
          </Button>
        </header>

        {/* =========================================
            PAGE CONTENT
            ========================================= */}

        <main className="min-w-0 max-w-full flex-1 overflow-x-hidden bg-slate-100 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}