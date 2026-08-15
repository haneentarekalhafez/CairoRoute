"use client"

import Link from "next/link"
import {
  usePathname,
  useRouter,
} from "next/navigation"
import {
  CalendarDays,
  House,
  LogOut,
  MessageCircle,
  Settings,
  UserRound,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"

import CairoRouteLogo from "@/components/cairoroute-logo"
import { useAppPreferences } from "@/components/app-preferences-provider"
import { createClient } from "@/lib/supabase/client"

type AppSidebarProps = {
  onNavigate?: () => void
  className?: string
}

export default function AppSidebar({
  onNavigate,
  className = "",
}: AppSidebarProps) {
  const pathname =
    usePathname()

  const router =
    useRouter()

  const { t } =
    useAppPreferences()

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false)

  const [
    userName,
    setUserName,
  ] = useState("")

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true)

  const navigationItems = [
    {
      label: t(
        "dashboard"
      ),
      href: "/dashboard",
      icon: House,
    },
    {
      label: t(
        "myBookings"
      ),
      href: "/dashboard/bookings",
      icon: CalendarDays,
    },
    {
      label: "Support",
      href: "/dashboard/support",
      icon: MessageCircle,
    },
    {
      label: t(
        "profile"
      ),
      href: "/dashboard/profile",
      icon: UserRound,
    },
    {
      label: t(
        "settings"
      ),
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  /*
   * =========================================
   * LOAD CURRENT USER
   * =========================================
   */

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase =
          createClient()

        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession()

        if (!session) {
          setUserName(
            "User"
          )

          return
        }

        const response =
          await fetch(
            "/api/profile",
            {
              method:
                "GET",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              cache:
                "no-store",
            }
          )

        const result =
          await response.json()

        if (
          response.ok &&
          result.profile
            ?.full_name
        ) {
          setUserName(
            result.profile
              .full_name
          )
        } else if (
          session.user
            .user_metadata
            ?.full_name
        ) {
          setUserName(
            session.user
              .user_metadata
              .full_name
          )
        } else {
          setUserName(
            session.user
              .email ??
              "User"
          )
        }
      } catch (
        error
      ) {
        console.error(
          "Failed to load sidebar user:",
          error
        )

        setUserName(
          "User"
        )
      } finally {
        setLoadingUser(
          false
        )
      }
    }

    loadUser()
  }, [])

  /*
   * =========================================
   * LOGOUT
   * =========================================
   */

  async function handleLogout() {
    if (
      loggingOut
    ) {
      return
    }

    try {
      setLoggingOut(
        true
      )

      const supabase =
        createClient()

      const {
        error,
      } =
        await supabase.auth.signOut()

      if (
        error
      ) {
        throw error
      }

      router.replace(
        "/login"
      )

      router.refresh()
    } catch (
      error
    ) {
      console.error(
        "Logout failed:",
        error
      )

      setLoggingOut(
        false
      )
    }
  }

  /*
   * =========================================
   * ACTIVE LINK
   * =========================================
   */

  function isActive(
    href: string
  ) {
    if (
      href ===
      "/dashboard"
    ) {
      return (
        pathname ===
        "/dashboard"
      )
    }

    return pathname.startsWith(
      href
    )
  }

  /*
   * =========================================
   * SIDEBAR
   * =========================================
   */

  return (
    <aside
      className={`flex h-full w-[272px] shrink-0 flex-col border-r border-[#ebe6ee] bg-[#fbfafc] ${className}`}
    >
      {/* BRAND */}

      <div className="flex h-[88px] shrink-0 items-center border-b border-[#ebe6ee] px-5">
        <CairoRouteLogo />
      </div>

      {/* CONTENT */}

      <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
        {/* NAVIGATION */}

        <div>
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {t(
              "yourJourney"
            )}
          </p>

          <nav className="space-y-1.5">
            {navigationItems.map(
              (
                item
              ) => {
                const Icon =
                  item.icon

                const active =
                  isActive(
                    item.href
                  )

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    onClick={
                      onNavigate
                    }
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-[14px] px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-[#512978] text-white shadow-[0_8px_22px_rgba(81,41,120,0.18)]"
                        : "text-slate-600 hover:bg-[#f2edf6] hover:text-[#512978]"
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#d4b6eb]" />
                    )}

                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-[11px] transition ${
                        active
                          ? "bg-white/10 text-white"
                          : "bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/70 group-hover:text-[#512978]"
                      }`}
                    >
                      <Icon className="size-[17px]" />
                    </span>

                    <span>
                      {
                        item.label
                      }
                    </span>
                  </Link>
                )
              }
            )}
          </nav>
        </div>

        {/* PUSH ACCOUNT SECTION DOWN */}

        <div className="flex-1" />

        {/* ACCOUNT */}

        <div className="border-t border-[#ebe6ee] pt-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {t(
              "account"
            )}
          </p>

          <div className="rounded-[16px] border border-[#ebe6ee] bg-white p-3 shadow-[0_5px_18px_rgba(35,22,44,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#eee4f6] to-[#dfcfeb] text-[#512978]">
                <UserRound className="size-[18px]" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {t(
                    "signedInAs"
                  )}
                </p>

                <p className="mt-0.5 truncate text-sm font-bold text-[#241b2b]">
                  {loadingUser
                    ? t(
                        "loading"
                      )
                    : userName}
                </p>
              </div>
            </div>
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={
              handleLogout
            }
            disabled={
              loggingOut
            }
            className="group mt-2 flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] text-slate-400 transition group-hover:bg-white group-hover:text-red-500 group-hover:shadow-sm">
              <LogOut className="size-[17px]" />
            </span>

            <span>
              {loggingOut
                ? t(
                    "loggingOut"
                  )
                : t(
                    "logout"
                  )}
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}