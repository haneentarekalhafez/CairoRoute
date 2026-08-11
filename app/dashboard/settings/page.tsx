"use client"

import { useState } from "react"
import {
  Bell,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  MapPin,
  Moon,
  Save,
  ShieldCheck,
  Sun,
} from "lucide-react"

import {
  useAppPreferences,
  type LanguagePreference,
  type ThemePreference,
} from "@/components/app-preferences-provider"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const STORAGE_KEYS = {
  locationAccess:
    "cairoroute-location-access",

  bookingNotifications:
    "cairoroute-booking-notifications",

  tripReminders:
    "cairoroute-trip-reminders",

  promotionalMessages:
    "cairoroute-promotional-messages",
}

function getStoredBoolean(
  key: string,
  fallback: boolean
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return fallback
  }

  const value =
    localStorage.getItem(
      key
    )

  if (
    value === null
  ) {
    return fallback
  }

  return (
    value === "true"
  )
}

export default function SettingsPage() {
  const {
    language,
    theme,
    setLanguage,
    setTheme,
    t,
  } =
    useAppPreferences()

  const [
    locationAccess,
    setLocationAccess,
  ] =
    useState(
      () =>
        getStoredBoolean(
          STORAGE_KEYS.locationAccess,
          true
        )
    )

  const [
    bookingNotifications,
    setBookingNotifications,
  ] =
    useState(
      () =>
        getStoredBoolean(
          STORAGE_KEYS.bookingNotifications,
          true
        )
    )

  const [
    tripReminders,
    setTripReminders,
  ] =
    useState(
      () =>
        getStoredBoolean(
          STORAGE_KEYS.tripReminders,
          true
        )
    )

  const [
    promotionalMessages,
    setPromotionalMessages,
  ] =
    useState(
      () =>
        getStoredBoolean(
          STORAGE_KEYS.promotionalMessages,
          false
        )
    )

  const [
    message,
    setMessage,
  ] =
    useState("")

  function handleLanguageChange(
    value:
      | LanguagePreference
      | null
  ) {
    if (!value) {
      return
    }

    setLanguage(
      value
    )

    setMessage("")
  }

  function handleThemeChange(
    value:
      | ThemePreference
      | null
  ) {
    if (!value) {
      return
    }

    setTheme(
      value
    )

    setMessage("")
  }

  function saveSettings() {
    localStorage.setItem(
      STORAGE_KEYS.locationAccess,
      String(
        locationAccess
      )
    )

    localStorage.setItem(
      STORAGE_KEYS.bookingNotifications,
      String(
        bookingNotifications
      )
    )

    localStorage.setItem(
      STORAGE_KEYS.tripReminders,
      String(
        tripReminders
      )
    )

    localStorage.setItem(
      STORAGE_KEYS.promotionalMessages,
      String(
        promotionalMessages
      )
    )

    setMessage(
      t(
        "settingsSaved"
      )
    )
  }

  function getLanguageLabel() {
    if (
      language === "arabic"
    ) {
      return t(
        "arabic"
      )
    }

    if (
      language === "french"
    ) {
      return t(
        "french"
      )
    }

    return t(
      "english"
    )
  }

  function getThemeLabel() {
    if (
      theme === "dark"
    ) {
      return t(
        "dark"
      )
    }

    if (
      theme === "system"
    ) {
      return t(
        "systemDefault"
      )
    }

    return t(
      "light"
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section>
        <p className="text-sm font-medium text-[#512978] dark:text-purple-300">
          {t(
            "preferences"
          )}
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {t(
            "settingsTitle"
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t(
            "settingsDescription"
          )}
        </p>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978] dark:bg-purple-950/50 dark:text-purple-300">
              <Globe2 className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                {t(
                  "generalPreferences"
                )}
              </CardTitle>

              <CardDescription className="mt-1 dark:text-slate-400">
                {t(
                  "generalPreferencesDescription"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              {t(
                "language"
              )}
            </Label>

            <Select
              value={
                language
              }
              onValueChange={
                handleLanguageChange
              }
            >
              <SelectTrigger className="h-11 w-full border-slate-300 dark:border-slate-700 dark:bg-slate-950">
                <span>
                  {getLanguageLabel()}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="english">
                  {t(
                    "english"
                  )}
                </SelectItem>

                <SelectItem value="arabic">
                  {t(
                    "arabic"
                  )}
                </SelectItem>

                <SelectItem value="french">
                  {t(
                    "french"
                  )}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {t(
                "appearance"
              )}
            </Label>

            <Select
              value={
                theme
              }
              onValueChange={
                handleThemeChange
              }
            >
              <SelectTrigger className="h-11 w-full border-slate-300 dark:border-slate-700 dark:bg-slate-950">
                <span>
                  {getThemeLabel()}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="size-4" />

                    <span>
                      {t(
                        "light"
                      )}
                    </span>
                  </div>
                </SelectItem>

                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="size-4" />

                    <span>
                      {t(
                        "dark"
                      )}
                    </span>
                  </div>
                </SelectItem>

                <SelectItem value="system">
                  {t(
                    "systemDefault"
                  )}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978] dark:bg-purple-950/50 dark:text-purple-300">
              <Bell className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                {t(
                  "notifications"
                )}
              </CardTitle>

              <CardDescription className="mt-1 dark:text-slate-400">
                {t(
                  "notificationsDescription"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-slate-100 pt-2 dark:divide-slate-800">
          <SettingRow
            title={t(
              "bookingConfirmations"
            )}
            description={t(
              "bookingConfirmationsDescription"
            )}
            checked={
              bookingNotifications
            }
            onCheckedChange={
              setBookingNotifications
            }
          />

          <SettingRow
            title={t(
              "tripReminders"
            )}
            description={t(
              "tripRemindersDescription"
            )}
            checked={
              tripReminders
            }
            onCheckedChange={
              setTripReminders
            }
          />

          <SettingRow
            title={t(
              "offersAnnouncements"
            )}
            description={t(
              "offersAnnouncementsDescription"
            )}
            checked={
              promotionalMessages
            }
            onCheckedChange={
              setPromotionalMessages
            }
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978] dark:bg-purple-950/50 dark:text-purple-300">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                {t(
                  "privacyLocation"
                )}
              </CardTitle>

              <CardDescription className="mt-1 dark:text-slate-400">
                {t(
                  "privacyLocationDescription"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-6 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-[#512978] dark:text-purple-300" />

              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {t(
                    "locationAccess"
                  )}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {t(
                    "locationAccessDescription"
                  )}
                </p>
              </div>
            </div>

            <Switch
              checked={
                locationAccess
              }
              onCheckedChange={
                setLocationAccess
              }
              aria-label={t(
                "locationAccess"
              )}
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#512978] dark:text-purple-300" />

            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {t(
                  "accountSecurity"
                )}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {t(
                  "accountSecurityDescription"
                )}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4 border-slate-300 dark:border-slate-700"
                disabled
              >
                {t(
                  "changePassword"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {message && (
            <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />

              {message}
            </p>
          )}
        </div>

        <Button
          type="button"
          onClick={
            saveSettings
          }
          className="h-11 bg-[#512978] px-6 text-white hover:bg-[#40205f]"
        >
          <Save className="size-4" />

          {t(
            "saveSettings"
          )}
        </Button>
      </div>
    </div>
  )
}

function SettingRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange:
    (
      checked: boolean
    ) => void
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-5">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      <Switch
        checked={
          checked
        }
        onCheckedChange={
          onCheckedChange
        }
        aria-label={
          title
        }
      />
    </div>
  )
}