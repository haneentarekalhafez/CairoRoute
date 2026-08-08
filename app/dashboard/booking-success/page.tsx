"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  TicketCheck,
  UserRound,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()

  const bookingId =
    searchParams.get("bookingId")

  const bookingReference =
    searchParams.get("bookingReference")

  const passengerName =
    searchParams.get("name") || "Passenger"

  const selectedSeat =
    searchParams.get("seat") || "Not selected"

  if (!bookingId || !bookingReference) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <TicketCheck className="size-10 text-slate-400" />

            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Booking information unavailable
            </h1>

            <p className="mt-2 text-slate-500">
              The booking confirmation information could not be found.
            </p>

            <Link
              href="/dashboard"
              className={buttonVariants({
                className:
                  "mt-6 bg-[#512978] text-white hover:bg-[#40205f]",
              })}
            >
              Return to dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <section className="rounded-2xl bg-[#241536] px-6 py-10 text-center text-white md:px-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white text-[#512978]">
          <CheckCircle2 className="size-9" />
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          Booking confirmed
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-purple-100/80">
          Your reservation has been created successfully,{" "}
          {passengerName}.
        </p>

        <div className="mx-auto mt-6 w-fit rounded-lg bg-white/10 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">
            Booking reference
          </p>

          <p className="mt-1 text-xl font-semibold">
            {bookingReference}
          </p>
        </div>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <ConfirmationItem
              icon={TicketCheck}
              label="Booking ID"
              value={`#${bookingId}`}
            />

            <ConfirmationItem
              icon={UserRound}
              label="Passenger"
              value={passengerName}
            />

            <ConfirmationItem
              icon={UserRound}
              label="Seat"
              value={`Seat ${selectedSeat}`}
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
          View my bookings
        </Link>

        <Link
          href="/dashboard"
          className={buttonVariants({
            variant: "outline",
            className:
              "h-11 border-slate-300 px-6",
          })}
        >
          Return to dashboard
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
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
        <Icon className="size-5" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}