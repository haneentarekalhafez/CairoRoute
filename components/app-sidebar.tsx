"use client"

import Link from "next/link"

import {
  usePathname,
  useRouter,
} from "next/navigation"

import {
  BusFront,
  CalendarDays,
  House,
  LogOut,
  UserRound,
} from "lucide-react"

import {
  useEffect,
  useState,
} from "react"

import {
  createClient,
} from "@/lib/supabase/client"

/*
 * =========================================
 * NAVIGATION
 * =========================================
 */

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: House,
  },
  {
    label: "My Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },
]

/*
 * =========================================
 * SIDEBAR
 * =========================================
 */

export default function AppSidebar() {
  const pathname =
    usePathname()

  const router =
    useRouter()

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false)

  const [
    userName,
    setUserName,
  ] =
    useState("")

  const [
    loadingUser,
    setLoadingUser,
  ] =
    useState(true)

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
              method: "GET",

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
            session.user.email ??
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
    if (loggingOut) {
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

      if (error) {
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
   * PAGE
   * =========================================
   */

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* BRAND */}

      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#512978] text-white shadow-sm">
            <BusFront className="size-5" />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">
              CairoRoute
            </p>

            <p className="text-xs text-slate-500">
              Smart transportation
            </p>
          </div>
        </Link>
      </div>

      {/* MENU */}

      <div className="flex flex-1 flex-col px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
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
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#512978] text-white shadow-sm"
                      : "text-slate-600 hover:bg-purple-50 hover:text-[#512978]"
                  }`}
                >
                  <Icon
                    className={`size-5 shrink-0 transition ${
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-[#512978]"
                    }`}
                  />

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

        {/* PUSH BOTTOM CONTENT DOWN */}

        <div className="flex-1" />

        {/* USER */}

        <div className="mb-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#512978]">
              <UserRound className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                Welcome back
              </p>

              <p className="truncate text-sm font-semibold text-slate-900">
                {loadingUser
                  ? "Loading..."
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
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-5 shrink-0 text-slate-400 transition group-hover:text-red-600" />

          <span>
            {loggingOut
              ? "Logging out..."
              : "Log out"}
          </span>
        </button>
      </div>
    </aside>
  )
}