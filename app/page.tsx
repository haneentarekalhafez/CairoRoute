"use client"

import Image from "next/image"
import { useState } from "react"
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DashboardPage() {
  const [currentLocation, setCurrentLocation] = useState("")
  const [destination, setDestination] = useState("")
  const [message, setMessage] = useState("")

  function detectLocation() {
    if (!navigator.geolocation) {
      setMessage("Location detection is not supported by your browser.")
      return
    }

    setMessage("Detecting your current location...")

    navigator.geolocation.getCurrentPosition(
      () => {
        setCurrentLocation("Current location detected")
        setMessage("Your current location was detected.")
      },
      () => {
        setMessage(
          "Location permission was blocked. Enter your location manually."
        )
      }
    )
  }

  function searchRoutes() {
    if (!currentLocation.trim() || !destination.trim()) {
      setMessage("Enter your current location and destination.")
      return
    }

    setMessage(
      "The frontend search is ready. Route results will be connected later."
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative min-h-[310px] overflow-hidden rounded-2xl">
        <Image
          src="/images/cairo-bus.jpg"
          alt="CairoRoute bus transportation"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="relative flex min-h-[310px] items-end p-7 text-white md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-white/75">
              Transportation across Cairo
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Where do you want to go?
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-white/85">
              Enter your destination and we will suggest the nearest suitable
              pickup point based on your location.
            </p>
          </div>
        </div>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-[#542a80]">
              <Route className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900">
                Plan your trip
              </CardTitle>

              <CardDescription className="mt-1">
                Select your location and enter your destination.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
            <div className="space-y-2">
              <Label htmlFor="location">Current location</Label>

              <div className="relative">
                <Navigation className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="location"
                  value={currentLocation}
                  onChange={(event) =>
                    setCurrentLocation(event.target.value)
                  }
                  placeholder="Enter your current location"
                  className="h-12 pl-10 pr-12"
                />

                <button
                  type="button"
                  onClick={detectLocation}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#542a80] hover:bg-purple-50"
                  aria-label="Detect current location"
                >
                  <LocateFixed className="size-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="destination"
                  value={destination}
                  onChange={(event) =>
                    setDestination(event.target.value)
                  }
                  placeholder="Where are you going?"
                  className="h-12 pl-10"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={searchRoutes}
              className="h-12 bg-[#542a80] px-6 text-white hover:bg-[#432166]"
            >
              Search
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-slate-600">
              {message}
            </p>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-[#542a80]">
                <CalendarDays className="size-5" />
              </div>

              <div>
                <CardTitle className="text-lg">Upcoming trip</CardTitle>
                <CardDescription className="mt-1">
                  Your next confirmed reservation
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <BusFront className="mb-3 size-8 text-slate-400" />

              <p className="font-medium text-slate-800">
                No upcoming trips
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your confirmed reservations will appear here.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-[#542a80]">
                <MapPin className="size-5" />
              </div>

              <div>
                <CardTitle className="text-lg">
                  Nearest pickup point
                </CardTitle>

                <CardDescription className="mt-1">
                  Suggested using your current location
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <MapPin className="mb-3 size-8 text-slate-400" />

              <p className="font-medium text-slate-800">
                Location not selected
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Detect your location to view nearby pickup points.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}