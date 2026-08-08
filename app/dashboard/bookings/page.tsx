"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  BusFront,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  QrCode,
  TicketCheck,
  UserRound,
  XCircle,
} from "lucide-react"

import { QRCodeSVG } from "qrcode.react"

import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const PAGE_LOAD_TIME =
  Date.now()

type BookingTab =
  | "upcoming"
  | "previous"

type Booking = {
  id: number
  bookingReference: string
  status: string
  totalPrice: number
  passengerName: string
  passengerPhone: string
  passengerEmail: string | null
  createdAt: string
  tripId: number | null
  departureTime: string | null
  arrivalTime: string | null
  pickupPoint: string
  pickupArea: string | null
  destination: string
  bus: string
  plateNumber: string
  seats: number[]
}

type BookingsResponse = {
  bookings?: Booking[]
  message?: string
  error?: string
}

type CancelResponse = {
  message?: string
  error?: string

  alreadyCancelled?: boolean

  booking?: {
    id: number
    booking_reference: string
    status: string
    user_id: string
    trip_id: number
    passenger_name: string
  }
}

export default function BookingsPage() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<BookingTab>(
      "upcoming"
    )

  const [
    bookings,
    setBookings,
  ] =
    useState<Booking[]>([])

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    message,
    setMessage,
  ] =
    useState("")

  const [
    isError,
    setIsError,
  ] =
    useState(false)

  const [
    qrBooking,
    setQrBooking,
  ] =
    useState<Booking | null>(
      null
    )

  const [
    qrBaseUrl,
    setQrBaseUrl,
  ] =
    useState("")

  const [
    cancellingReference,
    setCancellingReference,
  ] =
    useState<string | null>(
      null
    )

  /*
   * =========================================
   * LOAD BOOKINGS
   * =========================================
   */

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true)
        setMessage("")
        setIsError(false)

        const supabase =
          createClient()

        const {
          data: {
            session,
          },
          error:
            sessionError,
        } =
          await supabase.auth.getSession()

        if (
          sessionError ||
          !session
        ) {
          throw new Error(
            "Your login session could not be found. Please log in again."
          )
        }

        const response =
          await fetch(
            "/api/my-bookings",
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
          (await response.json()) as BookingsResponse

        if (!response.ok) {
          throw new Error(
            result.error
              ? `${result.message} ${result.error}`
              : result.message ||
                  "Failed to load your bookings."
          )
        }

        setBookings(
          result.bookings ??
            []
        )
      } catch (error) {
        setIsError(true)

        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load your bookings."
        )
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  /*
   * =========================================
   * UPCOMING BOOKINGS
   * =========================================
   */

  const upcomingBookings =
    useMemo(() => {
      return bookings
        .filter(
          (booking) => {
            const status =
              booking.status.toLowerCase()

            if (
              status ===
                "completed" ||
              status ===
                "cancelled"
            ) {
              return false
            }

            if (
              !booking.departureTime
            ) {
              return false
            }

            const departure =
              new Date(
                booking.departureTime
              ).getTime()

            return (
              departure >
              PAGE_LOAD_TIME
            )
          }
        )
        .sort(
          (a, b) => {
            const aTime =
              new Date(
                a.departureTime!
              ).getTime()

            const bTime =
              new Date(
                b.departureTime!
              ).getTime()

            return (
              aTime -
              bTime
            )
          }
        )
    }, [bookings])

  /*
   * =========================================
   * PREVIOUS BOOKINGS
   * =========================================
   */

  const previousBookings =
    useMemo(() => {
      return bookings
        .filter(
          (booking) => {
            const status =
              booking.status.toLowerCase()

            if (
              status ===
                "completed" ||
              status ===
                "cancelled"
            ) {
              return true
            }

            if (
              !booking.departureTime
            ) {
              return true
            }

            const departure =
              new Date(
                booking.departureTime
              ).getTime()

            return (
              departure <=
              PAGE_LOAD_TIME
            )
          }
        )
        .sort(
          (a, b) => {
            const aTime =
              a.departureTime
                ? new Date(
                    a.departureTime
                  ).getTime()
                : 0

            const bTime =
              b.departureTime
                ? new Date(
                    b.departureTime
                  ).getTime()
                : 0

            return (
              bTime -
              aTime
            )
          }
        )
    }, [bookings])

  /*
   * =========================================
   * SUMMARY COUNTS
   * =========================================
   */

  const completedCount =
    bookings.filter(
      (booking) =>
        booking.status.toLowerCase() ===
        "completed"
    ).length

  const cancelledCount =
    bookings.filter(
      (booking) =>
        booking.status.toLowerCase() ===
        "cancelled"
    ).length

  const displayedBookings =
    activeTab ===
    "upcoming"
      ? upcomingBookings
      : previousBookings

  /*
   * =========================================
   * SHOW QR
   * =========================================
   */

  function showQr(
    booking: Booking
  ) {
    const baseUrl =
      process.env
        .NEXT_PUBLIC_APP_URL ||
      window.location.origin

    setQrBaseUrl(
      baseUrl
    )

    setQrBooking(
      booking
    )

    setMessage("")
    setIsError(false)
  }

  /*
   * =========================================
   * CANCEL BOOKING
   * =========================================
   */

  async function cancelBooking(
    booking: Booking
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to cancel booking ${booking.bookingReference}?`
      )

    if (!confirmed) {
      return
    }

    try {
      setCancellingReference(
        booking.bookingReference
      )

      setMessage("")
      setIsError(false)

      const supabase =
        createClient()

      const {
        data: {
          session,
        },
        error:
          sessionError,
      } =
        await supabase.auth.getSession()

      if (
        sessionError ||
        !session
      ) {
        throw new Error(
          "Your login session could not be found. Please log in again."
        )
      }

      const response =
        await fetch(
          "/api/bookings/cancel",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                bookingReference:
                  booking.bookingReference,
              }),
          }
        )

      const result =
        (await response.json()) as CancelResponse

      if (!response.ok) {
        throw new Error(
          result.error
            ? `${result.message} ${result.error}`
            : result.message ||
                "Failed to cancel booking."
        )
      }

      /*
       * Update our existing booking in state.
       *
       * No need to reload the whole page.
       */

      setBookings(
        (
          currentBookings
        ) =>
          currentBookings.map(
            (
              currentBooking
            ) =>
              currentBooking.bookingReference ===
              booking.bookingReference
                ? {
                    ...currentBooking,

                    status:
                      "cancelled",
                  }
                : currentBooking
          )
      )

      setMessage(
        result.alreadyCancelled
          ? "This booking was already cancelled."
          : "Booking cancelled successfully."
      )

      setIsError(false)
    } catch (error) {
      setIsError(true)

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to cancel booking."
      )
    } finally {
      setCancellingReference(
        null
      )
    }
  }

  /*
   * =========================================
   * PAGE
   * =========================================
   */

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section>
        <p className="text-sm font-medium text-[#512978]">
          Trips
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          My Bookings
        </h1>

        <p className="mt-2 text-slate-600">
          View your upcoming reservations and previous trips.
        </p>
      </section>

      {/* SUMMARY */}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={
            TicketCheck
          }
          label="Upcoming"
          value={
            upcomingBookings.length.toString()
          }
          description="Upcoming reservations"
        />

        <SummaryCard
          icon={
            CheckCircle2
          }
          label="Completed"
          value={
            completedCount.toString()
          }
          description="Previous completed trips"
        />

        <SummaryCard
          icon={
            XCircle
          }
          label="Cancelled"
          value={
            cancelledCount.toString()
          }
          description="Cancelled reservations"
        />
      </section>

      {/* BOOKING HISTORY */}

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-900">
                Booking history
              </CardTitle>

              <CardDescription className="mt-1">
                Review your current and previous trip reservations.
              </CardDescription>
            </div>

            {/* TABS */}

            <div className="flex w-full rounded-lg bg-slate-100 p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab(
                    "upcoming"
                  )

                  setMessage("")
                  setIsError(false)
                }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none ${
                  activeTab ===
                  "upcoming"
                    ? "bg-white text-[#512978] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upcoming
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab(
                    "previous"
                  )

                  setMessage("")
                  setIsError(false)
                }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none ${
                  activeTab ===
                  "previous"
                    ? "bg-white text-[#512978] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Previous
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <p className="text-sm text-slate-500">
                Loading your bookings...
              </p>
            </div>
          ) : displayedBookings.length >
            0 ? (
            displayedBookings.map(
              (booking) => (
                <BookingCard
                  key={
                    booking.id
                  }
                  booking={
                    booking
                  }
                  showCancelButton={
                    activeTab ===
                      "upcoming" &&
                    booking.status.toLowerCase() ===
                      "confirmed"
                  }
                  cancelling={
                    cancellingReference ===
                    booking.bookingReference
                  }
                  onShowQr={() =>
                    showQr(
                      booking
                    )
                  }
                  onCancel={() =>
                    cancelBooking(
                      booking
                    )
                  }
                />
              )
            )
          ) : (
            <EmptyBookingsState
              activeTab={
                activeTab
              }
            />
          )}

          {message && (
            <div
              className={`rounded-lg border px-4 py-3 ${
                isError
                  ? "border-red-200 bg-red-50"
                  : "border-purple-100 bg-purple-50"
              }`}
            >
              <p
                className={`text-sm ${
                  isError
                    ? "text-red-700"
                    : "text-slate-700"
                }`}
              >
                {message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR MODAL */}

      {qrBooking && (
        <QrTicketModal
          booking={
            qrBooking
          }
          baseUrl={
            qrBaseUrl
          }
          onClose={() => {
            setQrBooking(
              null
            )

            setQrBaseUrl(
              ""
            )
          }}
        />
      )}
    </div>
  )
}

/*
 * =========================================
 * BOOKING CARD
 * =========================================
 */

function BookingCard({
  booking,
  showCancelButton,
  cancelling,
  onShowQr,
  onCancel,
}: {
  booking: Booking
  showCancelButton: boolean
  cancelling: boolean
  onShowQr: () => void
  onCancel: () => void
}) {
  const status =
    formatStatus(
      booking.status
    )

  const statusStyles =
    status === "Confirmed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Completed"
        ? "bg-blue-50 text-blue-700"
        : status === "Cancelled"
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-700"

  const seatText =
    booking.seats.length >
    0
      ? booking.seats
          .map(
            (seat) =>
              `Seat ${seat}`
          )
          .join(", ")
      : "Not available"

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* BOOKING HEADER */}

      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-semibold text-slate-900">
              Booking{" "}
              {
                booking.bookingReference
              }
            </p>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles}`}
            >
              {status}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {booking.departureTime
              ? formatDate(
                  booking.departureTime
                )
              : "Date unavailable"}
          </p>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-2">
          {booking.status.toLowerCase() ===
            "confirmed" && (
            <Button
              type="button"
              onClick={
                onShowQr
              }
              disabled={
                cancelling
              }
              className="bg-[#512978] text-white hover:bg-[#40205f]"
            >
              <QrCode className="size-4" />

              Show QR
            </Button>
          )}

          {showCancelButton && (
            <Button
              type="button"
              variant="outline"
              onClick={
                onCancel
              }
              disabled={
                cancelling
              }
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <XCircle className="size-4" />

              {cancelling
                ? "Cancelling..."
                : "Cancel booking"}
            </Button>
          )}
        </div>
      </div>

      {/* BOOKING INFORMATION */}

      <div className="grid gap-6 p-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          {/* ROUTE */}

          <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <LocationBlock
              icon={
                Navigation
              }
              label="Pickup point"
              value={
                booking.pickupArea
                  ? `${booking.pickupPoint}, ${booking.pickupArea}`
                  : booking.pickupPoint
              }
            />

            <div className="hidden items-center sm:flex">
              <div className="h-px w-10 bg-slate-300" />

              <BusFront className="mx-2 size-5 text-[#512978]" />

              <div className="h-px w-10 bg-slate-300" />
            </div>

            <LocationBlock
              icon={
                MapPin
              }
              label="Destination"
              value={
                booking.destination
              }
            />
          </div>

          {/* TRIP DETAILS */}

          <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
            <TripDetail
              icon={
                CalendarDays
              }
              label="Date"
              value={
                booking.departureTime
                  ? formatDate(
                      booking.departureTime
                    )
                  : "Unavailable"
              }
            />

            <TripDetail
              icon={
                Clock3
              }
              label="Departure"
              value={
                booking.departureTime
                  ? formatTime(
                      booking.departureTime
                    )
                  : "Unavailable"
              }
            />

            <TripDetail
              icon={
                UserRound
              }
              label="Seat"
              value={
                seatText
              }
            />
          </div>
        </div>

        {/* VEHICLE */}

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Vehicle details
          </p>

          <div className="mt-4 flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
              <BusFront className="size-5" />
            </div>

            <div>
              <p className="font-medium text-slate-900">
                {
                  booking.bus
                }
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Plate number
              </p>

              <p className="mt-0.5 text-sm font-medium text-slate-800">
                {
                  booking.plateNumber
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/*
 * =========================================
 * QR TICKET MODAL
 * =========================================
 */

function QrTicketModal({
  booking,
  baseUrl,
  onClose,
}: {
  booking: Booking
  baseUrl: string
  onClose: () => void
}) {
  const scanUrl =
    `${baseUrl}/scan/${encodeURIComponent(
      booking.bookingReference
    )}`

  const seatText =
    booking.seats.length >
    0
      ? booking.seats
          .map(
            (seat) =>
              `${seat}`
          )
          .join(", ")
      : "N/A"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-purple-50 text-[#512978]">
            <QrCode className="size-6" />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#512978]">
            CairoRoute
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            Boarding Ticket
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Show this QR code when boarding the bus.
          </p>
        </div>

        <div className="mt-6 flex justify-center rounded-xl border border-slate-200 bg-white p-6">
          <QRCodeSVG
            value={
              scanUrl
            }
            size={
              220
            }
            level="H"
            includeMargin
          />
        </div>

        <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
          <TicketRow
            label="Booking"
            value={
              booking.bookingReference
            }
          />

          <TicketRow
            label="Passenger"
            value={
              booking.passengerName
            }
          />

          <TicketRow
            label="Seat"
            value={
              seatText
            }
          />

          <TicketRow
            label="Pickup"
            value={
              booking.pickupPoint
            }
          />

          <TicketRow
            label="Destination"
            value={
              booking.destination
            }
          />

          <TicketRow
            label="Departure"
            value={
              booking.departureTime
                ? `${formatDate(
                    booking.departureTime
                  )} • ${formatTime(
                    booking.departureTime
                  )}`
                : "Unavailable"
            }
          />
        </div>

        <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50 p-3">
          <p className="text-center text-xs leading-5 text-slate-600">
            Scan this ticket when boarding. Once verified, the booking will be marked as completed.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={
            onClose
          }
          className="mt-5 w-full"
        >
          Close
        </Button>
      </div>
    </div>
  )
}

/*
 * =========================================
 * TICKET ROW
 * =========================================
 */

function TicketRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="max-w-[210px] text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  )
}

/*
 * =========================================
 * SUMMARY CARD
 * =========================================
 */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ElementType
  label: string
  value: string
  description: string
}) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
          <Icon className="size-5" />
        </div>

        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/*
 * =========================================
 * LOCATION BLOCK
 * =========================================
 */

function LocationBlock({
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
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
        <Icon className="size-4" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium leading-6 text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

/*
 * =========================================
 * TRIP DETAIL
 * =========================================
 */

function TripDetail({
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
      <Icon className="mt-0.5 size-4 shrink-0 text-[#512978]" />

      <div>
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

/*
 * =========================================
 * EMPTY STATE
 * =========================================
 */

function EmptyBookingsState({
  activeTab,
}: {
  activeTab: BookingTab
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-purple-50 text-[#512978]">
        <TicketCheck className="size-7" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        {activeTab ===
        "upcoming"
          ? "No upcoming bookings"
          : "No previous bookings"}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {activeTab ===
        "upcoming"
          ? "When you reserve a trip, your confirmed booking will appear here."
          : "Your completed and cancelled trips will appear here."}
      </p>
    </div>
  )
}

/*
 * =========================================
 * FORMATTING
 * =========================================
 */

function formatStatus(
  status: string
) {
  if (!status) {
    return "Unknown"
  }

  return (
    status
      .charAt(0)
      .toUpperCase() +
    status
      .slice(1)
      .toLowerCase()
  )
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-EG",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(value)
  )
}

function formatTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-EG",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  )
}