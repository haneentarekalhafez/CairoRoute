import CairoRouteLogo from "@/components/cairoroute-logo"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="min-h-dvh w-full max-w-full overflow-x-hidden bg-[#f8f6fa]">
      <div className="grid min-h-dvh w-full min-w-0 max-w-full lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT IMAGE SIDE */}

        <section
          className="relative hidden min-h-dvh min-w-0 overflow-hidden bg-[#21152a] bg-cover bg-center bg-no-repeat lg:block"
          style={{
            backgroundImage:
              "url('/images/cairo-bus.jpeg')",
          }}
        >
          {/* DARK IMAGE OVERLAY */}

          <div className="absolute inset-0 bg-[#1b1023]/65" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#21152a]/90 via-[#21152a]/55 to-[#21152a]/20" />

          {/* DECORATIVE GLOW */}

          <div
            className="pointer-events-none absolute -left-32 top-[24%] size-[520px] rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(198,154,233,0.65) 0%, rgba(109,58,162,0) 70%)",
            }}
          />

          {/* CONTENT */}

          <div className="relative flex min-h-dvh flex-col justify-between p-10 text-white xl:p-14 2xl:p-16">
            <CairoRouteLogo
              href="/"
              light
            />

            <div className="max-w-[620px] pb-8">
              <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                <span className="h-px w-8 bg-white/40" />
                Private city mobility
              </div>

              <h1 className="max-w-[600px] text-5xl font-extrabold leading-[1.04] tracking-[-0.045em] xl:text-[64px]">
                Cairo moves fast.

                <span className="block text-[#d5b8ec]">
                  You should too.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[17px] leading-8 text-white/72">
                Discover nearby pickup points, compare scheduled routes,
                reserve your seat and keep every trip in one beautifully simple
                passenger experience.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Verified routes",
                  "Reserved seats",
                  "Digital boarding",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur-md"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/45">
              <p>
                CairoRoute passenger platform
              </p>

              <p>
                Built for everyday Cairo
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT AUTH SIDE */}

        <section className="relative flex min-h-dvh min-w-0 max-w-full items-center justify-center overflow-hidden px-4 py-8 sm:px-8 sm:py-12 lg:px-12 xl:px-16">
          {/* DECORATIVE BACKGROUND */}

          <div
            className="pointer-events-none absolute -right-28 -top-28 size-[360px] rounded-full opacity-70 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(190,157,216,0.28) 0%, rgba(190,157,216,0) 70%)",
            }}
          />

          {/* AUTH CONTENT */}

          <div className="relative w-full min-w-0 max-w-[470px]">
            {/* MOBILE LOGO */}

            <div className="mb-8 lg:hidden">
              <CairoRouteLogo href="/" />
            </div>

            {/* LOGIN / SIGNUP COMPONENT */}

            <div className="w-full min-w-0 max-w-full">
              {children}
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              Secure passenger access • CairoRoute
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}