"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation"

import {
  ArrowLeft,
  BusFront,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Route,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

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

type Trip = {
  id: number

  departureTime: string
  arrivalTime: string | null

  price: number
  status: string

  route: {
    id: number | null

    estimatedDurationMinutes: number | null

    pickupPoint: {
      id: number | null
      name: string
      area: string | null
      latitude: number | null
      longitude: number | null
    }

    destination: {
      id: number | null
      name: string
      latitude: number | null
      longitude: number | null
    }

    stops: {
      id: number
      order: number
      name: string
      area: string | null
      latitude: number | null
      longitude: number | null
      type: "origin" | "intermediate" | "destination"
    }[]
  }

  bus: {
    id: number | null
    name: string
    brand: string | null
    model: string | null
    plateNumber: string
    color: string | null
    capacity: number
  }

  occupiedSeats: number[]
  availableSeats: number
}

type TripResponse = {
  trip?: Trip
  message?: string
  error?: string
}

type BookingResponse = {
  message: string

  error?: string

  unavailableSeats?: number[]

  booking?: {
    id: number
    user_id: string
    trip_id: number
    booking_reference: string
    status: string
    passenger_name: string
    passenger_phone: string
    passenger_email: string | null
    total_price: number
  }
}

export default function BookingPage() {
  const params =
    useParams<{ id: string }>()

  const router =
    useRouter()

  const searchParams =
    useSearchParams()

  const tripId =
    params.id

  const currentLocation =
    searchParams.get("from") ||
    "Your current location"

  const destinationId =
    searchParams.get(
      "destinationId"
    ) || ""

  const [trip, setTrip] =
    useState<Trip | null>(null)

  const [
    selectedSeat,
    setSelectedSeat,
  ] =
    useState<number | null>(null)

  const [
    fullName,
    setFullName,
  ] = useState("")

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("")

  const [
    email,
    setEmail,
  ] = useState("")

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    message,
    setMessage,
  ] = useState("")

  /*
   * ---------------------------------------
   * LOAD THE SELECTED TRIP
   * ---------------------------------------
   */

  useEffect(() => {
    if (!tripId) {
      return
    }

    async function loadTrip() {
      try {
        const response =
          await fetch(
            `/api/trips/${encodeURIComponent(
              tripId
            )}`,
            {
              cache: "no-store",
            }
          )

        const result =
          (await response.json()) as TripResponse

        if (!response.ok) {
          throw new Error(
            result.error
              ? `${result.message} ${result.error}`
              : result.message ||
                  "Failed to load trip."
          )
        }

        if (!result.trip) {
          throw new Error(
            "Trip data was not returned."
          )
        }

        setTrip(result.trip)
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load trip."
        )
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [tripId])

  /*
   * ---------------------------------------
   * ALREADY RESERVED SEATS
   * ---------------------------------------
   */

  const unavailableSeats =
    useMemo(() => {
      return new Set(
        trip?.occupiedSeats?.map(
          (seatNumber) =>
            Number(seatNumber)
        ) ?? []
      )
    }, [trip])

  /*
   * ---------------------------------------
   * CREATE SEATS FROM BUS CAPACITY
   * ---------------------------------------
   */

  const seatNumbers =
    useMemo(() => {
      if (!trip) {
        return []
      }

      return Array.from(
        {
          length: Number(
            trip.bus.capacity
          ),
        },
        (_, index) =>
          index + 1
      )
    }, [trip])

  /*
   * ---------------------------------------
   * CREATE THE BOOKING
   * ---------------------------------------
   */

  async function confirmBooking(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!trip) {
      setMessage(
        "The trip information is unavailable."
      )

      return
    }

    if (selectedSeat === null) {
      setMessage(
        "Select an available seat."
      )

      return
    }

    if (!fullName.trim()) {
      setMessage(
        "Enter your full name."
      )

      return
    }

    if (!phoneNumber.trim()) {
      setMessage(
        "Enter your phone number."
      )

      return
    }

    if (!acceptedTerms) {
      setMessage(
        "Confirm that you reviewed the booking."
      )

      return
    }

    setSubmitting(true)
    setMessage("")

    try {
      /*
       * Get the browser's REAL authenticated session.
       */
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

      /*
       * Send the Supabase access token to our API.
       */
      const response =
        await fetch(
          "/api/bookings",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              tripId:
                trip.id,

              seatNumbers: [
                selectedSeat,
              ],

              passengerName:
                fullName.trim(),

              passengerPhone:
                phoneNumber.trim(),

              passengerEmail:
                email.trim() ||
                null,
            }),
          }
        )

      const result =
        (await response.json()) as BookingResponse

      /*
       * ---------------------------------------
       * HANDLE BOOKING FAILURE
       * ---------------------------------------
       */

      if (
        !response.ok ||
        !result.booking
      ) {
        /*
         * Someone may have booked this seat
         * after we originally loaded the page.
         */
        if (
          result.unavailableSeats?.includes(
            selectedSeat
          )
        ) {
          setTrip(
            (
              previousTrip
            ) => {
              if (
                !previousTrip
              ) {
                return previousTrip
              }

              const seatAlreadyExists =
                previousTrip.occupiedSeats.some(
                  (seatNumber) =>
                    Number(
                      seatNumber
                    ) ===
                    selectedSeat
                )

              if (
                seatAlreadyExists
              ) {
                return previousTrip
              }

              return {
                ...previousTrip,

                occupiedSeats: [
                  ...previousTrip.occupiedSeats,
                  selectedSeat,
                ],

                availableSeats:
                  Math.max(
                    0,
                    previousTrip.availableSeats -
                      1
                  ),
              }
            }
          )

          setSelectedSeat(
            null
          )
        }

        throw new Error(
          result.error
            ? `${result.message} ${result.error}`
            : result.message ||
                "Failed to create booking."
        )
      }

      /*
       * ---------------------------------------
       * BOOKING SUCCESS
       * ---------------------------------------
       *
       * Success page only needs confirmation data.
       */

      const successParams =
        new URLSearchParams({
          bookingId:
            result.booking.id.toString(),

          bookingReference:
            result.booking
              .booking_reference,

          seat:
            selectedSeat.toString(),

          name:
            result.booking
              .passenger_name,
        })

      router.push(
        `/dashboard/booking-success?${successParams.toString()}`
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to create booking."
      )
    } finally {
      setSubmitting(
        false
      )
    }
  }

  /*
   * ---------------------------------------
   * PAGE STATES
   * ---------------------------------------
   */

  if (!tripId) {
    return (
      <PageMessage
        title="Trip not found"
        message="No trip ID was provided."
      />
    )
  }

  if (loading) {
    return (
      <PageMessage
        message="Loading booking details..."
      />
    )
  }

  if (!trip) {
    return (
      <PageMessage
        title="Trip not found"
        message={
          message ||
          "The selected trip could not be loaded."
        }
      />
    )
  }

  const destination =
    trip.route
      .destination.name

  const vehicleName =
    [
      trip.bus.brand,
      trip.bus.model,
    ]
      .filter(Boolean)
      .join(" ") ||
    trip.bus.name

  const backParams =
    new URLSearchParams({
      from:
        currentLocation,

      to:
        destination,
    })

  if (destinationId) {
    backParams.set(
      "destinationId",
      destinationId
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section>
        <Link
          href={`/dashboard/routes/${trip.id}?${backParams.toString()}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#512978] hover:underline"
        >
          <ArrowLeft className="size-4" />

          Back to trip details
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          Complete your booking
        </h1>

        <p className="mt-2 text-slate-600">
          Select your seat and enter your passenger information.
        </p>
      </section>

      <form
        onSubmit={
          confirmBooking
        }
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                Select your seat
              </CardTitle>

              <CardDescription>
                Reserved seats cannot be selected.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="mx-auto max-w-md">
                <div className="mb-6 flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BusFront className="size-5 text-[#512978]" />

                    <span className="text-sm font-medium text-slate-800">
                      Front of bus
                    </span>
                  </div>

                  <div className="size-8 rounded-full border-4 border-slate-400" />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {seatNumbers.map(
                    (
                      seatNumber
                    ) => {
                      const unavailable =
                        unavailableSeats.has(
                          seatNumber
                        )

                      const selected =
                        selectedSeat ===
                        seatNumber

                      return (
                        <button
                          key={
                            seatNumber
                          }
                          type="button"
                          disabled={
                            unavailable ||
                            submitting
                          }
                          onClick={() => {
                            setSelectedSeat(
                              seatNumber
                            )

                            setMessage(
                              ""
                            )
                          }}
                          className={`flex h-12 items-center justify-center rounded-lg border text-sm font-medium transition ${
                            unavailable
                              ? "cursor-not-allowed border-slate-200 bg-slate-200 text-slate-400"
                              : selected
                                ? "border-[#512978] bg-[#512978] text-white"
                                : "border-slate-300 bg-white text-slate-700 hover:border-[#512978] hover:bg-purple-50"
                          }`}
                        >
                          {selected ? (
                            <Check className="size-4" />
                          ) : (
                            seatNumber
                          )}
                        </button>
                      )
                    }
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-600">
                  <LegendItem
                    className="border-slate-300 bg-white"
                    label="Available"
                  />

                  <LegendItem
                    className="border-[#512978] bg-[#512978]"
                    label="Selected"
                  />

                  <LegendItem
                    className="border-slate-200 bg-slate-200"
                    label="Reserved"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                Passenger information
              </CardTitle>

              <CardDescription>
                Enter the passenger details for this reservation.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="full-name">
                  Full name
                </Label>

                <Input
                  id="full-name"
                  value={
                    fullName
                  }
                  disabled={
                    submitting
                  }
                  onChange={(
                    event
                  ) => {
                    setFullName(
                      event.target
                        .value
                    )

                    setMessage(
                      ""
                    )
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone number
                </Label>

                <Input
                  id="phone"
                  type="tel"
                  value={
                    phoneNumber
                  }
                  disabled={
                    submitting
                  }
                  onChange={(
                    event
                  ) => {
                    setPhoneNumber(
                      event.target
                        .value
                    )

                    setMessage(
                      ""
                    )
                  }}
                  placeholder="+20 1XX XXX XXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email address
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={
                    email
                  }
                  disabled={
                    submitting
                  }
                  onChange={(
                    event
                  ) => {
                    setEmail(
                      event.target
                        .value
                    )

                    setMessage(
                      ""
                    )
                  }}
                  placeholder="name@example.com"
                />
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 md:col-span-2">
                <input
                  type="checkbox"
                  checked={
                    acceptedTerms
                  }
                  disabled={
                    submitting
                  }
                  onChange={(
                    event
                  ) => {
                    setAcceptedTerms(
                      event.target
                        .checked
                    )

                    setMessage(
                      ""
                    )
                  }}
                  className="mt-1 size-4 accent-[#512978]"
                />

                <span className="text-sm leading-6 text-slate-700">
                  I reviewed the trip and selected-seat details.
                </span>
              </label>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                Booking summary
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
              <SummaryItem
                icon={
                  MapPin
                }
                label="Pickup point"
                value={
                  trip.route
                    .pickupPoint
                    .name
                }
              />

              <SummaryItem
                icon={
                  MapPin
                }
                label="Destination"
                value={
                  destination
                }
              />

              <SummaryItem
                icon={
                  CalendarDays
                }
                label="Date"
                value={formatDate(
                  trip.departureTime
                )}
              />

              <SummaryItem
                icon={
                  Clock3
                }
                label="Departure"
                value={formatTime(
                  trip.departureTime
                )}
              />

              <SummaryItem
                icon={
                  BusFront
                }
                label="Vehicle"
                value={
                  vehicleName
                }
              />

              <SummaryItem
                icon={
                  UserRound
                }
                label="Selected seat"
                value={
                  selectedSeat ===
                  null
                    ? "Not selected"
                    : `Seat ${selectedSeat}`
                }
              />

              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Total price
                  </span>

                  <span className="text-2xl font-semibold text-slate-900">
                    EGP{" "}
                    {Number(
                      trip.price
                    ).toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-purple-100 bg-purple-50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#512978]" />

                <div>
                  <p className="font-medium text-slate-900">
                    Confirm your booking
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Review your trip and passenger information before confirming.
                  </p>
                </div>
              </div>

              {message && (
                <p className="mt-4 rounded-lg bg-white p-3 text-sm text-red-700">
                  {message}
                </p>
              )}

              <Button
                type="submit"
                disabled={
                  submitting
                }
                className="mt-5 h-11 w-full bg-[#512978] text-white hover:bg-[#40205f]"
              >
                {submitting
                  ? "Confirming booking..."
                  : "Confirm booking"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  )
}

function PageMessage({
  title,
  message,
}: {
  title?: string
  message: string
}) {
  return (
    <Card className="mx-auto max-w-4xl border-slate-200 bg-white shadow-sm">
      <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
        <Route className="size-10 text-slate-400" />

        {title && (
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            {title}
          </h1>
        )}

        <p className="mt-2 text-slate-500">
          {message}
        </p>
      </CardContent>
    </Card>
  )
}

function SummaryItem({
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

function LegendItem({
  className,
  label,
}: {
  className: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`size-4 rounded border ${className}`}
      />

      <span>
        {label}
      </span>
    </div>
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