"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  CheckCircle2,
  LoaderCircle,
  QrCode,
  XCircle,
} from "lucide-react"

import { useParams } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ScanState =
  | "loading"
  | "success"
  | "error"

type ScanResponse = {
  message: string

  alreadyCompleted?: boolean

  booking?: {
    id: number
    booking_reference: string
    status: string
    passenger_name: string
    trip_id: number
  }

  error?: string
}

export default function ScanBookingPage() {
  const params =
    useParams<{
      bookingReference: string
    }>()

  const hasScanned =
    useRef(false)

  const [state, setState] =
    useState<ScanState>("loading")

  const [message, setMessage] =
    useState("Checking ticket...")

  const [
    passengerName,
    setPassengerName,
  ] =
    useState("")

  useEffect(() => {
    if (hasScanned.current) {
      return
    }

    hasScanned.current =
      true

    async function scanBooking() {
      try {
        const bookingReference =
          decodeURIComponent(
            params.bookingReference
          )

        const response =
          await fetch(
            "/api/bookings/scan",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                bookingReference,
              }),
            }
          )

        const result =
          (await response.json()) as ScanResponse

        if (!response.ok) {
          throw new Error(
            result.error
              ? `${result.message} ${result.error}`
              : result.message
          )
        }

        setPassengerName(
          result.booking
            ?.passenger_name ?? ""
        )

        setMessage(
          result.alreadyCompleted
            ? "This passenger has already checked in."
            : "Passenger checked in successfully."
        )

        setState("success")
      } catch (error) {
        setState("error")

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify this ticket."
        )
      }
    }

    scanBooking()
  }, [
    params.bookingReference,
  ])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-purple-50 text-[#512978]">
            <QrCode className="size-7" />
          </div>

          <CardTitle className="mt-3 text-2xl">
            CairoRoute Ticket
          </CardTitle>

          <CardDescription>
            Boarding verification
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          {state === "loading" && (
            <>
              <LoaderCircle className="mx-auto size-10 animate-spin text-[#512978]" />

              <p className="mt-4 text-slate-600">
                {message}
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <CheckCircle2 className="mx-auto size-14 text-emerald-600" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                Ticket accepted
              </h2>

              {passengerName && (
                <p className="mt-2 font-medium text-slate-800">
                  {passengerName}
                </p>
              )}

              <p className="mt-2 text-sm text-slate-600">
                {message}
              </p>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="mx-auto size-14 text-red-600" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                Ticket rejected
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {message}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}