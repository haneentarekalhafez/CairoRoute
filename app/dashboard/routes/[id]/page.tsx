"use client"

import Link from "next/link"

import {
  useParams,
  useSearchParams,
} from "next/navigation"

import {
  useEffect,
  useState,
} from "react"

import {
  ArrowLeft,
  BusFront,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Route,
  TicketCheck,
  Users,
} from "lucide-react"

import {
  useAppPreferences,
  type LanguagePreference,
} from "@/components/app-preferences-provider"

import {
  Button,
  buttonVariants,
} from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/*
 * =========================================
 * TYPES
 * =========================================
 */

type RouteStop = {
  id: number

  order: number

  name: string

  area:
    | string
    | null

  latitude:
    | number
    | null

  longitude:
    | number
    | null

  type:
    | "origin"
    | "intermediate"
    | "destination"
}

type Trip = {
  id: number

  departureTime: string

  arrivalTime:
    | string
    | null

  price: number

  status: string

  route: {
    id:
      | number
      | null

    estimatedDurationMinutes:
      | number
      | null

    pickupPoint: {
      id:
        | number
        | null

      name: string

      area:
        | string
        | null

      latitude:
        | number
        | null

      longitude:
        | number
        | null
    }

    destination: {
      id:
        | number
        | null

      name: string

      latitude:
        | number
        | null

      longitude:
        | number
        | null
    }

    stops: RouteStop[]
  }

  bus: {
    id:
      | number
      | null

    name: string

    brand:
      | string
      | null

    model:
      | string
      | null

    plateNumber: string

    color:
      | string
      | null

    capacity: number
  }

  occupiedSeats:
    number[]

  availableSeats: number
}

type TripResponse = {
  trip?: Trip

  message?: string

  error?: string
}

/*
 * =========================================
 * PAGE TRANSLATIONS
 * =========================================
 */

const routeCopy = {
  english: {
    currentLocation:
      "Your current location",

    selectedDestination:
      "Selected destination",

    failedLoadTrip:
      "Failed to load trip.",

    tripDataMissing:
      "Trip data was not returned.",

    loadingRoute:
      "Loading route details...",

    tripNotFound:
      "Trip not found",

    tripCouldNotLoad:
      "The selected trip could not be loaded.",

    returnResults:
      "Return to results",

    backSuggestions:
      "Back to route suggestions",

    routeDetails:
      "Route details",

    to:
      "to",

    routeDescription:
      "Review the route, stops, departure time, vehicle and seat availability before booking.",

    tripPrice:
      "Trip price",

    currency:
      "EGP",

    tripOverview:
      "Trip overview",

    tripOverviewDescription:
      "Your scheduled trip information.",

    date:
      "Date",

    departure:
      "Departure",

    arrival:
      "Arrival",

    availableSeats:
      "Available seats",

    unavailable:
      "Unavailable",

    routeStops:
      "Route stops",

    routeStopsDescription:
      "Stops are shown in the order the bus travels through them.",

    intermediateStop:
      "Intermediate stop",

    tripEndpoints:
      "Trip endpoints",

    tripEndpointsDescription:
      "Starting pickup point and final destination.",

    pickupPoint:
      "Pickup point",

    selectedPickupPoint:
      "Selected pickup point",

    destination:
      "Destination",

    finalDestination:
      "Final destination",

    yourBus:
      "Your bus",

    busDescription:
      "Vehicle assigned to this trip.",

    plateNumber:
      "Plate number",

    color:
      "Color",

    capacity:
      "Capacity",

    available:
      "Available",

    seats:
      "seats",

    seat:
      "seat",

    tripAvailable:
      "Trip available",

    tripFull:
      "Trip full",

    availablePrefix:
      "This trip currently has",

    availableSuffix:
      "available",

    noSeats:
      "There are currently no available seats on this trip.",

    continueBooking:
      "Continue to booking",

    tripIsFull:
      "Trip is full",

    pickup:
      "Pickup",

    stop:
      "Stop",

    minutesShort:
      "min",
  },

  arabic: {
    currentLocation:
      "موقعك الحالي",

    selectedDestination:
      "الوجهة المختارة",

    failedLoadTrip:
      "تعذر تحميل الرحلة.",

    tripDataMissing:
      "لم يتم إرجاع بيانات الرحلة.",

    loadingRoute:
      "جارٍ تحميل تفاصيل الرحلة...",

    tripNotFound:
      "لم يتم العثور على الرحلة",

    tripCouldNotLoad:
      "تعذر تحميل الرحلة المحددة.",

    returnResults:
      "العودة إلى النتائج",

    backSuggestions:
      "العودة إلى اقتراحات الرحلات",

    routeDetails:
      "تفاصيل الرحلة",

    to:
      "إلى",

    routeDescription:
      "راجع المسار والمحطات ووقت المغادرة والمركبة وتوافر المقاعد قبل الحجز.",

    tripPrice:
      "سعر الرحلة",

    currency:
      "ج.م",

    tripOverview:
      "ملخص الرحلة",

    tripOverviewDescription:
      "معلومات رحلتك المجدولة.",

    date:
      "التاريخ",

    departure:
      "المغادرة",

    arrival:
      "الوصول",

    availableSeats:
      "المقاعد المتاحة",

    unavailable:
      "غير متاح",

    routeStops:
      "محطات الرحلة",

    routeStopsDescription:
      "تظهر المحطات حسب ترتيب مرور الحافلة بها.",

    intermediateStop:
      "محطة وسيطة",

    tripEndpoints:
      "نقطتا بداية ونهاية الرحلة",

    tripEndpointsDescription:
      "نقطة الركوب الأولى والوجهة النهائية.",

    pickupPoint:
      "نقطة الركوب",

    selectedPickupPoint:
      "نقطة الركوب المختارة",

    destination:
      "الوجهة",

    finalDestination:
      "الوجهة النهائية",

    yourBus:
      "الحافلة",

    busDescription:
      "المركبة المخصصة لهذه الرحلة.",

    plateNumber:
      "رقم اللوحة",

    color:
      "اللون",

    capacity:
      "السعة",

    available:
      "المتاح",

    seats:
      "مقاعد",

    seat:
      "مقعد",

    tripAvailable:
      "الرحلة متاحة",

    tripFull:
      "الرحلة ممتلئة",

    availablePrefix:
      "يوجد حاليًا في هذه الرحلة",

    availableSuffix:
      "متاح",

    noSeats:
      "لا توجد مقاعد متاحة حاليًا في هذه الرحلة.",

    continueBooking:
      "المتابعة إلى الحجز",

    tripIsFull:
      "الرحلة ممتلئة",

    pickup:
      "نقطة الركوب",

    stop:
      "محطة",

    minutesShort:
      "دقيقة",
  },

  french: {
    currentLocation:
      "Votre position actuelle",

    selectedDestination:
      "Destination sélectionnée",

    failedLoadTrip:
      "Impossible de charger le trajet.",

    tripDataMissing:
      "Les données du trajet n’ont pas été retournées.",

    loadingRoute:
      "Chargement des détails du trajet...",

    tripNotFound:
      "Trajet introuvable",

    tripCouldNotLoad:
      "Le trajet sélectionné n’a pas pu être chargé.",

    returnResults:
      "Retour aux résultats",

    backSuggestions:
      "Retour aux suggestions de trajets",

    routeDetails:
      "Détails du trajet",

    to:
      "vers",

    routeDescription:
      "Vérifiez le trajet, les arrêts, l’heure de départ, le véhicule et les places disponibles avant de réserver.",

    tripPrice:
      "Prix du trajet",

    currency:
      "EGP",

    tripOverview:
      "Aperçu du trajet",

    tripOverviewDescription:
      "Informations sur votre trajet programmé.",

    date:
      "Date",

    departure:
      "Départ",

    arrival:
      "Arrivée",

    availableSeats:
      "Places disponibles",

    unavailable:
      "Indisponible",

    routeStops:
      "Arrêts du trajet",

    routeStopsDescription:
      "Les arrêts sont affichés dans l’ordre de passage du bus.",

    intermediateStop:
      "Arrêt intermédiaire",

    tripEndpoints:
      "Points de départ et d’arrivée",

    tripEndpointsDescription:
      "Point de prise en charge initial et destination finale.",

    pickupPoint:
      "Point de prise en charge",

    selectedPickupPoint:
      "Point de prise en charge sélectionné",

    destination:
      "Destination",

    finalDestination:
      "Destination finale",

    yourBus:
      "Votre bus",

    busDescription:
      "Véhicule affecté à ce trajet.",

    plateNumber:
      "Immatriculation",

    color:
      "Couleur",

    capacity:
      "Capacité",

    available:
      "Disponible",

    seats:
      "places",

    seat:
      "place",

    tripAvailable:
      "Trajet disponible",

    tripFull:
      "Trajet complet",

    availablePrefix:
      "Ce trajet dispose actuellement de",

    availableSuffix:
      "disponible",

    noSeats:
      "Il n’y a actuellement aucune place disponible sur ce trajet.",

    continueBooking:
      "Continuer vers la réservation",

    tripIsFull:
      "Trajet complet",

    pickup:
      "Départ",

    stop:
      "Arrêt",

    minutesShort:
      "min",
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

/*
 * =========================================
 * BUS COLOR TRANSLATIONS
 * =========================================
 */

const colorTranslations: Record<
  string,
  {
    arabic: string
    french: string
  }
> = {
  white: {
    arabic:
      "أبيض",
    french:
      "Blanc",
  },

  black: {
    arabic:
      "أسود",
    french:
      "Noir",
  },

  gray: {
    arabic:
      "رمادي",
    french:
      "Gris",
  },

  grey: {
    arabic:
      "رمادي",
    french:
      "Gris",
  },

  silver: {
    arabic:
      "فضي",
    french:
      "Argenté",
  },

  red: {
    arabic:
      "أحمر",
    french:
      "Rouge",
  },

  blue: {
    arabic:
      "أزرق",
    french:
      "Bleu",
  },

  green: {
    arabic:
      "أخضر",
    french:
      "Vert",
  },

  yellow: {
    arabic:
      "أصفر",
    french:
      "Jaune",
  },

  orange: {
    arabic:
      "برتقالي",
    french:
      "Orange",
  },

  brown: {
    arabic:
      "بني",
    french:
      "Marron",
  },

  beige: {
    arabic:
      "بيج",
    french:
      "Beige",
  },

  purple: {
    arabic:
      "بنفسجي",
    french:
      "Violet",
  },
}

/*
 * =========================================
 * TRANSLATION HELPERS
 * =========================================
 */

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

function translateColor(
  value:
    | string
    | null
    | undefined,

  language:
    LanguagePreference,

  unavailable: string
) {
  if (!value) {
    return unavailable
  }

  if (
    language ===
    "english"
  ) {
    return value
  }

  const translated =
    colorTranslations[
      value
        .trim()
        .toLowerCase()
    ]

  return (
    translated?.[
      language
    ] ||
    value
  )
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

export default function RouteDetailsPage() {
  const params =
    useParams<{
      id: string
    }>()

  const searchParams =
    useSearchParams()

  const {
    language,
  } =
    useAppPreferences()

  const copy =
    routeCopy[
      language
    ]

  const [
    trip,
    setTrip,
  ] =
    useState<Trip | null>(
      null
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

  /*
   * =========================================
   * SEARCH PARAMETERS
   * =========================================
   */

  const from =
    searchParams.get(
      "from"
    ) ||
    copy.currentLocation

  const searchedDestination =
    searchParams.get(
      "to"
    )

  /*
   * =========================================
   * LOAD TRIP
   * =========================================
   */

  useEffect(() => {
    async function loadTrip() {
      try {
        setLoading(
          true
        )

        setErrorMessage(
          ""
        )

        const response =
          await fetch(
            `/api/trips/${params.id}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          )

        const result =
          (await response.json()) as TripResponse

        if (
          !response.ok
        ) {
          throw new Error(
            result.error
              ? `${result.message} ${result.error}`
              : result.message ||
                  copy.failedLoadTrip
          )
        }

        if (
          !result.trip
        ) {
          throw new Error(
            copy.tripDataMissing
          )
        }

        setTrip(
          result.trip
        )
      } catch (
        error
      ) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : copy.failedLoadTrip
        )
      } finally {
        setLoading(
          false
        )
      }
    }

    loadTrip()
  }, [
    params.id,
    copy.failedLoadTrip,
    copy.tripDataMissing,
  ])

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (
    loading
  ) {
    return (
      <div className="mx-auto flex min-h-96 w-full max-w-6xl items-center justify-center">
        <div className="text-center">
          <Route className="mx-auto size-10 animate-pulse text-[#512978]" />

          <p className="mt-4 text-sm text-slate-500">
            {
              copy.loadingRoute
            }
          </p>
        </div>
      </div>
    )
  }

  /*
   * =========================================
   * ERROR
   * =========================================
   */

  if (
    errorMessage ||
    !trip
  ) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <Route className="size-10 text-slate-400" />

            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              {
                copy.tripNotFound
              }
            </h1>

            <p className="mt-2 max-w-lg text-sm text-slate-500">
              {errorMessage ||
                copy.tripCouldNotLoad}
            </p>

            <Link
              href="/dashboard/results"
              className={buttonVariants({
                className:
                  "mt-6 bg-[#512978] text-white hover:bg-[#40205f]",
              })}
            >
              {
                copy.returnResults
              }
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  /*
   * =========================================
   * TRIP DATA
   * =========================================
   */

  const pickupName =
    trip.route
      .pickupPoint
      .name

  const pickupArea =
    trip.route
      .pickupPoint
      .area

  const destination =
    trip.route
      .destination
      .name ||
    searchedDestination ||
    copy.selectedDestination

  const busTitle =
    [
      trip.bus.brand,
      trip.bus.model,
    ]
      .filter(
        Boolean
      )
      .join(
        " "
      ) ||
    trip.bus.name

  const duration =
    trip.route
      .estimatedDurationMinutes

  /*
   * =========================================
   * ROUTE STOPS
   * =========================================
   */

  const routeStops =
    trip.route.stops.length >
    0
      ? trip.route.stops
      : [
          {
            id:
              -1,

            order:
              1,

            name:
              pickupName,

            area:
              pickupArea,

            latitude:
              trip.route
                .pickupPoint
                .latitude,

            longitude:
              trip.route
                .pickupPoint
                .longitude,

            type:
              "origin" as const,
          },

          {
            id:
              -2,

            order:
              2,

            name:
              destination,

            area:
              null,

            latitude:
              trip.route
                .destination
                .latitude,

            longitude:
              trip.route
                .destination
                .longitude,

            type:
              "destination" as const,
          },
        ]

  /*
   * =========================================
   * LINKS
   * =========================================
   */

  const resultsParams =
    new URLSearchParams()

  resultsParams.set(
    "from",
    from
  )

  resultsParams.set(
    "to",
    searchedDestination ||
      destination
  )

  const bookingParams =
    new URLSearchParams()

  bookingParams.set(
    "from",
    from
  )

  bookingParams.set(
    "to",
    destination
  )

  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* PAGE HEADER */}

      <section>
        <Link
          href={`/dashboard/results?${resultsParams.toString()}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#512978] hover:underline"
        >
          <ArrowLeft className="size-4" />

          {
            copy.backSuggestions
          }
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#512978]">
              {
                copy.routeDetails
              }
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {translateLocationText(
                pickupName,
                language
              )}
              {" "}
              {
                copy.to
              }
              {" "}
              {translateLocationText(
                destination,
                language
              )}
            </h1>

            <p className="mt-2 text-slate-600">
              {
                copy.routeDescription
              }
            </p>
          </div>

          {/* PRICE */}

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {
                copy.tripPrice
              }
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {
                copy.currency
              }{" "}
              {formatNumber(
                trip.price,
                language
              )}
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}

        <div className="space-y-6">
          {/* TRIP OVERVIEW */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                {
                  copy.tripOverview
                }
              </CardTitle>

              <CardDescription>
                {
                  copy.tripOverviewDescription
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <InfoBlock
                icon={
                  CalendarDays
                }
                label={
                  copy.date
                }
                value={
                  formatDate(
                    trip.departureTime,
                    language
                  )
                }
              />

              <InfoBlock
                icon={
                  Clock3
                }
                label={
                  copy.departure
                }
                value={
                  formatTime(
                    trip.departureTime,
                    language
                  )
                }
              />

              <InfoBlock
                icon={
                  Clock3
                }
                label={
                  copy.arrival
                }
                value={
                  trip.arrivalTime
                    ? formatTime(
                        trip.arrivalTime,
                        language
                      )
                    : duration
                      ? `~${formatNumber(
                          duration,
                          language
                        )} ${copy.minutesShort}`
                      : copy.unavailable
                }
              />

              <InfoBlock
                icon={
                  Users
                }
                label={
                  copy.availableSeats
                }
                value={`${formatNumber(
                  trip.availableSeats,
                  language
                )} / ${formatNumber(
                  trip.bus.capacity,
                  language
                )}`}
              />
            </CardContent>
          </Card>

          {/* ROUTE STOPS */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Route className="size-5 text-[#512978]" />

                {
                  copy.routeStops
                }
              </CardTitle>

              <CardDescription>
                {
                  copy.routeStopsDescription
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="relative">
                {routeStops.map(
                  (
                    stop,
                    index
                  ) => {
                    const isFirst =
                      index ===
                      0

                    const isLast =
                      index ===
                      routeStops.length -
                        1

                    return (
                      <div
                        key={`${stop.id}-${stop.order}`}
                        className="relative flex gap-4 pb-8 last:pb-0"
                      >
                        {/* LINE TO NEXT STOP */}

                        {!isLast && (
                          <div className="absolute left-[17px] top-9 h-[calc(100%-20px)] w-0.5 bg-purple-200" />
                        )}

                        {/* STOP ICON */}

                        <div
                          className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 ${
                            isFirst
                              ? "border-[#512978] bg-[#512978] text-white"
                              : isLast
                                ? "border-[#512978] bg-white text-[#512978]"
                                : "border-purple-200 bg-purple-50 text-[#512978]"
                          }`}
                        >
                          {isFirst ? (
                            <Navigation className="size-4" />
                          ) : isLast ? (
                            <MapPin className="size-4" />
                          ) : (
                            <span className="size-2 rounded-full bg-[#512978]" />
                          )}
                        </div>

                        {/* STOP INFORMATION */}

                        <div className="min-w-0 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-slate-900">
                              {translateLocationText(
                                stop.name,
                                language
                              )}
                            </p>

                            <StopBadge
                              type={
                                stop.type
                              }
                              language={
                                language
                              }
                            />
                          </div>

                          {stop.area && (
                            <p className="mt-1 text-sm text-slate-500">
                              {translateLocationText(
                                stop.area,
                                language
                              )}
                            </p>
                          )}

                          {stop.type ===
                            "intermediate" && (
                            <p className="mt-1 text-xs text-slate-400">
                              {
                                copy.intermediateStop
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* ENDPOINTS */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                {
                  copy.tripEndpoints
                }
              </CardTitle>

              <CardDescription>
                {
                  copy.tripEndpointsDescription
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
              <LocationCard
                icon={
                  Navigation
                }
                label={
                  copy.pickupPoint
                }
                name={
                  translateLocationText(
                    pickupName,
                    language
                  )
                }
                description={
                  pickupArea
                    ? translateLocationText(
                        pickupArea,
                        language
                      )
                    : copy.selectedPickupPoint
                }
              />

              <LocationCard
                icon={
                  MapPin
                }
                label={
                  copy.destination
                }
                name={
                  translateLocationText(
                    destination,
                    language
                  )
                }
                description={
                  copy.finalDestination
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE */}

        <div className="space-y-6">
          {/* BUS INFORMATION */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <BusFront className="size-5 text-[#512978]" />

                {
                  copy.yourBus
                }
              </CardTitle>

              <CardDescription>
                {
                  copy.busDescription
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#512978]">
                  <BusFront className="size-6" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {
                      busTitle
                    }
                  </p>

                  {trip.bus.name &&
                    trip.bus.name !==
                      busTitle && (
                      <p className="mt-1 text-sm text-slate-500">
                        {
                          trip.bus.name
                        }
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <DetailRow
                  label={
                    copy.plateNumber
                  }
                  value={
                    trip.bus
                      .plateNumber
                  }
                />

                <DetailRow
                  label={
                    copy.color
                  }
                  value={
                    translateColor(
                      trip.bus.color,
                      language,
                      copy.unavailable
                    )
                  }
                />

                <DetailRow
                  label={
                    copy.capacity
                  }
                  value={`${formatNumber(
                    trip.bus.capacity,
                    language
                  )} ${copy.seats}`}
                />

                <DetailRow
                  label={
                    copy.available
                  }
                  value={`${formatNumber(
                    trip.availableSeats,
                    language
                  )} ${copy.seats}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* AVAILABILITY */}

          <Card className="rounded-xl border-purple-100 bg-purple-50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#512978]" />

                <div>
                  <p className="font-medium text-slate-900">
                    {trip.availableSeats >
                    0
                      ? copy.tripAvailable
                      : copy.tripFull}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {trip.availableSeats >
                    0
                      ? `${copy.availablePrefix} ${formatNumber(
                          trip.availableSeats,
                          language
                        )} ${
                          trip.availableSeats ===
                          1
                            ? copy.seat
                            : copy.seats
                        } ${copy.availableSuffix}.`
                      : copy.noSeats}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BOOK BUTTON */}

          <Link
            href={`/dashboard/booking/${trip.id}?${bookingParams.toString()}`}
            className="block"
          >
            <Button
              type="button"
              disabled={
                trip.availableSeats <=
                  0 ||
                trip.status.toLowerCase() !==
                  "scheduled"
              }
              className="h-12 w-full bg-[#512978] text-base text-white hover:bg-[#40205f]"
            >
              <TicketCheck className="size-5" />

              {trip.availableSeats >
              0
                ? copy.continueBooking
                : copy.tripIsFull}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/*
 * =========================================
 * INFO BLOCK
 * =========================================
 */

function InfoBlock({
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
        <Icon className="size-4" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

/*
 * =========================================
 * LOCATION CARD
 * =========================================
 */

function LocationCard({
  icon: Icon,
  label,
  name,
  description,
}: {
  icon: React.ElementType
  label: string
  name: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
        <Icon className="size-5" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {name}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}

/*
 * =========================================
 * STOP BADGE
 * =========================================
 */

function StopBadge({
  type,
  language,
}: {
  type:
    | "origin"
    | "intermediate"
    | "destination"

  language:
    LanguagePreference
}) {
  const copy =
    routeCopy[
      language
    ]

  if (
    type ===
    "origin"
  ) {
    return (
      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-[#512978]">
        {
          copy.pickup
        }
      </span>
    )
  }

  if (
    type ===
    "destination"
  ) {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        {
          copy.destination
        }
      </span>
    )
  }

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      {
        copy.stop
      }
    </span>
  )
}

/*
 * =========================================
 * DETAIL ROW
 * =========================================
 */

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  )
}

/*
 * =========================================
 * FORMATTING
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
    LanguagePreference
) {
  return new Intl.NumberFormat(
    getLocale(
      language
    )
  ).format(
    value
  )
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
        "long",

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