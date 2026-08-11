"use client"

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import { useSearchParams } from "next/navigation"

import {
  ArrowLeft,
  BusFront,
  Clock3,
  MapPin,
  Navigation,
  Route,
  Users,
  WalletCards,
} from "lucide-react"

import ResultsMapWrapper from "@/components/results-map-wrapper"

import {
  useAppPreferences,
  type LanguagePreference,
} from "@/components/app-preferences-provider"

import { buttonVariants } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PickupPoint = {
  id: number
  name: string
  area: string
  latitude: number
  longitude: number
}

type Destination = {
  id: number
  name: string
}

type Bus = {
  id: number
  name: string
  brand: string | null
  model: string | null
  plate_number: string
  color: string | null
  capacity: number
}

type TripFromApi = {
  id: number
  departure_time: string
  arrival_time: string
  price: number
  status: string

  route: {
    id: number
    destination_id: number
    estimated_duration_minutes: number
    pickup_point: PickupPoint
    destination: Destination
  }

  bus: Bus

  booking_seats: {
    id: number
  }[]
}

type DisplayTrip =
  TripFromApi & {
    distanceKm:
      | number
      | null

    availableSeats:
      number
  }

type UserCoordinates = {
  latitude: number
  longitude: number
}

/*
 * =========================================
 * RESULTS TRANSLATIONS
 * =========================================
 */

const resultsCopy = {
  english: {
    yourCurrentLocation:
      "Your current location",

    selectedDestination:
      "Selected destination",

    noDestinationSelected:
      "No destination was selected.",

    failedLoadTrips:
      "Failed to load trips.",

    changeSearch:
      "Change search",

    suggestedTrips:
      "Suggested trips",

    suggestedTripsDescription:
      "Available trips are ordered by the nearest pickup point.",

    resultsFound:
      "Results found",

    currentLocation:
      "Current location",

    destination:
      "Destination",

    availableTrips:
      "Available trips",

    availableTripsDescription:
      "Choose the pickup point and departure time that work best for you.",

    closestSuggestion:
      "Closest suggestion",

    option:
      "Option",

    pickupPoint:
      "Pickup point",

    departure:
      "Departure",

    arrival:
      "Arrival",

    tripDuration:
      "Trip duration",

    distanceToPickup:
      "Distance to pickup",

    vehicle:
      "Vehicle",

    availableSeats:
      "Available seats",

    viewTrip:
      "View trip",

    locationUnavailable:
      "Location unavailable",

    minutes:
      "minutes",

    seats:
      "seats",

    away:
      "away",

    loadingTrips:
      "Loading available trips...",

    failedTripsTitle:
      "Failed to load trips",

    noFutureTrips:
      "No future trips found",

    noFutureTripsPrefix:
      "There are currently no scheduled trips to",

    loadingResults:
      "Loading trip results...",

    currency:
      "EGP",
  },

  arabic: {
    yourCurrentLocation:
      "موقعك الحالي",

    selectedDestination:
      "الوجهة المختارة",

    noDestinationSelected:
      "لم يتم اختيار وجهة.",

    failedLoadTrips:
      "تعذر تحميل الرحلات.",

    changeSearch:
      "تغيير البحث",

    suggestedTrips:
      "الرحلات المقترحة",

    suggestedTripsDescription:
      "يتم ترتيب الرحلات المتاحة حسب أقرب نقطة ركوب.",

    resultsFound:
      "النتائج الموجودة",

    currentLocation:
      "الموقع الحالي",

    destination:
      "الوجهة",

    availableTrips:
      "الرحلات المتاحة",

    availableTripsDescription:
      "اختر نقطة الركوب ووقت المغادرة الأنسب لك.",

    closestSuggestion:
      "أقرب اقتراح",

    option:
      "الخيار",

    pickupPoint:
      "نقطة الركوب",

    departure:
      "المغادرة",

    arrival:
      "الوصول",

    tripDuration:
      "مدة الرحلة",

    distanceToPickup:
      "المسافة إلى نقطة الركوب",

    vehicle:
      "المركبة",

    availableSeats:
      "المقاعد المتاحة",

    viewTrip:
      "عرض الرحلة",

    locationUnavailable:
      "الموقع غير متاح",

    minutes:
      "دقيقة",

    seats:
      "مقاعد",

    away:
      "بعيدًا",

    loadingTrips:
      "جارٍ تحميل الرحلات المتاحة...",

    failedTripsTitle:
      "تعذر تحميل الرحلات",

    noFutureTrips:
      "لا توجد رحلات قادمة",

    noFutureTripsPrefix:
      "لا توجد حاليًا رحلات مجدولة إلى",

    loadingResults:
      "جارٍ تحميل نتائج الرحلات...",

    currency:
      "ج.م",
  },

  french: {
    yourCurrentLocation:
      "Votre position actuelle",

    selectedDestination:
      "Destination sélectionnée",

    noDestinationSelected:
      "Aucune destination n’a été sélectionnée.",

    failedLoadTrips:
      "Impossible de charger les trajets.",

    changeSearch:
      "Modifier la recherche",

    suggestedTrips:
      "Trajets suggérés",

    suggestedTripsDescription:
      "Les trajets disponibles sont classés selon le point de prise en charge le plus proche.",

    resultsFound:
      "Résultats trouvés",

    currentLocation:
      "Position actuelle",

    destination:
      "Destination",

    availableTrips:
      "Trajets disponibles",

    availableTripsDescription:
      "Choisissez le point de prise en charge et l’heure de départ qui vous conviennent le mieux.",

    closestSuggestion:
      "Suggestion la plus proche",

    option:
      "Option",

    pickupPoint:
      "Point de prise en charge",

    departure:
      "Départ",

    arrival:
      "Arrivée",

    tripDuration:
      "Durée du trajet",

    distanceToPickup:
      "Distance jusqu’au point de prise en charge",

    vehicle:
      "Véhicule",

    availableSeats:
      "Places disponibles",

    viewTrip:
      "Voir le trajet",

    locationUnavailable:
      "Position indisponible",

    minutes:
      "minutes",

    seats:
      "places",

    away:
      "de distance",

    loadingTrips:
      "Chargement des trajets disponibles...",

    failedTripsTitle:
      "Impossible de charger les trajets",

    noFutureTrips:
      "Aucun trajet à venir",

    noFutureTripsPrefix:
      "Il n’y a actuellement aucun trajet programmé vers",

    loadingResults:
      "Chargement des résultats...",

    currency:
      "EGP",
  },
} as const

/*
 * =========================================
 * DATABASE LOCATION TRANSLATIONS
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
    arabic:
      "القاهرة الجديدة",
    french:
      "Nouveau Caire",
  },

  "fifth settlement": {
    arabic:
      "التجمع الخامس",
    french:
      "Cinquième arrondissement",
  },

  "5th settlement": {
    arabic:
      "التجمع الخامس",
    french:
      "Cinquième arrondissement",
  },

  "first settlement": {
    arabic:
      "التجمع الأول",
    french:
      "Premier arrondissement",
  },

  "third settlement": {
    arabic:
      "التجمع الثالث",
    french:
      "Troisième arrondissement",
  },

  rehab: {
    arabic:
      "الرحاب",
    french:
      "Al Rehab",
  },

  "el rehab": {
    arabic:
      "الرحاب",
    french:
      "Al Rehab",
  },

  madinaty: {
    arabic:
      "مدينتي",
    french:
      "Madinaty",
  },

  shorouk: {
    arabic:
      "الشروق",
    french:
      "El Shorouk",
  },

  "el shorouk": {
    arabic:
      "الشروق",
    french:
      "El Shorouk",
  },

  maadi: {
    arabic:
      "المعادي",
    french:
      "Maadi",
  },

  "el maadi": {
    arabic:
      "المعادي",
    french:
      "Maadi",
  },

  "nasr city": {
    arabic:
      "مدينة نصر",
    french:
      "Nasr City",
  },

  "madinet nasr": {
    arabic:
      "مدينة نصر",
    french:
      "Nasr City",
  },

  heliopolis: {
    arabic:
      "مصر الجديدة",
    french:
      "Héliopolis",
  },

  "masr el gedida": {
    arabic:
      "مصر الجديدة",
    french:
      "Héliopolis",
  },

  "misr el gedida": {
    arabic:
      "مصر الجديدة",
    french:
      "Héliopolis",
  },

  "6th of october": {
    arabic:
      "6 أكتوبر",
    french:
      "6 Octobre",
  },

  "6 october": {
    arabic:
      "6 أكتوبر",
    french:
      "6 Octobre",
  },

  october: {
    arabic:
      "أكتوبر",
    french:
      "Octobre",
  },

  "sheikh zayed": {
    arabic:
      "الشيخ زايد",
    french:
      "Cheikh Zayed",
  },

  downtown: {
    arabic:
      "وسط البلد",
    french:
      "Centre-ville",
  },

  "downtown cairo": {
    arabic:
      "وسط القاهرة",
    french:
      "Centre-ville du Caire",
  },

  "new capital": {
    arabic:
      "العاصمة الإدارية الجديدة",
    french:
      "Nouvelle capitale administrative",
  },

  "new administrative capital": {
    arabic:
      "العاصمة الإدارية الجديدة",
    french:
      "Nouvelle capitale administrative",
  },

  "abbas el akkad": {
    arabic:
      "عباس العقاد",
    french:
      "Abbas El Akkad",
  },

  "makram ebeid": {
    arabic:
      "مكرم عبيد",
    french:
      "Makram Ebeid",
  },

  "90th street": {
    arabic:
      "شارع التسعين",
    french:
      "Rue 90",
  },

  "north 90th street": {
    arabic:
      "شارع التسعين الشمالي",
    french:
      "Rue 90 Nord",
  },

  "south 90th street": {
    arabic:
      "شارع التسعين الجنوبي",
    french:
      "Rue 90 Sud",
  },

  "cairo festival city": {
    arabic:
      "كايرو فيستيفال سيتي",
    french:
      "Cairo Festival City",
  },

  "point 90": {
    arabic:
      "بوينت 90",
    french:
      "Point 90",
  },

  auc: {
    arabic:
      "الجامعة الأمريكية بالقاهرة",
    french:
      "Université américaine du Caire",
  },

  "american university in cairo": {
    arabic:
      "الجامعة الأمريكية بالقاهرة",
    french:
      "Université américaine du Caire",
  },

  ramses: {
    arabic:
      "رمسيس",
    french:
      "Ramsès",
  },

  tahrir: {
    arabic:
      "التحرير",
    french:
      "Tahrir",
  },

  zamalek: {
    arabic:
      "الزمالك",
    french:
      "Zamalek",
  },

  dokki: {
    arabic:
      "الدقي",
    french:
      "Dokki",
  },

  mohandessin: {
    arabic:
      "المهندسين",
    french:
      "Mohandessin",
  },

  giza: {
    arabic:
      "الجيزة",
    french:
      "Gizeh",
  },

  katameya: {
    arabic:
      "القطامية",
    french:
      "Katameya",
  },

  mokattam: {
    arabic:
      "المقطم",
    french:
      "Mokattam",
  },

  "ain shams": {
    arabic:
      "عين شمس",
    french:
      "Aïn Shams",
  },

  nozha: {
    arabic:
      "النزهة",
    french:
      "Nozha",
  },

  "new nozha": {
    arabic:
      "النزهة الجديدة",
    french:
      "Nouvelle Nozha",
  },

  obour: {
    arabic:
      "العبور",
    french:
      "Obour",
  },

  "el obour": {
    arabic:
      "العبور",
    french:
      "Obour",
  },

  "badr city": {
    arabic:
      "مدينة بدر",
    french:
      "Ville de Badr",
  },

  "future city": {
    arabic:
      "مستقبل سيتي",
    french:
      "Mostakbal City",
  },

  "mostakbal city": {
    arabic:
      "مستقبل سيتي",
    french:
      "Mostakbal City",
  },
}

function translateLocationText(
  value:
    | string
    | null
    | undefined,

  language:
    LanguagePreference
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

  if (
    directMatch
  ) {
    return directMatch[
      language
    ]
  }

  let translated =
    value

  const entries =
    Object.entries(
      locationTranslations
    ).sort(
      (
        [first],
        [second]
      ) =>
        second.length -
        first.length
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

/*
 * =========================================
 * PAGE
 * =========================================
 */

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <ResultsPageLoading />
      }
    >
      <ResultsPageContent />
    </Suspense>
  )
}

function ResultsPageContent() {
  const searchParams =
    useSearchParams()

  const {
    language,
  } =
    useAppPreferences()

  const copy =
    resultsCopy[
      language
    ]

  const currentLocation =
    searchParams.get(
      "from"
    ) ||
    copy.yourCurrentLocation

  const destination =
    searchParams.get(
      "to"
    ) ||
    copy.selectedDestination

  const destinationId =
    searchParams.get(
      "destinationId"
    )

  const [
    trips,
    setTrips,
  ] =
    useState<TripFromApi[]>(
      []
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("")

  const userCoordinates =
    useMemo(
      () =>
        parseCoordinates(
          currentLocation
        ),
      [
        currentLocation,
      ]
    )

  useEffect(() => {
    async function loadTrips() {
      if (
        !destinationId
      ) {
        setErrorMessage(
          copy.noDestinationSelected
        )

        setLoading(
          false
        )

        return
      }

      try {
        const response =
          await fetch(
            `/api/trips?destinationId=${encodeURIComponent(
              destinationId
            )}`
          )

        const result =
          await response.json()

        if (
          !response.ok
        ) {
          throw new Error(
            result.message ||
              copy.failedLoadTrips
          )
        }

        setTrips(
          result
        )
      } catch (
        error
      ) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : copy.failedLoadTrips
        )
      } finally {
        setLoading(
          false
        )
      }
    }

    loadTrips()
  }, [
    destinationId,
    copy.failedLoadTrips,
    copy.noDestinationSelected,
  ])

  const displayedTrips =
    useMemo<DisplayTrip[]>(
      () => {
        const preparedTrips =
          trips.map(
            (
              trip
            ) => {
              const bookedSeats =
                trip.booking_seats
                  ?.length ??
                0

              const availableSeats =
                Math.max(
                  trip.bus
                    .capacity -
                    bookedSeats,
                  0
                )

              const distanceKm =
                userCoordinates
                  ? calculateDistanceKm(
                      userCoordinates.latitude,
                      userCoordinates.longitude,
                      trip.route
                        .pickup_point
                        .latitude,
                      trip.route
                        .pickup_point
                        .longitude
                    )
                  : null

              return {
                ...trip,
                availableSeats,
                distanceKm,
              }
            }
          )

        return preparedTrips.sort(
          (
            firstTrip,
            secondTrip
          ) => {
            if (
              firstTrip.distanceKm !==
                null &&
              secondTrip.distanceKm !==
                null
            ) {
              return (
                firstTrip.distanceKm -
                secondTrip.distanceKm
              )
            }

            return (
              new Date(
                firstTrip.departure_time
              ).getTime() -
              new Date(
                secondTrip.departure_time
              ).getTime()
            )
          }
        )
      },
      [
        trips,
        userCoordinates,
      ]
    )

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#512978] hover:underline"
          >
            <ArrowLeft className="size-4" />

            {
              copy.changeSearch
            }
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            {
              copy.suggestedTrips
            }
          </h1>

          <p className="mt-2 text-slate-600">
            {
              copy.suggestedTripsDescription
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {
              copy.resultsFound
            }
          </p>

          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {loading
              ? "—"
              : displayedTrips.length}
          </p>
        </div>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <LocationSummary
            icon={
              Navigation
            }
            label={
              copy.currentLocation
            }
            value={
              translateLocationText(
                currentLocation,
                language
              )
            }
          />

          <div className="hidden items-center md:flex">
            <div className="h-px w-12 bg-slate-300" />

            <BusFront className="mx-3 size-5 text-[#512978]" />

            <div className="h-px w-12 bg-slate-300" />
          </div>

          <LocationSummary
            icon={
              MapPin
            }
            label={
              copy.destination
            }
            value={
              translateLocationText(
                destination,
                language
              )
            }
          />
        </CardContent>
      </Card>

      <ResultsMapWrapper />

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {
              copy.availableTrips
            }
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {
              copy.availableTripsDescription
            }
          </p>
        </div>

        {loading ? (
          <LoadingState
            language={
              language
            }
          />
        ) : errorMessage ? (
          <ErrorState
            message={
              errorMessage
            }
            language={
              language
            }
          />
        ) : displayedTrips.length ===
          0 ? (
          <EmptyState
            destination={
              destination
            }
            language={
              language
            }
          />
        ) : (
          <div className="min-w-0 max-w-full space-y-5">
            {displayedTrips.map(
              (
                trip,
                index
              ) => (
                <TripResultCard
                  key={
                    trip.id
                  }
                  trip={
                    trip
                  }
                  position={
                    index +
                    1
                  }
                  currentLocation={
                    currentLocation
                  }
                  destination={
                    destination
                  }
                  destinationId={
                    destinationId ||
                    ""
                  }
                  recommended={
                    index ===
                      0 &&
                    trip.distanceKm !==
                      null
                  }
                  language={
                    language
                  }
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
  )
}

/*
 * =========================================
 * TRIP CARD
 * =========================================
 */

function TripResultCard({
  trip,
  position,
  currentLocation,
  destination,
  destinationId,
  recommended,
  language,
}: {
  trip: DisplayTrip
  position: number
  currentLocation: string
  destination: string
  destinationId: string
  recommended: boolean
  language: LanguagePreference
}) {
  const copy =
    resultsCopy[
      language
    ]

  const pickupPoint =
    trip.route.pickup_point

  const routeParams =
    new URLSearchParams({
      from:
        currentLocation,

      to:
        destination,

      destinationId,
    })

  const vehicleName = [
    trip.bus.brand,
    trip.bus.model,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <Card
      className={`w-full min-w-0 max-w-full overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#140d1c] ${
        recommended
          ? "border-2 border-[#512978]"
          : "border-slate-200"
      }`}
    >
      <CardHeader className="w-full min-w-0 max-w-full overflow-hidden border-b border-slate-100 bg-slate-50/70 dark:border-[#3a214f] dark:bg-[#241536]">
        <div className="flex w-full min-w-0 max-w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
              <MapPin className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <CardTitle className="min-w-0 break-words text-xl text-slate-900 dark:text-white">
                  {translateLocationText(
                    pickupPoint.name,
                    language
                  )}
                </CardTitle>

                {recommended && (
                  <span className="rounded-full bg-[#512978] px-3 py-1 text-xs font-medium text-white">
                    {
                      copy.closestSuggestion
                    }
                  </span>
                )}
              </div>

              <CardDescription className="mt-1 break-words dark:text-purple-100/70">
                {translateLocationText(
                  pickupPoint.area,
                  language
                )}

                {trip.distanceKm !==
                  null &&
                  ` · ${formatDistance(
                    trip.distanceKm,
                    language
                  )} ${copy.away}`}
              </CardDescription>
            </div>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-purple-100/60">
              {
                copy.option
              }{" "}
              {formatNumber(
                position,
                language
              )}
            </p>

            <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              {
                copy.currency
              }{" "}
              {formatNumber(
                Number(
                  trip.price
                ),
                language,
                0
              )}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="w-full min-w-0 max-w-full overflow-hidden p-5">
        <div className="grid w-full min-w-0 max-w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0 space-y-4">
            <RouteDetail
              icon={
                Navigation
              }
              label={
                copy.pickupPoint
              }
              value={
                translateLocationText(
                  pickupPoint.name,
                  language
                )
              }
            />

            <RouteDetail
              icon={
                MapPin
              }
              label={
                copy.destination
              }
              value={
                translateLocationText(
                  trip.route
                    .destination
                    .name,
                  language
                )
              }
            />
          </div>

          <div className="grid min-w-0 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2 dark:bg-[#1d1428]">
            <RouteDetail
              icon={
                Clock3
              }
              label={
                copy.departure
              }
              value={
                formatDateTime(
                  trip.departure_time,
                  language
                )
              }
            />

            <RouteDetail
              icon={
                Clock3
              }
              label={
                copy.arrival
              }
              value={
                formatDateTime(
                  trip.arrival_time,
                  language
                )
              }
            />

            <RouteDetail
              icon={
                Route
              }
              label={
                copy.tripDuration
              }
              value={`${formatNumber(
                trip.route
                  .estimated_duration_minutes,
                language
              )} ${copy.minutes}`}
            />

            <RouteDetail
              icon={
                Navigation
              }
              label={
                copy.distanceToPickup
              }
              value={
                trip.distanceKm !==
                null
                  ? formatDistance(
                      trip.distanceKm,
                      language
                    )
                  : copy.locationUnavailable
              }
            />

            <RouteDetail
              icon={
                BusFront
              }
              label={
                copy.vehicle
              }
              value={
                vehicleName ||
                trip.bus.name
              }
            />

            <RouteDetail
              icon={
                Users
              }
              label={
                copy.availableSeats
              }
              value={`${formatNumber(
                trip.availableSeats,
                language
              )} ${copy.seats}`}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-3 lg:min-w-44">
            <Link
              href={`/dashboard/routes/${trip.id}?${routeParams.toString()}`}
              className={buttonVariants({
                className:
                  "h-11 bg-[#512978] text-white hover:bg-[#40205f]",
              })}
            >
              {
                copy.viewTrip
              }
            </Link>

            <div className="flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 dark:border-[#3a214f] dark:bg-[#17111f] dark:text-white">
              <WalletCards className="size-4" />

              {
                copy.currency
              }{" "}
              {formatNumber(
                Number(
                  trip.price
                ),
                language,
                0
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/*
 * =========================================
 * LOCATION SUMMARY
 * =========================================
 */

function LocationSummary({
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

/*
 * =========================================
 * ROUTE DETAIL
 * =========================================
 */

function RouteDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#512978]" />

      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-purple-100/60">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  )
}

/*
 * =========================================
 * LOADING
 * =========================================
 */

function LoadingState({
  language,
}: {
  language:
    LanguagePreference
}) {
  const copy =
    resultsCopy[
      language
    ]

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex min-h-48 items-center justify-center p-6">
        <p className="text-sm text-slate-500">
          {
            copy.loadingTrips
          }
        </p>
      </CardContent>
    </Card>
  )
}

/*
 * =========================================
 * ERROR
 * =========================================
 */

function ErrorState({
  message,
  language,
}: {
  message: string
  language:
    LanguagePreference
}) {
  const copy =
    resultsCopy[
      language
    ]

  return (
    <Card className="border-red-200 bg-white shadow-sm">
      <CardContent className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
        <p className="font-medium text-red-700">
          {
            copy.failedTripsTitle
          }
        </p>

        <p className="mt-2 text-sm text-red-600">
          {message}
        </p>
      </CardContent>
    </Card>
  )
}

/*
 * =========================================
 * EMPTY
 * =========================================
 */

function EmptyState({
  destination,
  language,
}: {
  destination: string
  language:
    LanguagePreference
}) {
  const copy =
    resultsCopy[
      language
    ]

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
        <BusFront className="size-9 text-slate-400" />

        <p className="mt-4 font-medium text-slate-800">
          {
            copy.noFutureTrips
          }
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {
            copy.noFutureTripsPrefix
          }{" "}
          {translateLocationText(
            destination,
            language
          )}
          .
        </p>
      </CardContent>
    </Card>
  )
}

/*
 * =========================================
 * COORDINATES
 * =========================================
 */

function parseCoordinates(
  locationValue: string
): UserCoordinates | null {
  const parts =
    locationValue
      .split(",")
      .map(
        (
          part
        ) =>
          Number(
            part.trim()
          )
      )

  if (
    parts.length !==
      2 ||
    !Number.isFinite(
      parts[0]
    ) ||
    !Number.isFinite(
      parts[1]
    )
  ) {
    return null
  }

  return {
    latitude:
      parts[0],

    longitude:
      parts[1],
  }
}

function calculateDistanceKm(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number
) {
  const earthRadiusKm =
    6371

  const latitudeDifference =
    degreesToRadians(
      secondLatitude -
        firstLatitude
    )

  const longitudeDifference =
    degreesToRadians(
      secondLongitude -
        firstLongitude
    )

  const firstLatitudeRadians =
    degreesToRadians(
      firstLatitude
    )

  const secondLatitudeRadians =
    degreesToRadians(
      secondLatitude
    )

  const value =
    Math.sin(
      latitudeDifference /
        2
    ) **
      2 +
    Math.cos(
      firstLatitudeRadians
    ) *
      Math.cos(
        secondLatitudeRadians
      ) *
      Math.sin(
        longitudeDifference /
          2
      ) **
        2

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(
        value
      ),
      Math.sqrt(
        1 -
          value
      )
    )

  return (
    earthRadiusKm *
    angularDistance
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

/*
 * =========================================
 * NUMBER / DISTANCE / DATE
 * =========================================
 */

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

function formatNumber(
  value: number,
  language:
    LanguagePreference,
  maximumFractionDigits = 0
) {
  return new Intl.NumberFormat(
    getLocale(
      language
    ),
    {
      maximumFractionDigits,
    }
  ).format(
    value
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
      return `${formatNumber(
        meters,
        language
      )} م`
    }

    return `${formatNumber(
      meters,
      language
    )} m`
  }

  const formatted =
    formatNumber(
      distanceKm,
      language,
      1
    )

  if (
    language ===
    "arabic"
  ) {
    return `${formatted} كم`
  }

  return `${formatted} km`
}

function formatDateTime(
  dateValue: string,
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

      hour:
        "numeric",

      minute:
        "2-digit",
    }
  ).format(
    new Date(
      dateValue
    )
  )
}

/*
 * =========================================
 * SUSPENSE LOADING
 * =========================================
 */

function ResultsPageLoading() {
  const {
    language,
  } =
    useAppPreferences()

  const copy =
    resultsCopy[
      language
    ]

  return (
    <div className="mx-auto w-full max-w-7xl py-12 text-center">
      <p className="text-sm text-slate-500">
        {
          copy.loadingResults
        }
      </p>
    </div>
  )
}