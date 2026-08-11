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
  useAppPreferences,
} from "@/components/app-preferences-provider"

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

const scanCopy = {
  english: {
    checkingTicket:
      "Checking ticket...",

    alreadyCheckedIn:
      "This passenger has already checked in.",

    checkedInSuccessfully:
      "Passenger checked in successfully.",

    unableToVerify:
      "Unable to verify this ticket.",

    ticketTitle:
      "CairoRoute Ticket",

    boardingVerification:
      "Boarding verification",

    ticketAccepted:
      "Ticket accepted",

    ticketRejected:
      "Ticket rejected",
  },

  arabic: {
    checkingTicket:
      "جارٍ التحقق من التذكرة...",

    alreadyCheckedIn:
      "تم تسجيل صعود هذا الراكب بالفعل.",

    checkedInSuccessfully:
      "تم تسجيل صعود الراكب بنجاح.",

    unableToVerify:
      "تعذر التحقق من هذه التذكرة.",

    ticketTitle:
      "تذكرة CairoRoute",

    boardingVerification:
      "التحقق من الصعود",

    ticketAccepted:
      "تم قبول التذكرة",

    ticketRejected:
      "تم رفض التذكرة",
  },

  french: {
    checkingTicket:
      "Vérification du billet...",

    alreadyCheckedIn:
      "Ce passager a déjà été enregistré.",

    checkedInSuccessfully:
      "Passager enregistré avec succès.",

    unableToVerify:
      "Impossible de vérifier ce billet.",

    ticketTitle:
      "Billet CairoRoute",

    boardingVerification:
      "Vérification d’embarquement",

    ticketAccepted:
      "Billet accepté",

    ticketRejected:
      "Billet refusé",
  },
} as const

export default function ScanBookingPage() {
  const params =
    useParams<{
      bookingReference: string
    }>()

  const {
    language,
  } =
    useAppPreferences()

  const copy =
    scanCopy[
      language
    ]

  const hasScanned =
    useRef(false)

  const [
    state,
    setState,
  ] =
    useState<ScanState>(
      "loading"
    )

  const [
    message,
    setMessage,
  ] =
    useState<string>(
      copy.checkingTicket
    )

  const [
    passengerName,
    setPassengerName,
  ] =
    useState("")

  useEffect(() => {
    if (
      hasScanned.current
    ) {
      return
    }

    hasScanned.current =
      true

    async function scanBooking() {
      try {
        setMessage(
          copy.checkingTicket
        )

        const bookingReference =
          decodeURIComponent(
            params.bookingReference
          )

        const response =
          await fetch(
            "/api/bookings/scan",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    bookingReference,
                  }
                ),
            }
          )

        const result =
          (await response.json()) as ScanResponse

        if (
          !response.ok
        ) {
          throw new Error(
            result.error
              ? `${result.message} ${result.error}`
              : result.message
          )
        }

        setPassengerName(
          result.booking
            ?.passenger_name ??
            ""
        )

        setMessage(
          result.alreadyCompleted
            ? copy.alreadyCheckedIn
            : copy.checkedInSuccessfully
        )

        setState(
          "success"
        )
      } catch (
        error
      ) {
        setState(
          "error"
        )

        setMessage(
          error instanceof Error
            ? error.message
            : copy.unableToVerify
        )
      }
    }

    scanBooking()
  }, [
    params.bookingReference,
    copy.alreadyCheckedIn,
    copy.checkedInSuccessfully,
    copy.checkingTicket,
    copy.unableToVerify,
  ])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md rounded-2xl border-slate-200 bg-white shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-purple-50 text-[#512978]">
            <QrCode className="size-6" />
          </div>

          <CardTitle className="mt-3 text-2xl">
            {
              copy.ticketTitle
            }
          </CardTitle>

          <CardDescription>
            {
              copy.boardingVerification
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          {state ===
            "loading" && (
            <>
              <LoaderCircle className="mx-auto size-10 animate-spin text-[#512978]" />

              <p className="mt-4 text-slate-600">
                {
                  message
                }
              </p>
            </>
          )}

          {state ===
            "success" && (
            <>
              <CheckCircle2 className="mx-auto size-14 text-emerald-600" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {
                  copy.ticketAccepted
                }
              </h2>

              {passengerName && (
                <p className="mt-2 font-medium text-slate-800">
                  {
                    passengerName
                  }
                </p>
              )}

              <p className="mt-2 text-sm text-slate-600">
                {
                  message
                }
              </p>
            </>
          )}

          {state ===
            "error" && (
            <>
              <XCircle className="mx-auto size-14 text-red-600" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {
                  copy.ticketRejected
                }
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {
                  message
                }
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}