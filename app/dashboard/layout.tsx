import { Bell, BusFront, Menu } from "lucide-react"

import  AppSidebar  from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>

            <div className="flex items-center gap-2.5">
              <BusFront className="size-5 text-[#512978]" />

              <span className="font-semibold text-slate-900">
                CairoRoute
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </header>

        <main className="min-w-0 flex-1 bg-slate-100 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}