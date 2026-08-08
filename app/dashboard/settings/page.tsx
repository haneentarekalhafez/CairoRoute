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
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [language, setLanguage] = useState("english")
  const [theme, setTheme] = useState("light")

  const [locationAccess, setLocationAccess] = useState(true)
  const [bookingNotifications, setBookingNotifications] = useState(true)
  const [tripReminders, setTripReminders] = useState(true)
  const [promotionalMessages, setPromotionalMessages] = useState(false)

  const [message, setMessage] = useState("")

  function saveSettings() {
    setMessage(
      "Settings saved for the frontend prototype. They will connect to the user account later."
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section>
        <p className="text-sm font-medium text-[#512978]">
          Preferences
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>

        <p className="mt-2 text-slate-600">
          Manage language, appearance, notifications, location access, and
          privacy preferences.
        </p>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
              <Globe2 className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900">
                General preferences
              </CardTitle>

              <CardDescription className="mt-1">
                Choose the language and appearance of CairoRoute.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Language</Label>

            <Select
              value={language}
              onValueChange={(value) => {
                if (value !== null) {
                  setLanguage(value)
                }
              }}
            >
              <SelectTrigger className="h-11 w-full border-slate-300">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="english">
                  English
                </SelectItem>

                <SelectItem value="arabic">
                  Arabic
                </SelectItem>

                <SelectItem value="french">
                  French
                </SelectItem>
              </SelectContent>
            </Select>

            <p className="text-xs text-slate-500">
              Full translation support will be connected later.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Appearance</Label>

            <Select
              value={theme}
              onValueChange={(value) => {
                if (value !== null) {
                  setTheme(value)
                }
              }}
            >
              <SelectTrigger className="h-11 w-full border-slate-300">
                <SelectValue placeholder="Select appearance" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="size-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>

                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="size-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>

                <SelectItem value="system">
                  System default
                </SelectItem>
              </SelectContent>
            </Select>

            <p className="text-xs text-slate-500">
              Theme switching will be activated later.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
              <Bell className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900">
                Notifications
              </CardTitle>

              <CardDescription className="mt-1">
                Choose which updates you want to receive.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-slate-100 pt-2">
          <SettingRow
            title="Booking confirmations"
            description="Receive updates when a booking is confirmed or changed."
            checked={bookingNotifications}
            onCheckedChange={setBookingNotifications}
          />

          <SettingRow
            title="Trip reminders"
            description="Receive reminders before your scheduled departure."
            checked={tripReminders}
            onCheckedChange={setTripReminders}
          />

          <SettingRow
            title="Offers and announcements"
            description="Receive promotional messages and service announcements."
            checked={promotionalMessages}
            onCheckedChange={setPromotionalMessages}
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900">
                Privacy and location
              </CardTitle>

              <CardDescription className="mt-1">
                Control location access and account security settings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-6 rounded-lg border border-slate-200 p-4">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-[#512978]" />

              <div>
                <p className="font-medium text-slate-900">
                  Location access
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Allow CairoRoute to use your location when suggesting nearby
                  pickup points.
                </p>
              </div>
            </div>

            <Switch
              checked={locationAccess}
              onCheckedChange={setLocationAccess}
              aria-label="Location access"
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#512978]" />

            <div>
              <p className="font-medium text-slate-900">
                Account security
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Password changes and account security controls will be
                connected after authentication is added.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4 border-slate-300"
                disabled
              >
                Change password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {message && (
            <p className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="size-4" />
              {message}
            </p>
          )}
        </div>

        <Button
          type="button"
          onClick={saveSettings}
          className="h-11 bg-[#512978] px-6 text-white hover:bg-[#40205f]"
        >
          <Save className="size-4" />
          Save settings
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
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-5">
      <div>
        <p className="font-medium text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {description}
        </p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  )
}