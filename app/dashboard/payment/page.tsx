"use client"

import Link from "next/link"

import {
  ArrowLeft,
  CreditCard,
} from "lucide-react"

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

const paymentCopy = {
  english: {
    title:
      "Payment",

    description:
      "Choose a booking first to continue to its payment page.",

    noBooking:
      "No booking was selected.",

    noBookingDescription:
      "Your payment page opens after you create a booking and choose an online payment method.",

    bookings:
      "Go to My Bookings",

    dashboard:
      "Back to dashboard",
  },

  arabic: {
    title:
      "الدفع",

    description:
      "اختر حجزًا أولًا للمتابعة إلى صفحة الدفع الخاصة به.",

    noBooking:
      "لم يتم اختيار حجز.",

    noBookingDescription:
      "تفتح صفحة الدفع بعد إنشاء الحجز واختيار طريقة دفع إلكترونية.",

    bookings:
      "الذهاب إلى حجوزاتي",

    dashboard:
      "العودة إلى الصفحة الرئيسية",
  },

  french: {
    title:
      "Paiement",

    description:
      "Sélectionnez d'abord une réservation pour accéder à sa page de paiement.",

    noBooking:
      "Aucune réservation sélectionnée.",

    noBookingDescription:
      "La page de paiement s'ouvre après la création d'une réservation et le choix d'un mode de paiement en ligne.",

    bookings:
      "Voir mes réservations",

    dashboard:
      "Retour au tableau de bord",
  },
} as const

export default function PaymentIndexPage() {
  const {
    language,
  } =
    useAppPreferences()

  const copy =
    paymentCopy[
      language
    ]

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#512978] hover:underline"
        >
          <ArrowLeft className="size-4" />

          {copy.dashboard}
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          {copy.title}
        </h1>

        <p className="mt-2 text-slate-600">
          {copy.description}
        </p>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#512978]">
              <CreditCard className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900">
                {copy.noBooking}
              </CardTitle>

              <CardDescription className="mt-1">
                {
                  copy.noBookingDescription
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Link
            href="/dashboard/my-bookings"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#512978] px-4 text-sm font-medium text-white transition hover:bg-[#40205f]"
          >
            {copy.bookings}
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}