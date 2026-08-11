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
  passengerEmail:
    | string
    | null
  createdAt: string
  tripId:
    | number
    | null
  departureTime:
    | string
    | null
  arrivalTime:
    | string
    | null
  pickupPoint: string
  pickupArea:
    | string
    | null
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

const bookingsCopy = {
  english: {
    loginMissing:
      "Your login session could not be found. Please log in again.",

    loadFailed:
      "Failed to load your bookings.",

    cancelQuestion:
      "Are you sure you want to cancel booking",

    cancelFailed:
      "Failed to cancel booking.",

    alreadyCancelled:
      "This booking was already cancelled.",

    cancelledSuccessfully:
      "Booking cancelled successfully.",

    trips:
      "Trips",

    myBookings:
      "My Bookings",

    pageDescription:
      "View your upcoming reservations and previous trips.",

    upcoming:
      "Upcoming",

    upcomingDescription:
      "Upcoming reservations",

    completed:
      "Completed",

    completedDescription:
      "Previous completed trips",

    cancelled:
      "Cancelled",

    cancelledDescription:
      "Cancelled reservations",

    bookingHistory:
      "Booking history",

    historyDescription:
      "Review your current and previous trip reservations.",

    previous:
      "Previous",

    loading:
      "Loading your bookings...",

    booking:
      "Booking",

    confirmed:
      "Confirmed",

    unknown:
      "Unknown",

    dateUnavailable:
      "Date unavailable",

    showQr:
      "Show QR",

    cancelling:
      "Cancelling...",

    cancelBooking:
      "Cancel booking",

    pickupPoint:
      "Pickup point",

    destination:
      "Destination",

    date:
      "Date",

    departure:
      "Departure",

    seat:
      "Seat",

    notAvailable:
      "Not available",

    unavailable:
      "Unavailable",

    vehicleDetails:
      "Vehicle details",

    plateNumber:
      "Plate number",

    boardingTicket:
      "Boarding Ticket",

    showQrDescription:
      "Show this QR code when boarding the bus.",

    bookingLabel:
      "Booking",

    passenger:
      "Passenger",

    pickup:
      "Pickup",

    scanDescription:
      "Scan this ticket when boarding. Once verified, the booking will be marked as completed.",

    backBookings:
      "Back to My Bookings",

    closeQr:
      "Close QR ticket",

    noUpcoming:
      "No upcoming bookings",

    noPrevious:
      "No previous bookings",

    noUpcomingDescription:
      "When you reserve a trip, your confirmed booking will appear here.",

    noPreviousDescription:
      "Your completed and cancelled trips will appear here.",
  },

  arabic: {
    loginMissing:
      "تعذر العثور على جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.",

    loadFailed:
      "تعذر تحميل حجوزاتك.",

    cancelQuestion:
      "هل أنت متأكد أنك تريد إلغاء الحجز",

    cancelFailed:
      "تعذر إلغاء الحجز.",

    alreadyCancelled:
      "تم إلغاء هذا الحجز بالفعل.",

    cancelledSuccessfully:
      "تم إلغاء الحجز بنجاح.",

    trips:
      "الرحلات",

    myBookings:
      "حجوزاتي",

    pageDescription:
      "عرض الحجوزات القادمة والرحلات السابقة.",

    upcoming:
      "القادمة",

    upcomingDescription:
      "الحجوزات القادمة",

    completed:
      "المكتملة",

    completedDescription:
      "الرحلات المكتملة السابقة",

    cancelled:
      "الملغاة",

    cancelledDescription:
      "الحجوزات الملغاة",

    bookingHistory:
      "سجل الحجوزات",

    historyDescription:
      "راجع حجوزات الرحلات الحالية والسابقة.",

    previous:
      "السابقة",

    loading:
      "جارٍ تحميل حجوزاتك...",

    booking:
      "الحجز",

    confirmed:
      "مؤكد",

    unknown:
      "غير معروف",

    dateUnavailable:
      "التاريخ غير متاح",

    showQr:
      "عرض QR",

    cancelling:
      "جارٍ الإلغاء...",

    cancelBooking:
      "إلغاء الحجز",

    pickupPoint:
      "نقطة الركوب",

    destination:
      "الوجهة",

    date:
      "التاريخ",

    departure:
      "المغادرة",

    seat:
      "المقعد",

    notAvailable:
      "غير متاح",

    unavailable:
      "غير متاح",

    vehicleDetails:
      "تفاصيل المركبة",

    plateNumber:
      "رقم اللوحة",

    boardingTicket:
      "تذكرة الصعود",

    showQrDescription:
      "اعرض رمز QR هذا عند الصعود إلى الحافلة.",

    bookingLabel:
      "الحجز",

    passenger:
      "الراكب",

    pickup:
      "نقطة الركوب",

    scanDescription:
      "امسح هذه التذكرة عند الصعود. بعد التحقق، سيتم تسجيل الحجز كمكتمل.",

    backBookings:
      "العودة إلى حجوزاتي",

    closeQr:
      "إغلاق تذكرة QR",

    noUpcoming:
      "لا توجد حجوزات قادمة",

    noPrevious:
      "لا توجد حجوزات سابقة",

    noUpcomingDescription:
      "عندما تحجز رحلة، سيظهر الحجز المؤكد هنا.",

    noPreviousDescription:
      "ستظهر الرحلات المكتملة والملغاة هنا.",
  },

  french: {
    loginMissing:
      "Votre session de connexion est introuvable. Veuillez vous reconnecter.",

    loadFailed:
      "Impossible de charger vos réservations.",

    cancelQuestion:
      "Êtes-vous sûr de vouloir annuler la réservation",

    cancelFailed:
      "Impossible d’annuler la réservation.",

    alreadyCancelled:
      "Cette réservation a déjà été annulée.",

    cancelledSuccessfully:
      "Réservation annulée avec succès.",

    trips:
      "Trajets",

    myBookings:
      "Mes réservations",

    pageDescription:
      "Consultez vos réservations à venir et vos trajets précédents.",

    upcoming:
      "À venir",

    upcomingDescription:
      "Réservations à venir",

    completed:
      "Terminées",

    completedDescription:
      "Trajets précédents terminés",

    cancelled:
      "Annulées",

    cancelledDescription:
      "Réservations annulées",

    bookingHistory:
      "Historique des réservations",

    historyDescription:
      "Consultez vos réservations de trajets actuelles et précédentes.",

    previous:
      "Précédentes",

    loading:
      "Chargement de vos réservations...",

    booking:
      "Réservation",

    confirmed:
      "Confirmée",

    unknown:
      "Inconnu",

    dateUnavailable:
      "Date indisponible",

    showQr:
      "Afficher le QR",

    cancelling:
      "Annulation...",

    cancelBooking:
      "Annuler la réservation",

    pickupPoint:
      "Point de prise en charge",

    destination:
      "Destination",

    date:
      "Date",

    departure:
      "Départ",

    seat:
      "Place",

    notAvailable:
      "Indisponible",

    unavailable:
      "Indisponible",

    vehicleDetails:
      "Détails du véhicule",

    plateNumber:
      "Immatriculation",

    boardingTicket:
      "Titre de transport",

    showQrDescription:
      "Présentez ce code QR lors de la montée dans le bus.",

    bookingLabel:
      "Réservation",

    passenger:
      "Passager",

    pickup:
      "Prise en charge",

    scanDescription:
      "Scannez ce billet lors de la montée. Une fois vérifiée, la réservation sera marquée comme terminée.",

    backBookings:
      "Retour à mes réservations",

    closeQr:
      "Fermer le billet QR",

    noUpcoming:
      "Aucune réservation à venir",

    noPrevious:
      "Aucune réservation précédente",

    noUpcomingDescription:
      "Lorsque vous réservez un trajet, votre réservation confirmée apparaîtra ici.",

    noPreviousDescription:
      "Vos trajets terminés et annulés apparaîtront ici.",
  },
} as const

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

  const direct =
    locationTranslations[
      normalized
    ]

  if (
    direct
  ) {
    return direct[
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
    translated =
      translated.replace(
        new RegExp(
          escapeRegExp(
            english
          ),
          "gi"
        ),
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

export default function BookingsPage() {
  const {
    language,
  } =
    useAppPreferences()

  const copy =
    bookingsCopy[
      language
    ]

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
    useState<Booking[]>(
      []
    )

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
        setLoading(
          true
        )

        setMessage(
          ""
        )

        setIsError(
          false
        )

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
                  copy.loadFailed
          )
        }

        setBookings(
          result.bookings ??
            []
        )
      } catch (
        error
      ) {
        setIsError(
          true
        )

        setMessage(
          error instanceof Error
            ? error.message
            : copy.loadFailed
        )
      } finally {
        setLoading(
          false
        )
      }
    }

    loadBookings()
  }, [
    copy.loadFailed,
    copy.loginMissing,
  ])

  /*
   * =========================================
   * UPCOMING BOOKINGS
   * =========================================
   */

  const upcomingBookings =
    useMemo(
      () => {
        return bookings
          .filter(
            (
              booking
            ) => {
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
          )
      },
      [
        bookings,
      ]
    )

  /*
   * =========================================
   * PREVIOUS BOOKINGS
   * =========================================
   */

  const previousBookings =
    useMemo(
      () => {
        return bookings
          .filter(
            (
              booking
            ) => {
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
            (
              a,
              b
            ) => {
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
      },
      [
        bookings,
      ]
    )

  const completedCount =
    bookings.filter(
      (
        booking
      ) =>
        booking.status.toLowerCase() ===
        "completed"
    ).length

  const cancelledCount =
    bookings.filter(
      (
        booking
      ) =>
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

    setMessage(
      ""
    )

    setIsError(
      false
    )
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
        `${copy.cancelQuestion} ${booking.bookingReference}?`
      )

    if (
      !confirmed
    ) {
      return
    }

    try {
      setCancellingReference(
        booking.bookingReference
      )

      setMessage(
        ""
      )

      setIsError(
        false
      )

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

      const response =
        await fetch(
          "/api/bookings/cancel",
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
                  bookingReference:
                    booking.bookingReference,
                }
              ),
          }
        )

      const result =
        (await response.json()) as CancelResponse

      if (
        !response.ok
      ) {
        throw new Error(
          result.error
            ? `${result.message} ${result.error}`
            : result.message ||
                copy.cancelFailed
        )
      }

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
          ? copy.alreadyCancelled
          : copy.cancelledSuccessfully
      )

      setIsError(
        false
      )
    } catch (
      error
    ) {
      setIsError(
        true
      )

      setMessage(
        error instanceof Error
          ? error.message
          : copy.cancelFailed
      )
    } finally {
      setCancellingReference(
        null
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section>
        <p className="text-sm font-medium text-[#512978]">
          {
            copy.trips
          }
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          {
            copy.myBookings
          }
        </h1>

        <p className="mt-2 text-slate-600">
          {
            copy.pageDescription
          }
        </p>
      </section>

      {/* SUMMARY */}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={
            TicketCheck
          }
          label={
            copy.upcoming
          }
          value={
            formatNumber(
              upcomingBookings.length,
              language
            )
          }
          description={
            copy.upcomingDescription
          }
        />

        <SummaryCard
          icon={
            CheckCircle2
          }
          label={
            copy.completed
          }
          value={
            formatNumber(
              completedCount,
              language
            )
          }
          description={
            copy.completedDescription
          }
        />

        <SummaryCard
          icon={
            XCircle
          }
          label={
            copy.cancelled
          }
          value={
            formatNumber(
              cancelledCount,
              language
            )
          }
          description={
            copy.cancelledDescription
          }
        />
      </section>

      {/* BOOKING HISTORY */}

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-900">
                {
                  copy.bookingHistory
                }
              </CardTitle>

              <CardDescription className="mt-1">
                {
                  copy.historyDescription
                }
              </CardDescription>
            </div>

            <div className="flex w-full rounded-lg bg-slate-100 p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab(
                    "upcoming"
                  )

                  setMessage(
                    ""
                  )

                  setIsError(
                    false
                  )
                }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none ${
                  activeTab ===
                  "upcoming"
                    ? "bg-white text-[#512978] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {
                  copy.upcoming
                }
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab(
                    "previous"
                  )

                  setMessage(
                    ""
                  )

                  setIsError(
                    false
                  )
                }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none ${
                  activeTab ===
                  "previous"
                    ? "bg-white text-[#512978] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {
                  copy.previous
                }
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <p className="text-sm text-slate-500">
                {
                  copy.loading
                }
              </p>
            </div>
          ) : displayedBookings.length >
            0 ? (
            displayedBookings.map(
              (
                booking
              ) => (
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
                  language={
                    language
                  }
                />
              )
            )
          ) : (
            <EmptyBookingsState
              activeTab={
                activeTab
              }
              language={
                language
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
          language={
            language
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

function BookingCard({
  booking,
  showCancelButton,
  cancelling,
  onShowQr,
  onCancel,
  language,
}: {
  booking: Booking
  showCancelButton: boolean
  cancelling: boolean
  onShowQr: () => void
  onCancel: () => void
  language:
    LanguagePreference
}) {
  const copy =
    bookingsCopy[
      language
    ]

  const statusKey =
    booking.status
      .trim()
      .toLowerCase()

  const status =
    formatStatus(
      booking.status,
      language
    )

  const statusStyles =
    statusKey ===
    "confirmed"
      ? "bg-emerald-50 text-emerald-700"
      : statusKey ===
          "completed"
        ? "bg-blue-50 text-blue-700"
        : statusKey ===
            "cancelled"
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-700"

  const seatText =
    booking.seats.length >
    0
      ? booking.seats
          .map(
            (
              seat
            ) =>
              `${copy.seat} ${formatNumber(
                seat,
                language
              )}`
          )
          .join(
            ", "
          )
      : copy.notAvailable

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-semibold text-slate-900">
              {
                copy.booking
              }{" "}
              {
                booking.bookingReference
              }
            </p>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles}`}
            >
              {
                status
              }
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {booking.departureTime
              ? formatDate(
                  booking.departureTime,
                  language
                )
              : copy.dateUnavailable}
          </p>
        </div>

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

              {
                copy.showQr
              }
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
                ? copy.cancelling
                : copy.cancelBooking}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <LocationBlock
              icon={
                Navigation
              }
              label={
                copy.pickupPoint
              }
              value={
                booking.pickupArea
                  ? `${translateLocationText(
                      booking.pickupPoint,
                      language
                    )}, ${translateLocationText(
                      booking.pickupArea,
                      language
                    )}`
                  : translateLocationText(
                      booking.pickupPoint,
                      language
                    )
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
              label={
                copy.destination
              }
              value={
                translateLocationText(
                  booking.destination,
                  language
                )
              }
            />
          </div>

          <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
            <TripDetail
              icon={
                CalendarDays
              }
              label={
                copy.date
              }
              value={
                booking.departureTime
                  ? formatDate(
                      booking.departureTime,
                      language
                    )
                  : copy.unavailable
              }
            />

            <TripDetail
              icon={
                Clock3
              }
              label={
                copy.departure
              }
              value={
                booking.departureTime
                  ? formatTime(
                      booking.departureTime,
                      language
                    )
                  : copy.unavailable
              }
            />

            <TripDetail
              icon={
                UserRound
              }
              label={
                copy.seat
              }
              value={
                seatText
              }
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {
              copy.vehicleDetails
            }
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
                {
                  copy.plateNumber
                }
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

function QrTicketModal({
  booking,
  baseUrl,
  onClose,
  language,
}: {
  booking: Booking
  baseUrl: string
  onClose: () => void
  language:
    LanguagePreference
}) {
  const copy =
    bookingsCopy[
      language
    ]

  const scanUrl =
    `${baseUrl}/scan/${encodeURIComponent(
      booking.bookingReference
    )}`

  const seatText =
    booking.seats.length >
    0
      ? booking.seats
          .map(
            (
              seat
            ) =>
              formatNumber(
                seat,
                language
              )
          )
          .join(
            ", "
          )
      : "N/A"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[#512978]">
              CairoRoute
            </p>

            <p className="text-xs text-slate-500">
              {
                copy.boardingTicket
              }
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label={
              copy.closeQr
            }
            title={
              copy.backBookings
            }
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <XCircle className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-purple-50 text-[#512978]">
              <QrCode className="size-6" />
            </div>

            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              {
                copy.boardingTicket
              }
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {
                copy.showQrDescription
              }
            </p>
          </div>

          <div className="mt-6 flex justify-center rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
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
              label={
                copy.bookingLabel
              }
              value={
                booking.bookingReference
              }
            />

            <TicketRow
              label={
                copy.passenger
              }
              value={
                booking.passengerName
              }
            />

            <TicketRow
              label={
                copy.seat
              }
              value={
                seatText
              }
            />

            <TicketRow
              label={
                copy.pickup
              }
              value={
                translateLocationText(
                  booking.pickupPoint,
                  language
                )
              }
            />

            <TicketRow
              label={
                copy.destination
              }
              value={
                translateLocationText(
                  booking.destination,
                  language
                )
              }
            />

            <TicketRow
              label={
                copy.departure
              }
              value={
                booking.departureTime
                  ? `${formatDate(
                      booking.departureTime,
                      language
                    )} • ${formatTime(
                      booking.departureTime,
                      language
                    )}`
                  : copy.unavailable
              }
            />
          </div>

          <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50 p-3">
            <p className="text-center text-xs leading-5 text-slate-600">
              {
                copy.scanDescription
              }
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white p-4">
          <Button
            type="button"
            onClick={
              onClose
            }
            className="w-full bg-[#512978] text-white hover:bg-[#40205f]"
          >
            {
              copy.backBookings
            }
          </Button>
        </div>
      </div>
    </div>
  )
}

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

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon:
    React.ElementType
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

function LocationBlock({
  icon: Icon,
  label,
  value,
}: {
  icon:
    React.ElementType
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

function TripDetail({
  icon: Icon,
  label,
  value,
}: {
  icon:
    React.ElementType
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

function EmptyBookingsState({
  activeTab,
  language,
}: {
  activeTab:
    BookingTab
  language:
    LanguagePreference
}) {
  const copy =
    bookingsCopy[
      language
    ]

  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-purple-50 text-[#512978]">
        <TicketCheck className="size-7" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        {activeTab ===
        "upcoming"
          ? copy.noUpcoming
          : copy.noPrevious}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {activeTab ===
        "upcoming"
          ? copy.noUpcomingDescription
          : copy.noPreviousDescription}
      </p>
    </div>
  )
}

function formatStatus(
  status: string,
  language:
    LanguagePreference
) {
  const copy =
    bookingsCopy[
      language
    ]

  const normalized =
    status
      ?.trim()
      .toLowerCase()

  if (
    normalized ===
    "confirmed"
  ) {
    return copy.confirmed
  }

  if (
    normalized ===
    "completed"
  ) {
    return copy.completed
  }

  if (
    normalized ===
    "cancelled"
  ) {
    return copy.cancelled
  }

  if (
    !normalized
  ) {
    return copy.unknown
  }

  if (
    language ===
    "english"
  ) {
    return (
      normalized
        .charAt(
          0
        )
        .toUpperCase() +
      normalized.slice(
        1
      )
    )
  }

  return status
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