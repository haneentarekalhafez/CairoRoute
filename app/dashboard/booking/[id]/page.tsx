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
  CreditCard,
  MapPin,
  Banknote,
  Store,
  Route,
  ShieldCheck,
  UserRound,
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

/*
 * =========================================
 * TYPES
 * =========================================
 */

type PaymentMethod =
  | "card"
  | "fawry"
  | "cash"

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

    stops: {
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
    }[]
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

  payment?: {
    id: number
    booking_id: number
    payment_method: PaymentMethod
    payment_status: string
    amount: number
    provider: string | null
    provider_reference: string | null
    paid_at: string | null
  }

  booking?: {
    id: number
    user_id: string
    trip_id: number
    booking_reference: string
    status: string
    passenger_name: string
    passenger_phone: string
    passenger_email:
      | string
      | null
    total_price: number
  }
}

/*
 * =========================================
 * PAGE TRANSLATIONS
 * =========================================
 */

const bookingCopy = {
  english: {
    currentLocation:
      "Your current location",

    failedLoadTrip:
      "Failed to load trip.",

    tripDataMissing:
      "Trip data was not returned.",

    tripUnavailable:
      "The trip information is unavailable.",

    selectSeatMessage:
      "Select an available seat.",

    enterNameMessage:
      "Enter your full name.",

    enterPhoneMessage:
      "Enter your phone number.",

    reviewMessage:
      "Confirm that you reviewed the booking.",

    loginMissing:
      "Your login session could not be found. Please log in again.",

    failedBooking:
      "Failed to create booking.",

    tripNotFound:
      "Trip not found",

    noTripId:
      "No trip ID was provided.",

    loadingBooking:
      "Loading booking details...",

    tripCouldNotLoad:
      "The selected trip could not be loaded.",

    backTrip:
      "Back to trip details",

    completeBooking:
      "Complete your booking",

    completeDescription:
      "Select your seat and enter your passenger information.",

    selectSeat:
      "Select your seat",

    seatDescription:
      "Reserved seats cannot be selected.",

    frontBus:
      "Front of bus",

    available:
      "Available",

    selected:
      "Selected",

    reserved:
      "Reserved",

    passengerInformation:
      "Passenger information",

    passengerDescription:
      "Enter the passenger details for this reservation.",

    fullName:
      "Full name",

    fullNamePlaceholder:
      "Enter your full name",

    phoneNumber:
      "Phone number",

    emailAddress:
      "Email address",

    reviewedBooking:
      "I reviewed the trip and selected-seat details.",

    bookingSummary:
      "Booking summary",

    pickupPoint:
      "Pickup point",

    destination:
      "Destination",

    date:
      "Date",

    departure:
      "Departure",

    vehicle:
      "Vehicle",

    selectedSeat:
      "Selected seat",

    notSelected:
      "Not selected",

    seat:
      "Seat",

    totalPrice:
      "Total price",

    currency:
      "EGP",

    paymentRequiredMessage:
      "Choose a payment method before continuing.",

    paymentMethod:
      "Payment method",

    paymentDescription:
      "Choose how you would like to pay for this trip.",

    cardPayment:
      "Visa / Mastercard",

    cardPaymentDescription:
      "Pay securely online by card.",

    fawryPayment:
      "Fawry",

    fawryPaymentDescription:
      "Pay using a Fawry payment reference.",

    cashPayment:
      "Cash on boarding",

    cashPaymentDescription:
      "Pay the trip fare in cash when you board the bus.",

    selectedPaymentMethod:
      "Payment",

    confirmBooking:
      "Confirm your booking",

    confirmDescription:
      "Review your trip and passenger information before confirming.",

    confirming:
      "Confirming booking...",

    confirmButton:
      "Confirm booking",

    continuePayment:
      "Continue to payment",

    creatingBooking:
      "Creating booking...",
  },

  arabic: {
    currentLocation:
      "موقعك الحالي",

    failedLoadTrip:
      "تعذر تحميل الرحلة.",

    tripDataMissing:
      "لم يتم إرجاع بيانات الرحلة.",

    tripUnavailable:
      "معلومات الرحلة غير متاحة.",

    selectSeatMessage:
      "اختر مقعدًا متاحًا.",

    enterNameMessage:
      "أدخل الاسم الكامل.",

    enterPhoneMessage:
      "أدخل رقم الهاتف.",

    reviewMessage:
      "أكد أنك راجعت تفاصيل الحجز.",

    loginMissing:
      "تعذر العثور على جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.",

    failedBooking:
      "تعذر إنشاء الحجز.",

    tripNotFound:
      "لم يتم العثور على الرحلة",

    noTripId:
      "لم يتم تحديد رقم الرحلة.",

    loadingBooking:
      "جارٍ تحميل تفاصيل الحجز...",

    tripCouldNotLoad:
      "تعذر تحميل الرحلة المحددة.",

    backTrip:
      "العودة إلى تفاصيل الرحلة",

    completeBooking:
      "أكمل حجزك",

    completeDescription:
      "اختر مقعدك وأدخل بيانات الراكب.",

    selectSeat:
      "اختر مقعدك",

    seatDescription:
      "لا يمكن اختيار المقاعد المحجوزة.",

    frontBus:
      "مقدمة الحافلة",

    available:
      "متاح",

    selected:
      "محدد",

    reserved:
      "محجوز",

    passengerInformation:
      "بيانات الراكب",

    passengerDescription:
      "أدخل بيانات الراكب لهذا الحجز.",

    fullName:
      "الاسم الكامل",

    fullNamePlaceholder:
      "أدخل الاسم الكامل",

    phoneNumber:
      "رقم الهاتف",

    emailAddress:
      "البريد الإلكتروني",

    reviewedBooking:
      "راجعت تفاصيل الرحلة والمقعد المحدد.",

    bookingSummary:
      "ملخص الحجز",

    pickupPoint:
      "نقطة الركوب",

    destination:
      "الوجهة",

    date:
      "التاريخ",

    departure:
      "المغادرة",

    vehicle:
      "المركبة",

    selectedSeat:
      "المقعد المحدد",

    notSelected:
      "لم يتم الاختيار",

    seat:
      "مقعد",

    totalPrice:
      "السعر الإجمالي",

    currency:
      "ج.م",

    paymentRequiredMessage:
      "اختر طريقة الدفع قبل المتابعة.",

    paymentMethod:
      "طريقة الدفع",

    paymentDescription:
      "اختر الطريقة التي تريد استخدامها لدفع قيمة الرحلة.",

    cardPayment:
      "فيزا / ماستركارد",

    cardPaymentDescription:
      "ادفع بأمان عبر الإنترنت باستخدام البطاقة.",

    fawryPayment:
      "فوري",

    fawryPaymentDescription:
      "ادفع باستخدام رقم مرجعي من فوري.",

    cashPayment:
      "الدفع نقدًا عند الصعود",

    cashPaymentDescription:
      "ادفع قيمة الرحلة نقدًا عند صعود الحافلة.",

    selectedPaymentMethod:
      "الدفع",

    confirmBooking:
      "تأكيد الحجز",

    confirmDescription:
      "راجع الرحلة وبيانات الراكب قبل تأكيد الحجز.",

    confirming:
      "جارٍ تأكيد الحجز...",

    confirmButton:
      "تأكيد الحجز",

    continuePayment:
      "المتابعة إلى الدفع",

    creatingBooking:
      "جارٍ إنشاء الحجز...",
  },

  french: {
    currentLocation:
      "Votre position actuelle",

    failedLoadTrip:
      "Impossible de charger le trajet.",

    tripDataMissing:
      "Les données du trajet n’ont pas été retournées.",

    tripUnavailable:
      "Les informations du trajet sont indisponibles.",

    selectSeatMessage:
      "Sélectionnez une place disponible.",

    enterNameMessage:
      "Entrez votre nom complet.",

    enterPhoneMessage:
      "Entrez votre numéro de téléphone.",

    reviewMessage:
      "Confirmez que vous avez vérifié la réservation.",

    loginMissing:
      "Votre session de connexion est introuvable. Veuillez vous reconnecter.",

    failedBooking:
      "Impossible de créer la réservation.",

    tripNotFound:
      "Trajet introuvable",

    noTripId:
      "Aucun identifiant de trajet n’a été fourni.",

    loadingBooking:
      "Chargement des détails de la réservation...",

    tripCouldNotLoad:
      "Le trajet sélectionné n’a pas pu être chargé.",

    backTrip:
      "Retour aux détails du trajet",

    completeBooking:
      "Finalisez votre réservation",

    completeDescription:
      "Sélectionnez votre place et renseignez les informations du passager.",

    selectSeat:
      "Sélectionnez votre place",

    seatDescription:
      "Les places réservées ne peuvent pas être sélectionnées.",

    frontBus:
      "Avant du bus",

    available:
      "Disponible",

    selected:
      "Sélectionnée",

    reserved:
      "Réservée",

    passengerInformation:
      "Informations du passager",

    passengerDescription:
      "Entrez les informations du passager pour cette réservation.",

    fullName:
      "Nom complet",

    fullNamePlaceholder:
      "Entrez votre nom complet",

    phoneNumber:
      "Numéro de téléphone",

    emailAddress:
      "Adresse e-mail",

    reviewedBooking:
      "J’ai vérifié le trajet et les détails de la place sélectionnée.",

    bookingSummary:
      "Résumé de la réservation",

    pickupPoint:
      "Point de prise en charge",

    destination:
      "Destination",

    date:
      "Date",

    departure:
      "Départ",

    vehicle:
      "Véhicule",

    selectedSeat:
      "Place sélectionnée",

    notSelected:
      "Non sélectionnée",

    seat:
      "Place",

    totalPrice:
      "Prix total",

    currency:
      "EGP",

    paymentRequiredMessage:
      "Choisissez un mode de paiement avant de continuer.",

    paymentMethod:
      "Mode de paiement",

    paymentDescription:
      "Choisissez comment vous souhaitez payer ce trajet.",

    cardPayment:
      "Visa / Mastercard",

    cardPaymentDescription:
      "Payez en ligne de manière sécurisée par carte.",

    fawryPayment:
      "Fawry",

    fawryPaymentDescription:
      "Payez à l’aide d’une référence de paiement Fawry.",

    cashPayment:
      "Paiement en espèces à l’embarquement",

    cashPaymentDescription:
      "Payez le prix du trajet en espèces lorsque vous montez dans le bus.",

    selectedPaymentMethod:
      "Paiement",

    confirmBooking:
      "Confirmez votre réservation",

    confirmDescription:
      "Vérifiez votre trajet et les informations du passager avant de confirmer.",

    confirming:
      "Confirmation de la réservation...",

    confirmButton:
      "Confirmer la réservation",

    continuePayment:
      "Continuer vers le paiement",

    creatingBooking:
      "Création de la réservation...",
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
 * LOCATION TRANSLATION
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

export default function BookingPage() {
  const params =
    useParams<{
      id: string
    }>()

  const router =
    useRouter()

  const searchParams =
    useSearchParams()

  const {
    language,
  } =
    useAppPreferences()

  const copy =
    bookingCopy[
      language
    ]

  const tripId =
    params.id

  const currentLocation =
    searchParams.get(
      "from"
    ) ||
    copy.currentLocation

  const destinationId =
    searchParams.get(
      "destinationId"
    ) || ""

  const [
    trip,
    setTrip,
  ] =
    useState<Trip | null>(
      null
    )

  const [
    selectedSeat,
    setSelectedSeat,
  ] =
    useState<number | null>(
      null
    )

  const [
    fullName,
    setFullName,
  ] =
    useState("")

  const [
    phoneNumber,
    setPhoneNumber,
  ] =
    useState("")

  const [
    email,
    setEmail,
  ] =
    useState("")

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod | null>(
      null
    )

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] =
    useState(false)

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState("")

  /*
   * ---------------------------------------
   * LOAD THE SELECTED TRIP
   * ---------------------------------------
   */

  useEffect(() => {
    if (
      !tripId
    ) {
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
        setMessage(
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
    tripId,
    copy.failedLoadTrip,
    copy.tripDataMissing,
  ])

  /*
   * ---------------------------------------
   * ALREADY RESERVED SEATS
   * ---------------------------------------
   */

  const unavailableSeats =
    useMemo(
      () => {
        return new Set(
          trip?.occupiedSeats?.map(
            (
              seatNumber
            ) =>
              Number(
                seatNumber
              )
          ) ?? []
        )
      },
      [
        trip,
      ]
    )

  /*
   * ---------------------------------------
   * CREATE SEATS FROM BUS CAPACITY
   * ---------------------------------------
   */

  const seatNumbers =
    useMemo(
      () => {
        if (
          !trip
        ) {
          return []
        }

        return Array.from(
          {
            length:
              Number(
                trip.bus
                  .capacity
              ),
          },
          (
            _,
            index
          ) =>
            index +
            1
        )
      },
      [
        trip,
      ]
    )

  /*
   * ---------------------------------------
   * CREATE BOOKING
   * ---------------------------------------
   */

  async function confirmBooking(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !trip
    ) {
      setMessage(
        copy.tripUnavailable
      )

      return
    }

    if (
      selectedSeat ===
      null
    ) {
      setMessage(
        copy.selectSeatMessage
      )

      return
    }

    if (
      !fullName.trim()
    ) {
      setMessage(
        copy.enterNameMessage
      )

      return
    }

    if (
      !phoneNumber.trim()
    ) {
      setMessage(
        copy.enterPhoneMessage
      )

      return
    }

    if (
      !paymentMethod
    ) {
      setMessage(
        copy.paymentRequiredMessage
      )

      return
    }

    if (
      !acceptedTerms
    ) {
      setMessage(
        copy.reviewMessage
      )

      return
    }

    setSubmitting(
      true
    )

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
          copy.loginMissing
        )
      }

      /*
       * Send the Supabase access token.
       */

      const response =
        await fetch(
          "/api/bookings",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify(
                {
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

                  paymentMethod,
                }
              ),
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
                  (
                    seatNumber
                  ) =>
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
                copy.failedBooking
        )
      }

      /*
       * ---------------------------------------
       * BOOKING CREATED
       * ---------------------------------------
       *
       * Cash can go directly to the confirmed
       * ticket because no online checkout is
       * required.
       *
       * Card and Fawry must go through the
       * payment page first.
       */

      const paymentStatus =
        result.payment
          ?.payment_status ||
        (paymentMethod === "cash"
          ? "unpaid"
          : "pending")

      const sharedParams =
        new URLSearchParams(
          {
            bookingReference:
              result.booking
                .booking_reference,

            seat:
              selectedSeat.toString(),

            name:
              result.booking
                .passenger_name,

            paymentMethod,

            paymentStatus,

            amount:
              result.booking
                .total_price
                .toString(),
          }
        )

      if (
        paymentMethod ===
        "cash"
      ) {
        sharedParams.set(
          "bookingId",
          result.booking.id.toString()
        )

        router.push(
          `/dashboard/booking-success?${sharedParams.toString()}`
        )

        return
      }

      router.push(
        `/dashboard/payment/${result.booking.id}?${sharedParams.toString()}`
      )
    } catch (
      error
    ) {
      setMessage(
        error instanceof Error
          ? error.message
          : copy.failedBooking
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

  if (
    !tripId
  ) {
    return (
      <PageMessage
        title={
          copy.tripNotFound
        }
        message={
          copy.noTripId
        }
      />
    )
  }

  if (
    loading
  ) {
    return (
      <PageMessage
        message={
          copy.loadingBooking
        }
      />
    )
  }

  if (
    !trip
  ) {
    return (
      <PageMessage
        title={
          copy.tripNotFound
        }
        message={
          message ||
          copy.tripCouldNotLoad
        }
      />
    )
  }

  /*
   * ---------------------------------------
   * TRIP DATA
   * ---------------------------------------
   */

  const destination =
    trip.route
      .destination
      .name

  const vehicleName =
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

  const backParams =
    new URLSearchParams(
      {
        from:
          currentLocation,

        to:
          destination,
      }
    )

  if (
    destinationId
  ) {
    backParams.set(
      "destinationId",
      destinationId
    )
  }

  /*
   * ---------------------------------------
   * RENDER
   * ---------------------------------------
   */

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section>
        <Link
          href={`/dashboard/routes/${trip.id}?${backParams.toString()}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#512978] hover:underline"
        >
          <ArrowLeft className="size-4" />

          {
            copy.backTrip
          }
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          {
            copy.completeBooking
          }
        </h1>

        <p className="mt-2 text-slate-600">
          {
            copy.completeDescription
          }
        </p>
      </section>

      <form
        onSubmit={
          confirmBooking
        }
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          {/* SEAT SELECTION */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                {
                  copy.selectSeat
                }
              </CardTitle>

              <CardDescription>
                {
                  copy.seatDescription
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="mx-auto max-w-md">
                <div className="mb-6 flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BusFront className="size-5 text-[#512978]" />

                    <span className="text-sm font-medium text-slate-800">
                      {
                        copy.frontBus
                      }
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
                            formatNumber(
                              seatNumber,
                              language
                            )
                          )}
                        </button>
                      )
                    }
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-600">
                  <LegendItem
                    className="border-slate-300 bg-white"
                    label={
                      copy.available
                    }
                  />

                  <LegendItem
                    className="border-[#512978] bg-[#512978]"
                    label={
                      copy.selected
                    }
                  />

                  <LegendItem
                    className="border-slate-200 bg-slate-200"
                    label={
                      copy.reserved
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PASSENGER INFORMATION */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                {
                  copy.passengerInformation
                }
              </CardTitle>

              <CardDescription>
                {
                  copy.passengerDescription
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="full-name">
                  {
                    copy.fullName
                  }
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
                  placeholder={
                    copy.fullNamePlaceholder
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {
                    copy.phoneNumber
                  }
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
                  {
                    copy.emailAddress
                  }
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
                  {
                    copy.reviewedBooking
                  }
                </span>
              </label>
            </CardContent>
          </Card>

          {/* PAYMENT METHOD */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                {copy.paymentMethod}
              </CardTitle>

              <CardDescription>
                {copy.paymentDescription}
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              <PaymentMethodButton
                icon={CreditCard}
                title={copy.cardPayment}
                description={copy.cardPaymentDescription}
                selected={paymentMethod === "card"}
                disabled={submitting}
                onClick={() => {
                  setPaymentMethod("card")
                  setMessage("")
                }}
              />

              <PaymentMethodButton
                icon={Store}
                title={copy.fawryPayment}
                description={copy.fawryPaymentDescription}
                selected={paymentMethod === "fawry"}
                disabled={submitting}
                onClick={() => {
                  setPaymentMethod("fawry")
                  setMessage("")
                }}
              />

              <PaymentMethodButton
                icon={Banknote}
                title={copy.cashPayment}
                description={copy.cashPaymentDescription}
                selected={paymentMethod === "cash"}
                disabled={submitting}
                onClick={() => {
                  setPaymentMethod("cash")
                  setMessage("")
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* SUMMARY */}

        <aside className="space-y-6">
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                {
                  copy.bookingSummary
                }
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
              <SummaryItem
                icon={
                  MapPin
                }
                label={
                  copy.pickupPoint
                }
                value={
                  translateLocationText(
                    trip.route
                      .pickupPoint
                      .name,
                    language
                  )
                }
              />

              <SummaryItem
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

              <SummaryItem
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

              <SummaryItem
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

              <SummaryItem
                icon={
                  BusFront
                }
                label={
                  copy.vehicle
                }
                value={
                  vehicleName
                }
              />

              <SummaryItem
                icon={
                  UserRound
                }
                label={
                  copy.selectedSeat
                }
                value={
                  selectedSeat ===
                  null
                    ? copy.notSelected
                    : `${copy.seat} ${formatNumber(
                        selectedSeat,
                        language
                      )}`
                }
              />

              <SummaryItem
                icon={
                  paymentMethod === "cash"
                    ? Banknote
                    : paymentMethod === "fawry"
                      ? Store
                      : CreditCard
                }
                label={copy.selectedPaymentMethod}
                value={
                  paymentMethod === "card"
                    ? copy.cardPayment
                    : paymentMethod === "fawry"
                      ? copy.fawryPayment
                      : paymentMethod === "cash"
                        ? copy.cashPayment
                        : copy.notSelected
                }
              />

              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {
                      copy.totalPrice
                    }
                  </span>

                  <span className="text-2xl font-semibold text-slate-900">
                    {
                      copy.currency
                    }{" "}
                    {formatNumber(
                      Number(
                        trip.price
                      ),
                      language
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CONFIRMATION */}

          <Card className="rounded-xl border-purple-100 bg-purple-50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#512978]" />

                <div>
                  <p className="font-medium text-slate-900">
                    {
                      copy.confirmBooking
                    }
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {
                      copy.confirmDescription
                    }
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
                  ? copy.creatingBooking
                  : paymentMethod === "cash"
                    ? copy.confirmButton
                    : copy.continuePayment}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  )
}

/*
 * =========================================
 * PAYMENT METHOD BUTTON
 * =========================================
 */

function PaymentMethodButton({
  icon: Icon,
  title,
  description,
  selected,
  disabled,
  onClick,
}: {
  icon: React.ElementType
  title: string
  description: string
  selected: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-32 flex-col items-start rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#512978] bg-purple-50 ring-1 ring-[#512978]"
          : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <div
        className={`flex size-10 items-center justify-center rounded-lg ${
          selected
            ? "bg-[#512978] text-white"
            : "bg-purple-50 text-[#512978]"
        }`}
      >
        <Icon className="size-5" />
      </div>

      <p className="mt-4 font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </button>
  )
}

/*
 * =========================================
 * PAGE MESSAGE
 * =========================================
 */

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

/*
 * =========================================
 * SUMMARY ITEM
 * =========================================
 */

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

/*
 * =========================================
 * LEGEND ITEM
 * =========================================
 */

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
    ),
    {
      maximumFractionDigits:
        0,
    }
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