"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  Clock3,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
  TicketCheck,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import {
  useAppPreferences,
  type LanguagePreference,
} from "@/components/app-preferences-provider"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

const PAGE_LOAD_TIME =
  Date.now()

type Destination = {
  id: number
  name: string
  latitude: number | null
  longitude: number | null
  is_active: boolean
}

type PickupPoint = {
  id: number
  name: string
  area: string | null
  latitude: number | null
  longitude: number | null
}

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

type Coordinates = {
  latitude: number
  longitude: number
}

type NearestPickup = {
  pickup: PickupPoint
  distanceKm: number
}

/*
 * =========================================
 * DASHBOARD MESSAGES
 * =========================================
 */

const dashboardMessages = {
  english: {
    failedPickupPoints:
      "Failed to load pickup points.",

    failedBookings:
      "Failed to load bookings.",

    browserLocationUnsupported:
      "Your browser does not support location detection.",

    detectingLocation:
      "Detecting your current location...",

    locationDetected:
      "Your location was detected successfully.",

    locationBlocked:
      "Location permission was blocked. Enter your location manually.",

    missingSearchFields:
      "Enter your current location and select a destination.",

    useCurrentLocation:
      "Use current location",
  },

  arabic: {
    failedPickupPoints:
      "تعذر تحميل نقاط الركوب.",

    failedBookings:
      "تعذر تحميل الحجوزات.",

    browserLocationUnsupported:
      "متصفحك لا يدعم تحديد الموقع.",

    detectingLocation:
      "جارٍ تحديد موقعك الحالي...",

    locationDetected:
      "تم تحديد موقعك بنجاح.",

    locationBlocked:
      "تم حظر إذن الموقع. أدخل موقعك يدويًا.",

    missingSearchFields:
      "أدخل موقعك الحالي واختر وجهة.",

    useCurrentLocation:
      "استخدام الموقع الحالي",
  },

  french: {
    failedPickupPoints:
      "Impossible de charger les points de prise en charge.",

    failedBookings:
      "Impossible de charger les réservations.",

    browserLocationUnsupported:
      "Votre navigateur ne prend pas en charge la détection de la position.",

    detectingLocation:
      "Détection de votre position actuelle...",

    locationDetected:
      "Votre position a été détectée avec succès.",

    locationBlocked:
      "L’autorisation de localisation a été bloquée. Entrez votre position manuellement.",

    missingSearchFields:
      "Entrez votre position actuelle et sélectionnez une destination.",

    useCurrentLocation:
      "Utiliser la position actuelle",
  },
} as const

/*
 * =========================================
 * DATABASE DISPLAY TRANSLATIONS
 *
 * IMPORTANT:
 * These translations are ONLY used when
 * displaying database values.
 *
 * The real database value remains unchanged.
 * =========================================
 */

const locationTranslations: Record<
  string,
  {
    arabic: string
    french: string
  }
> = {
  "new cairo": {
    arabic: "القاهرة الجديدة",
    french: "Nouveau Caire",
  },

  "fifth settlement": {
    arabic: "التجمع الخامس",
    french: "Cinquième arrondissement",
  },

  "5th settlement": {
    arabic: "التجمع الخامس",
    french: "Cinquième arrondissement",
  },

  "first settlement": {
    arabic: "التجمع الأول",
    french: "Premier arrondissement",
  },

  "third settlement": {
    arabic: "التجمع الثالث",
    french: "Troisième arrondissement",
  },

  rehab: {
    arabic: "الرحاب",
    french: "Al Rehab",
  },

  "el rehab": {
    arabic: "الرحاب",
    french: "Al Rehab",
  },

  madinaty: {
    arabic: "مدينتي",
    french: "Madinaty",
  },

  shorouk: {
    arabic: "الشروق",
    french: "El Shorouk",
  },

  "el shorouk": {
    arabic: "الشروق",
    french: "El Shorouk",
  },

  maadi: {
    arabic: "المعادي",
    french: "Maadi",
  },

  "el maadi": {
    arabic: "المعادي",
    french: "Maadi",
  },

  "nasr city": {
    arabic: "مدينة نصر",
    french: "Nasr City",
  },

  "madinet nasr": {
    arabic: "مدينة نصر",
    french: "Nasr City",
  },

  "heliopolis": {
    arabic: "مصر الجديدة",
    french: "Héliopolis",
  },

  "masr el gedida": {
    arabic: "مصر الجديدة",
    french: "Héliopolis",
  },

  "misr el gedida": {
    arabic: "مصر الجديدة",
    french: "Héliopolis",
  },

  "6th of october": {
    arabic: "6 أكتوبر",
    french: "6 Octobre",
  },

  "6 october": {
    arabic: "6 أكتوبر",
    french: "6 Octobre",
  },

  "october": {
    arabic: "أكتوبر",
    french: "Octobre",
  },

  "sheikh zayed": {
    arabic: "الشيخ زايد",
    french: "Cheikh Zayed",
  },

  "downtown cairo": {
    arabic: "وسط القاهرة",
    french: "Centre-ville du Caire",
  },

  downtown: {
    arabic: "وسط البلد",
    french: "Centre-ville",
  },

  "new capital": {
    arabic: "العاصمة الإدارية الجديدة",
    french: "Nouvelle capitale administrative",
  },

  "new administrative capital": {
    arabic: "العاصمة الإدارية الجديدة",
    french: "Nouvelle capitale administrative",
  },

  "abbas el akkاد": {
    arabic: "عباس العقاد",
    french: "Abbas El Akkad",
  },

  "abbas el akkad": {
    arabic: "عباس العقاد",
    french: "Abbas El Akkad",
  },

  "makram ebeid": {
    arabic: "مكرم عبيد",
    french: "Makram Ebeid",
  },

  "el tesعين": {
    arabic: "التسعين",
    french: "Rue 90",
  },

  "90th street": {
    arabic: "شارع التسعين",
    french: "Rue 90",
  },

  "north 90th street": {
    arabic: "شارع التسعين الشمالي",
    french: "Rue 90 Nord",
  },

  "south 90th street": {
    arabic: "شارع التسعين الجنوبي",
    french: "Rue 90 Sud",
  },

  "cairo festival city": {
    arabic: "كايرو فيستيفال سيتي",
    french: "Cairo Festival City",
  },

  "point 90": {
    arabic: "بوينت 90",
    french: "Point 90",
  },

  "american university in cairo": {
    arabic: "الجامعة الأمريكية بالقاهرة",
    french: "Université américaine du Caire",
  },

  "auc": {
    arabic: "الجامعة الأمريكية بالقاهرة",
    french: "Université américaine du Caire",
  },

  "ramses": {
    arabic: "رمسيس",
    french: "Ramsès",
  },

  "tahrir": {
    arabic: "التحرير",
    french: "Tahrir",
  },

  "zamalek": {
    arabic: "الزمالك",
    french: "Zamalek",
  },

  "dokki": {
    arabic: "الدقي",
    french: "Dokki",
  },

  "mohandessin": {
    arabic: "المهندسين",
    french: "Mohandessin",
  },

  "giza": {
    arabic: "الجيزة",
    french: "Gizeh",
  },

  "katameya": {
    arabic: "القطامية",
    french: "Katameya",
  },

  "mokattam": {
    arabic: "المقطم",
    french: "Mokattam",
  },

  "ain shams": {
    arabic: "عين شمس",
    french: "Aïn Shams",
  },

  "new nozha": {
    arabic: "النزهة الجديدة",
    french: "Nouvelle Nozha",
  },

  "nozha": {
    arabic: "النزهة",
    french: "Nozha",
  },

  "obour": {
    arabic: "العبور",
    french: "Obour",
  },

  "el obour": {
    arabic: "العبور",
    french: "Obour",
  },

  "badr city": {
    arabic: "مدينة بدر",
    french: "Ville de Badr",
  },

  "future city": {
    arabic: "مستقبل سيتي",
    french: "Mostakbal City",
  },

  "mostakbal city": {
    arabic: "مستقبل سيتي",
    french: "Mostakbal City",
  },
}

/*
 * =========================================
 * TRANSLATE DATABASE TEXT
 * =========================================
 */

function translateLocationText(
  value: string | null | undefined,
  language: LanguagePreference
) {
  if (!value) {
    return ""
  }

  if (
    language ===
    "english"
  ) {
    return value
  }

  const normalized =
    value
      .trim()
      .toLowerCase()

  const directMatch =
    locationTranslations[
      normalized
    ]

  if (directMatch) {
    return directMatch[
      language
    ]
  }

  /*
   * Try replacing known location names
   * inside a longer database string.
   *
   * Example:
   * "Nasr City - Abbas El Akkad"
   *
   * Arabic:
   * "مدينة نصر - عباس العقاد"
   */

  let translated =
    value

  const entries =
    Object.entries(
      locationTranslations
    ).sort(
      (
        [a],
        [b]
      ) =>
        b.length -
        a.length
    )

  for (
    const [
      english,
      translation,
    ] of entries
  ) {
    const expression =
      new RegExp(
        escapeRegExp(
          english
        ),
        "gi"
      )

    translated =
      translated.replace(
        expression,
        translation[
          language
        ]
      )
  }

  return translated
}

function escapeRegExp(
  value: string
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  )
}

export default function DashboardPage() {
  const router =
    useRouter()

  const {
    language,
    t,
  } =
    useAppPreferences()

  const copy =
    dashboardMessages[
      language
    ]

  const [
    currentLocation,
    setCurrentLocation,
  ] =
    useState("")

  const [
    coordinates,
    setCoordinates,
  ] =
    useState<Coordinates | null>(
      null
    )

  const [
    selectedDestinationId,
    setSelectedDestinationId,
  ] =
    useState("")

  const [
    destinations,
    setDestinations,
  ] =
    useState<Destination[]>(
      []
    )

  const [
    pickupPoints,
    setPickupPoints,
  ] =
    useState<PickupPoint[]>(
      []
    )

  const [
    bookings,
    setBookings,
  ] =
    useState<Booking[]>(
      []
    )

  const [
    destinationsLoading,
    setDestinationsLoading,
  ] =
    useState(true)

  const [
    dashboardLoading,
    setDashboardLoading,
  ] =
    useState(true)

  const [
    destinationsError,
    setDestinationsError,
  ] =
    useState("")

  const [
    message,
    setMessage,
  ] =
    useState("")

  const selectedDestination =
    destinations.find(
      (
        destination
      ) =>
        destination.id.toString() ===
        selectedDestinationId
    )

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response =
          await fetch(
            "/api/destinations",
            {
              cache:
                "no-store",
            }
          )

        const result =
          await response.json()

        if (
          !response.ok
        ) {
          throw new Error(
            result.message ||
              "Failed to load destinations."
          )
        }

        setDestinations(
          result
        )
      } catch (
        error
      ) {
        setDestinationsError(
          error instanceof Error
            ? error.message
            : "Failed to load destinations."
        )
      } finally {
        setDestinationsLoading(
          false
        )
      }
    }

    loadDestinations()
  }, [])

  useEffect(() => {
    async function loadPickupPoints() {
      try {
        const response =
          await fetch(
            "/api/pickup-points",
            {
              cache:
                "no-store",
            }
          )

        const result =
          await response.json()

        if (
          !response.ok
        ) {
          throw new Error(
            result.message ||
              "Failed to load pickup points."
          )
        }

        setPickupPoints(
          result
        )
      } catch (
        error
      ) {
        console.error(
          copy.failedPickupPoints,
          error
        )
      }
    }

    loadPickupPoints()
  }, [
    copy.failedPickupPoints,
  ])

  useEffect(() => {
    async function loadBookings() {
      try {
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
          return
        }

        const response =
          await fetch(
            "/api/my-bookings",
            {
              method:
                "GET",

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

        if (
          !response.ok
        ) {
          throw new Error(
            result.error
              ? `${result.message} ${result.error}`
              : result.message ||
                "Failed to load bookings."
          )
        }

        setBookings(
          result.bookings ??
            []
        )
      } catch (
        error
      ) {
        console.error(
          copy.failedBookings,
          error
        )
      } finally {
        setDashboardLoading(
          false
        )
      }
    }

    loadBookings()
  }, [
    copy.failedBookings,
  ])

  const nextBooking =
    useMemo(() => {
      return (
        bookings
          .filter(
            (
              booking
            ) => {
              if (
                booking.status.toLowerCase() !==
                "confirmed"
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
            (
              a,
              b
            ) => {
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
          )[0] ??
        null
      )
    }, [
      bookings,
    ])

  const nearestPickup =
    useMemo<NearestPickup | null>(
      () => {
        if (
          !coordinates
        ) {
          return null
        }

        const validPickupPoints =
          pickupPoints.filter(
            (
              pickup
            ) =>
              pickup.latitude !==
                null &&
              pickup.longitude !==
                null
          )

        if (
          validPickupPoints.length ===
          0
        ) {
          return null
        }

        const calculated =
          validPickupPoints.map(
            (
              pickup
            ) => ({
              pickup,

              distanceKm:
                calculateDistanceKm(
                  coordinates.latitude,
                  coordinates.longitude,
                  pickup.latitude!,
                  pickup.longitude!
                ),
            })
          )

        calculated.sort(
          (
            a,
            b
          ) =>
            a.distanceKm -
            b.distanceKm
        )

        return (
          calculated[0] ??
          null
        )
      },
      [
        coordinates,
        pickupPoints,
      ]
    )

  function detectLocation() {
    if (
      !navigator.geolocation
    ) {
      setMessage(
        copy.browserLocationUnsupported
      )

      return
    }

    setMessage(
      copy.detectingLocation
    )

    navigator.geolocation.getCurrentPosition(
      (
        position
      ) => {
        const latitude =
          position.coords
            .latitude

        const longitude =
          position.coords
            .longitude

        setCoordinates({
          latitude,
          longitude,
        })

        setCurrentLocation(
          `${latitude.toFixed(
            6
          )}, ${longitude.toFixed(
            6
          )}`
        )

        setMessage(
          copy.locationDetected
        )
      },

      () => {
        setMessage(
          copy.locationBlocked
        )
      }
    )
  }

  function handleLocationChange(
    value: string
  ) {
    setCurrentLocation(
      value
    )

    setMessage("")

    const parsed =
      parseCoordinates(
        value
      )

    setCoordinates(
      parsed
    )
  }

  function searchRoutes() {
    const cleanLocation =
      currentLocation.trim()

    if (
      !cleanLocation ||
      !selectedDestination
    ) {
      setMessage(
        copy.missingSearchFields
      )

      return
    }

    setMessage("")

    /*
     * IMPORTANT:
     * We use the ORIGINAL database name here.
     *
     * We do NOT send the Arabic/French display
     * translation to the API.
     */
    const params =
      new URLSearchParams(
        {
          from: cleanLocation,

          to:
            selectedDestination.name,

          destinationId:
            selectedDestination.id.toString(),
        }
      )

    router.push(
      `/dashboard/results?${params.toString()}`
    )
  }

  function handleLocationKeyDown(
    event:
      React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key ===
      "Enter"
    ) {
      searchRoutes()
    }
  }

  function openBookings() {
    router.push(
      "/dashboard/bookings"
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section
        className="relative min-h-[320px] overflow-hidden rounded-2xl bg-slate-800 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/images/cairo-bus.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-[#32184d]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/10" />

        <div className="relative flex min-h-[320px] items-end p-7 text-white md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-white/75">
              {t(
                "transportationAcrossCairo"
              )}
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {t(
                "whereDoYouWantToGo"
              )}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/85 md:text-base">
              {t(
                "dashboardHeroDescription"
              )}
            </p>
          </div>
        </div>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
              <Route className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900">
                {t(
                  "planYourTrip"
                )}
              </CardTitle>

              <CardDescription className="mt-1">
                {t(
                  "planTripDescription"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
            <div className="space-y-2">
              <Label
                htmlFor="current-location"
                className="text-sm font-medium text-slate-700"
              >
                {t(
                  "currentLocation"
                )}
              </Label>

              <div className="relative">
                <Navigation className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="current-location"
                  value={
                    currentLocation
                  }
                  onChange={(
                    event
                  ) =>
                    handleLocationChange(
                      event.target
                        .value
                    )
                  }
                  onKeyDown={
                    handleLocationKeyDown
                  }
                  placeholder={t(
                    "enterCurrentLocation"
                  )}
                  className="h-12 border-slate-300 bg-white pl-10 pr-12"
                />

                <button
                  type="button"
                  onClick={
                    detectLocation
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#512978] transition hover:bg-purple-50"
                  aria-label={
                    copy.useCurrentLocation
                  }
                  title={
                    copy.useCurrentLocation
                  }
                >
                  <LocateFixed className="size-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="destination"
                className="text-sm font-medium text-slate-700"
              >
                {t(
                  "destination"
                )}
              </Label>

              <Select
                value={
                  selectedDestinationId
                }
                onValueChange={(
                  value
                ) => {
                  if (
                    value !==
                    null
                  ) {
                    setSelectedDestinationId(
                      value
                    )

                    setMessage(
                      ""
                    )
                  }
                }}
                disabled={
                  destinationsLoading ||
                  Boolean(
                    destinationsError
                  )
                }
              >
                <SelectTrigger
                  id="destination"
                  className="h-12 w-full border-slate-300 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-slate-400" />

                    <span
                      className={
                        selectedDestination
                          ? "text-slate-900"
                          : "text-slate-500"
                      }
                    >
                      {destinationsLoading
                        ? t(
                            "loadingDestinations"
                          )
                        : selectedDestination
                          ? translateLocationText(
                              selectedDestination.name,
                              language
                            )
                          : t(
                              "selectDestination"
                            )}
                    </span>
                  </div>
                </SelectTrigger>

                <SelectContent>
                  {destinations.map(
                    (
                      destination
                    ) => (
                      <SelectItem
                        key={
                          destination.id
                        }
                        value={destination.id.toString()}
                      >
                        {translateLocationText(
                          destination.name,
                          language
                        )}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {destinationsError && (
                <p className="text-sm text-red-600">
                  {
                    destinationsError
                  }
                </p>
              )}
            </div>

            <Button
              type="button"
              onClick={
                searchRoutes
              }
              disabled={
                destinationsLoading ||
                Boolean(
                  destinationsError
                ) ||
                destinations.length ===
                  0
              }
              className="h-12 bg-[#512978] px-6 text-white hover:bg-[#40205f]"
            >
              {t(
                "searchRoutes"
              )}

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
        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
                <CalendarDays className="size-5" />
              </div>

              <div>
                <CardTitle className="text-lg text-slate-900">
                  {t(
                    "upcomingTrip"
                  )}
                </CardTitle>

                <CardDescription className="mt-1">
                  {t(
                    "upcomingTripDescription"
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {dashboardLoading ? (
              <div className="flex min-h-44 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">
                  {t(
                    "loadingNextTrip"
                  )}
                </p>
              </div>
            ) : nextBooking ? (
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#512978] shadow-sm">
                    <BusFront className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {translateLocationText(
                        nextBooking.pickupPoint,
                        language
                      )}{" "}
                      →{" "}
                      {translateLocationText(
                        nextBooking.destination,
                        language
                      )}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        nextBooking.bus
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DashboardDetail
                    icon={
                      CalendarDays
                    }
                    label={t(
                      "date"
                    )}
                    value={
                      nextBooking.departureTime
                        ? formatDate(
                            nextBooking.departureTime,
                            language
                          )
                        : t(
                            "unavailable"
                          )
                    }
                  />

                  <DashboardDetail
                    icon={
                      Clock3
                    }
                    label={t(
                      "departure"
                    )}
                    value={
                      nextBooking.departureTime
                        ? formatTime(
                            nextBooking.departureTime,
                            language
                          )
                        : t(
                            "unavailable"
                          )
                    }
                  />

                  <DashboardDetail
                    icon={
                      TicketCheck
                    }
                    label={t(
                      "seat"
                    )}
                    value={
                      nextBooking.seats.length >
                      0
                        ? nextBooking.seats
                            .map(
                              (
                                seat
                              ) =>
                                `${seat}`
                            )
                            .join(
                              ", "
                            )
                        : t(
                            "unavailable"
                          )
                    }
                  />

                  <DashboardDetail
                    icon={
                      BusFront
                    }
                    label={t(
                      "plate"
                    )}
                    value={
                      nextBooking.plateNumber ||
                      t(
                        "unavailable"
                      )
                    }
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    openBookings
                  }
                  className="mt-5 w-full border-purple-200 text-[#512978] hover:bg-purple-50"
                >
                  {t(
                    "viewMyBooking"
                  )}

                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <BusFront className="mb-3 size-8 text-slate-400" />

                <p className="font-medium text-slate-800">
                  {t(
                    "noUpcomingTrips"
                  )}
                </p>

                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  {t(
                    "noUpcomingTripsDescription"
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
                <MapPin className="size-5" />
              </div>

              <div>
                <CardTitle className="text-lg text-slate-900">
                  {t(
                    "nearestPickupPoint"
                  )}
                </CardTitle>

                <CardDescription className="mt-1">
                  {t(
                    "nearestPickupDescription"
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {nearestPickup ? (
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#512978] shadow-sm">
                    <Navigation className="size-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {translateLocationText(
                        nearestPickup.pickup.name,
                        language
                      )}
                    </p>

                    {nearestPickup
                      .pickup
                      .area && (
                      <p className="mt-1 text-sm text-slate-500">
                        {translateLocationText(
                          nearestPickup.pickup.area,
                          language
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-lg bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t(
                      "approximateDistance"
                    )}
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#512978]">
                    {formatDistance(
                      nearestPickup.distanceKm,
                      language
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {t(
                      "straightLineDistance"
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <MapPin className="mb-3 size-8 text-slate-400" />

                <p className="font-medium text-slate-800">
                  {t(
                    "locationNotSelected"
                  )}
                </p>

                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  {t(
                    "locationNotSelectedDescription"
                  )}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    detectLocation
                  }
                  className="mt-4 border-purple-200 text-[#512978] hover:bg-purple-50"
                >
                  <LocateFixed className="size-4" />

                  {t(
                    "detectLocation"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function DashboardDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-white p-3">
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

function parseCoordinates(
  value: string
): Coordinates | null {
  const parts =
    value
      .split(",")
      .map(
        (
          part
        ) =>
          part.trim()
      )

  if (
    parts.length !==
    2
  ) {
    return null
  }

  const latitude =
    Number(
      parts[0]
    )

  const longitude =
    Number(
      parts[1]
    )

  if (
    !Number.isFinite(
      latitude
    ) ||
    !Number.isFinite(
      longitude
    )
  ) {
    return null
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }

  return {
    latitude,
    longitude,
  }
}

function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadiusKm =
    6371

  const latitudeDifference =
    degreesToRadians(
      latitude2 -
        latitude1
    )

  const longitudeDifference =
    degreesToRadians(
      longitude2 -
        longitude1
    )

  const firstLatitude =
    degreesToRadians(
      latitude1
    )

  const secondLatitude =
    degreesToRadians(
      latitude2
    )

  const a =
    Math.sin(
      latitudeDifference /
        2
    ) **
      2 +
    Math.cos(
      firstLatitude
    ) *
      Math.cos(
        secondLatitude
      ) *
      Math.sin(
        longitudeDifference /
          2
      ) **
        2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(
        1 - a
      )
    )

  return (
    earthRadiusKm *
    c
  )
}

function degreesToRadians(
  degrees: number
) {
  return (
    degrees *
    (Math.PI /
      180)
  )
}

function formatDistance(
  distanceKm: number,
  language:
    LanguagePreference
) {
  if (
    distanceKm <
    1
  ) {
    const meters =
      Math.round(
        distanceKm *
          1000
      )

    if (
      language ===
      "arabic"
    ) {
      return `${meters} م`
    }

    return `${meters} m`
  }

  const distance =
    distanceKm.toFixed(
      1
    )

  if (
    language ===
    "arabic"
  ) {
    return `${distance} كم`
  }

  return `${distance} km`
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

function formatDate(
  value: string,
  language:
    LanguagePreference
) {
  return new Intl.DateTimeFormat(
    getLocale(
      language
    ),
    {
      day:
        "numeric",
      month:
        "short",
      year:
        "numeric",
    }
  ).format(
    new Date(
      value
    )
  )
}

function formatTime(
  value: string,
  language:
    LanguagePreference
) {
  return new Intl.DateTimeFormat(
    getLocale(
      language
    ),
    {
      hour:
        "numeric",
      minute:
        "2-digit",
    }
  ).format(
    new Date(
      value
    )
  )
}