"use client"

import {
  Suspense,
} from "react"

import type {
  ElementType,
} from "react"

import Link from "next/link"

import {
  useSearchParams,
} from "next/navigation"

import {
  CheckCircle2,
  TicketCheck,
  UserRound,
} from "lucide-react"

import {
  useAppPreferences,
  type LanguagePreference,
} from "@/components/app-preferences-provider"

import {
  buttonVariants,
} from "@/components/ui/button"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

const bookingSuccessCopy = {
  english: {
    passengerFallback:
      "Passenger",

    notSelected:
      "Not selected",

    unavailableTitle:
      "Booking information unavailable",

    unavailableDescription:
      "The booking confirmation information could not be found.",

    returnDashboard:
      "Return to dashboard",

    bookingConfirmed:
      "Booking confirmed",

    successPrefix:
      "Your reservation has been created successfully",

    bookingReference:
      "Booking reference",

    bookingId:
      "Booking ID",

    passenger:
      "Passenger",

    seat:
      "Seat",

    viewBookings:
      "View my bookings",

    loading:
      "Loading booking confirmation...",
  },

  arabic: {
    passengerFallback:
      "الراكب",

    notSelected:
      "لم يتم الاختيار",

    unavailableTitle:
      "معلومات الحجز غير متاحة",

    unavailableDescription:
      "تعذر العثور على معلومات تأكيد الحجز.",

    returnDashboard:
      "العودة إلى الرئيسية",

    bookingConfirmed:
      "تم تأكيد الحجز",

    successPrefix:
      "تم إنشاء حجزك بنجاح",

    bookingReference:
      "مرجع الحجز",

    bookingId:
      "رقم الحجز",

    passenger:
      "الراكب",

    seat:
      "المقعد",

    viewBookings:
      "عرض حجوزاتي",

    loading:
      "جارٍ تحميل تأكيد الحجز...",
  },

  french: {
    passengerFallback:
      "Passager",

    notSelected:
      "Non sélectionnée",

    unavailableTitle:
      "Informations de réservation indisponibles",

    unavailableDescription:
      "Les informations de confirmation de réservation sont introuvables.",

    returnDashboard:
      "Retour au tableau de bord",

    bookingConfirmed:
      "Réservation confirmée",

    successPrefix:
      "Votre réservation a été créée avec succès",

    bookingReference:
      "Référence de réservation",

    bookingId:
      "ID de réservation",

    passenger:
      "Passager",

    seat:
      "Place",

    viewBookings:
      "Voir mes réservations",

    loading:
      "Chargement de la confirmation de réservation...",
  },
} as const

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <BookingSuccessLoading />
      }
    >
      <BookingSuccessContent />
    </Suspense>
  )
}

function BookingSuccessContent() {
  const searchParams =
    useSearchParams()

  const {
    language,
  } =
    useAppPreferences()

  const copy =
    bookingSuccessCopy[
      language
    ]

  const bookingId =
    searchParams.get(
      "bookingId"
    )

  const bookingReference =
    searchParams.get(
      "bookingReference"
    )

  const passengerName =
    searchParams.get(
      "name"
    ) ||
    copy.passengerFallback

  const selectedSeat =
    searchParams.get(
      "seat"
    ) ||
    copy.notSelected

  if (
    !bookingId ||
    !bookingReference
  ) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <TicketCheck className="size-10 text-slate-400" />

            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              {
                copy.unavailableTitle
              }
            </h1>

            <p className="mt-2 text-slate-500">
              {
                copy.unavailableDescription
              }
            </p>

            <Link
              href="/dashboard"
              className={buttonVariants({
                className:
                  "mt-6 bg-[#512978] text-white hover:bg-[#40205f]",
              })}
            >
              {
                copy.returnDashboard
              }
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="rounded-2xl bg-[#512978] px-6 py-10 text-center text-white shadow-sm md:px-10">
        <CheckCircle2 className="mx-auto size-12" />

        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          {
            copy.bookingConfirmed
          }
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-purple-100/80">
          {
            copy.successPrefix
          }
          ,{" "}
          {
            passengerName
          }
          .
        </p>

        <div className="mx-auto mt-6 w-fit rounded-lg bg-white/10 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">
            {
              copy.bookingReference
            }
          </p>

          <p className="mt-1 text-xl font-semibold">
            {
              bookingReference
            }
          </p>
        </div>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <ConfirmationItem
              icon={
                TicketCheck
              }
              label={
                copy.bookingId
              }
              value={`#${formatNumberString(
                bookingId,
                language
              )}`}
            />

            <ConfirmationItem
              icon={
                UserRound
              }
              label={
                copy.passenger
              }
              value={
                passengerName
              }
            />

            <ConfirmationItem
              icon={
                UserRound
              }
              label={
                copy.seat
              }
              value={`${copy.seat} ${formatNumberString(
                selectedSeat,
                language
              )}`}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard/bookings"
          className={buttonVariants({
            className:
              "h-11 bg-[#512978] px-6 text-white hover:bg-[#40205f]",
          })}
        >
          {
            copy.viewBookings
          }
        </Link>

        <Link
          href="/dashboard"
          className={buttonVariants({
            variant:
              "outline",

            className:
              "h-11 border-slate-300 px-6",
          })}
        >
          {
            copy.returnDashboard
          }
        </Link>
      </div>
    </div>
  )
}

function ConfirmationItem({
  icon: Icon,
  label,
  value,
}: {
  icon:
    ElementType

  label:
    string

  value:
    string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
        <Icon className="size-4" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {
            label
          }
        </p>

        <p className="mt-1 font-medium text-slate-900">
          {
            value
          }
        </p>
      </div>
    </div>
  )
}

function BookingSuccessLoading() {
  const {
    language,
  } =
    useAppPreferences()

  const copy =
    bookingSuccessCopy[
      language
    ]

  return (
    <div className="mx-auto flex min-h-80 w-full max-w-4xl items-center justify-center">
      <p className="text-sm text-slate-500">
        {
          copy.loading
        }
      </p>
    </div>
  )
}

function getLocale(
  language:
    LanguagePreference
) {
  if (
    language ===
    "arabic"
  ) {
    return "ar-EG"
  }

  if (
    language ===
    "french"
  ) {
    return "fr-FR"
  }

  return "en-EG"
}

function formatNumberString(
  value: string,
  language:
    LanguagePreference
) {
  const number =
    Number(
      value
    )

  if (
    !Number.isFinite(
      number
    )
  ) {
    return value
  }

  return new Intl.NumberFormat(
    getLocale(
      language
    )
  ).format(
    number
  )
}