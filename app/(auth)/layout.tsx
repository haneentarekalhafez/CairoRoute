import Link from "next/link"
import { BusFront } from "lucide-react"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* Image side */}
        <section
          className="relative hidden min-h-screen overflow-hidden bg-slate-900 bg-cover bg-center bg-no-repeat lg:block"
          style={{
            backgroundImage: "url('/images/cairo-bus.jpeg')",
          }}
        >
          {/* Dark layer */}
          <div className="absolute inset-0 bg-slate-950/55" />

          {/* Subtle purple tint */}
          <div className="absolute inset-0 bg-[#2d173f]/30" />

          {/* Blended fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/30" />

          <div className="relative flex min-h-screen flex-col justify-between p-10 text-white xl:p-14">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-white text-[#512978] shadow-sm">
                <BusFront className="size-6" />
              </div>

              <div>
                <p className="text-xl font-semibold">CairoRoute</p>
                <p className="text-xs text-white/70">
                  Transportation across Cairo
                </p>
              </div>
            </Link>

            <div className="max-w-xl pb-6">
              <p className="text-sm font-medium text-white/70">
                Reliable private transportation
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight xl:text-5xl">
                Move around Cairo with more confidence.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
                Find nearby pickup points, explore suitable bus routes, reserve
                your seat, and manage your trips from one place.
              </p>
            </div>

            <p className="text-sm text-white/60">
              CairoRoute passenger platform
            </p>
          </div>
        </section>

        {/* Login/signup form side */}
        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#512978] text-white">
                <BusFront className="size-5" />
              </div>

              <div>
                <p className="text-lg font-semibold text-slate-900">
                  CairoRoute
                </p>
                <p className="text-xs text-slate-500">
                  Transportation platform
                </p>
              </div>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  )
}