"use client"

import {
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
  Banknote,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  Store,
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

/*
 * =========================================
 * TYPES
 * =========================================
 */

type PaymentMethod =
  | "card"
  | "fawry"
  | "cash"

type PaymentRecord = {
  id: number
  booking_id: number
  payment_method: PaymentMethod
  payment_status: string
  amount: number
  provider: string | null
  provider_reference: string | null
  paid_at: string | null
}

type PaymobResponse = {
  message?: string
  error?: string
  checkoutUrl?: string
  alreadyPaid?: boolean
  payment?: PaymentRecord
}

type FawryResponse = {
  message?: string
  error?: string
  fawryReference?: string
  payment?: PaymentRecord
}

/*
 * =========================================
 * TRANSLATIONS
 * =========================================
 */

const paymentCopy = {
  english: {
    back:
      "Back to booking",

    title:
      "Complete payment",

    description:
      "Your seat is reserved. Complete the selected payment step to finish your booking.",

    bookingReference:
      "Booking reference",

    seat:
      "Seat",

    passenger:
      "Passenger",

    amount:
      "Amount",

    paymentMethod:
      "Payment method",

    currency:
      "EGP",

    card:
      "Visa / Mastercard",

    cardDescription:
      "You will be redirected to Paymob Test Mode to complete a sandbox card transaction. No real money will be charged.",

    openSandbox:
      "Open Paymob sandbox",

    openingSandbox:
      "Opening Paymob sandbox...",

    secure:
      "Secure test checkout",

    secureDescription:
      "Card details are entered on Paymob's hosted test checkout, not inside CairoRoute.",

    fawry:
      "Fawry",

    fawryDescription:
      "Generate a prototype Fawry payment reference for this booking.",

    generateReference:
      "Generate Fawry reference",

    generatingReference:
      "Generating reference...",

    reference:
      "Fawry reference",

    referenceHint:
      "Use this reference as the prototype payment code for your demonstration.",

    continueBooking:
      "Continue to booking confirmation",

    cash:
      "Cash on boarding",

    cashDescription:
      "No online payment is required. You will pay when boarding the bus.",

    continueCash:
      "Continue",

    loginMissing:
      "Your login session could not be found. Please log in again.",

    invalidBooking:
      "Invalid booking.",

    paymentMethodMissing:
      "Payment method was not provided.",

    failedPaymob:
      "Failed to start Paymob checkout.",

    failedFawry:
      "Failed to generate the Fawry reference.",

    alreadyPaid:
      "This booking has already been paid.",

    paid:
      "Paid",

    pending:
      "Pending",

    unpaid:
      "Unpaid",

    paymentReady:
      "Payment step ready",
  },

  arabic: {
    back:
      "العودة إلى الحجز",

    title:
      "إكمال الدفع",

    description:
      "تم حجز مقعدك. أكمل خطوة الدفع المحددة لإنهاء الحجز.",

    bookingReference:
      "رقم الحجز",

    seat:
      "المقعد",

    passenger:
      "الراكب",

    amount:
      "المبلغ",

    paymentMethod:
      "طريقة الدفع",

    currency:
      "ج.م",

    card:
      "فيزا / ماستركارد",

    cardDescription:
      "سيتم تحويلك إلى وضع الاختبار في Paymob لإتمام عملية دفع تجريبية. لن يتم خصم أموال حقيقية.",

    openSandbox:
      "فتح Paymob التجريبي",

    openingSandbox:
      "جارٍ فتح Paymob التجريبي...",

    secure:
      "دفع تجريبي آمن",

    secureDescription:
      "يتم إدخال بيانات البطاقة داخل صفحة Paymob التجريبية المستضافة، وليس داخل CairoRoute.",

    fawry:
      "فوري",

    fawryDescription:
      "أنشئ رقمًا مرجعيًا تجريبيًا لفوري لهذا الحجز.",

    generateReference:
      "إنشاء رقم فوري",

    generatingReference:
      "جارٍ إنشاء الرقم...",

    reference:
      "رقم فوري المرجعي",

    referenceHint:
      "استخدم هذا الرقم كرمز دفع تجريبي أثناء العرض.",

    continueBooking:
      "المتابعة إلى تأكيد الحجز",

    cash:
      "الدفع نقدًا عند الصعود",

    cashDescription:
      "لا يلزم دفع إلكتروني. ستدفع عند صعود الحافلة.",

    continueCash:
      "متابعة",

    loginMissing:
      "تعذر العثور على جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.",

    invalidBooking:
      "الحجز غير صالح.",

    paymentMethodMissing:
      "لم يتم تحديد طريقة الدفع.",

    failedPaymob:
      "تعذر بدء صفحة دفع Paymob.",

    failedFawry:
      "تعذر إنشاء رقم فوري المرجعي.",

    alreadyPaid:
      "تم دفع قيمة هذا الحجز بالفعل.",

    paid:
      "مدفوع",

    pending:
      "قيد الانتظار",

    unpaid:
      "غير مدفوع",

    paymentReady:
      "خطوة الدفع جاهزة",
  },

  french: {
    back:
      "Retour à la réservation",

    title:
      "Finaliser le paiement",

    description:
      "Votre place est réservée. Effectuez l'étape de paiement sélectionnée pour terminer la réservation.",

    bookingReference:
      "Référence de réservation",

    seat:
      "Place",

    passenger:
      "Passager",

    amount:
      "Montant",

    paymentMethod:
      "Mode de paiement",

    currency:
      "EGP",

    card:
      "Visa / Mastercard",

    cardDescription:
      "Vous serez redirigé vers le mode test de Paymob pour effectuer une transaction sandbox. Aucun argent réel ne sera débité.",

    openSandbox:
      "Ouvrir le sandbox Paymob",

    openingSandbox:
      "Ouverture du sandbox Paymob...",

    secure:
      "Paiement test sécurisé",

    secureDescription:
      "Les informations de carte sont saisies sur la page de paiement test hébergée par Paymob, et non dans CairoRoute.",

    fawry:
      "Fawry",

    fawryDescription:
      "Générez une référence Fawry de démonstration pour cette réservation.",

    generateReference:
      "Générer la référence Fawry",

    generatingReference:
      "Génération de la référence...",

    reference:
      "Référence Fawry",

    referenceHint:
      "Utilisez cette référence comme code de paiement de démonstration.",

    continueBooking:
      "Continuer vers la confirmation",

    cash:
      "Paiement en espèces à l'embarquement",

    cashDescription:
      "Aucun paiement en ligne n'est nécessaire. Vous paierez à l'embarquement.",

    continueCash:
      "Continuer",

    loginMissing:
      "Votre session de connexion est introuvable. Veuillez vous reconnecter.",

    invalidBooking:
      "Réservation invalide.",

    paymentMethodMissing:
      "Le mode de paiement n'a pas été fourni.",

    failedPaymob:
      "Impossible de démarrer le paiement Paymob.",

    failedFawry:
      "Impossible de générer la référence Fawry.",

    alreadyPaid:
      "Cette réservation a déjà été payée.",

    paid:
      "Payé",

    pending:
      "En attente",

    unpaid:
      "Non payé",

    paymentReady:
      "Étape de paiement prête",
  },
} as const

/*
 * =========================================
 * PAGE
 * =========================================
 */

export default function PaymentPage() {
  const params =
    useParams<{
      bookingId: string
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
    paymentCopy[
      language
    ]

  const bookingId =
    Number(
      params.bookingId
    )

  const bookingReference =
    searchParams.get(
      "bookingReference"
    ) || ""

  const seat =
    searchParams.get(
      "seat"
    ) || ""

  const passengerName =
    searchParams.get(
      "name"
    ) || ""

  const paymentMethod =
    searchParams.get(
      "paymentMethod"
    ) as PaymentMethod | null

  const initialPaymentStatus =
    searchParams.get(
      "paymentStatus"
    ) || "pending"

  const amount =
    Number(
      searchParams.get(
        "amount"
      ) || 0
    )

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState("")

  const [
    fawryReference,
    setFawryReference,
  ] =
    useState("")

  const [
    paymentStatus,
    setPaymentStatus,
  ] =
    useState(
      paymentMethod ===
        "cash"
        ? "unpaid"
        : initialPaymentStatus
    )

  const validBooking =
    Number.isInteger(
      bookingId
    ) &&
    bookingId >
      0

  const successParams =
    useMemo(
      () => {
        const values =
          new URLSearchParams(
            {
              bookingId:
                String(
                  bookingId
                ),

              bookingReference,

              seat,

              name:
                passengerName,

              paymentMethod:
                paymentMethod ||
                "cash",

              paymentStatus,
            }
          )

        return values
      },
      [
        bookingId,
        bookingReference,
        seat,
        passengerName,
        paymentMethod,
        paymentStatus,
      ]
    )

  /*
   * =========================================
   * GET AUTH SESSION
   * =========================================
   */

  async function getAccessToken() {
    const supabase =
      createClient()

    const {
      data: {
        session,
      },
      error,
    } =
      await supabase.auth.getSession()

    if (
      error ||
      !session
    ) {
      throw new Error(
        copy.loginMissing
      )
    }

    return session.access_token
  }

  /*
   * =========================================
   * START PAYMOB SANDBOX
   * =========================================
   */

  async function startPaymob() {
    if (
      !validBooking
    ) {
      setMessage(
        copy.invalidBooking
      )

      return
    }

    setLoading(
      true
    )

    setMessage("")

    try {
      const accessToken =
        await getAccessToken()

      const response =
        await fetch(
          "/api/payments/paymob",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body:
              JSON.stringify(
                {
                  bookingId,
                }
              ),
          }
        )

      const result =
        (await response.json()) as PaymobResponse

      if (
        !response.ok
      ) {
        throw new Error(
          result.error
            ? `${result.message || copy.failedPaymob} ${result.error}`
            : result.message ||
                copy.failedPaymob
        )
      }

      if (
        result.alreadyPaid
      ) {
        setPaymentStatus(
          "paid"
        )

        setMessage(
          copy.alreadyPaid
        )

        return
      }

      if (
        !result.checkoutUrl
      ) {
        throw new Error(
          result.message ||
            copy.failedPaymob
        )
      }

      /*
       * This is where the real Paymob TEST
       * checkout becomes visible to the user.
       */
      window.location.assign(
        result.checkoutUrl
      )
    } catch (
      error
    ) {
      setMessage(
        error instanceof Error
          ? error.message
          : copy.failedPaymob
      )

      setLoading(
        false
      )
    }
  }

  /*
   * =========================================
   * GENERATE FAWRY PROTOTYPE REFERENCE
   * =========================================
   */

  async function generateFawryReference() {
    if (
      !validBooking
    ) {
      setMessage(
        copy.invalidBooking
      )

      return
    }

    setLoading(
      true
    )

    setMessage("")

    try {
      const accessToken =
        await getAccessToken()

      const response =
        await fetch(
          "/api/payments",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body:
              JSON.stringify(
                {
                  bookingId,

                  action:
                    "generate_fawry_reference",
                }
              ),
          }
        )

      const result =
        (await response.json()) as FawryResponse

      if (
        !response.ok
      ) {
        throw new Error(
          result.error
            ? `${result.message || copy.failedFawry} ${result.error}`
            : result.message ||
                copy.failedFawry
        )
      }

      const reference =
        result.fawryReference ||
        result.payment
          ?.provider_reference ||
        ""

      if (
        !reference
      ) {
        throw new Error(
          copy.failedFawry
        )
      }

      setFawryReference(
        reference
      )

      setPaymentStatus(
        result.payment
          ?.payment_status ||
        "pending"
      )
    } catch (
      error
    ) {
      setMessage(
        error instanceof Error
          ? error.message
          : copy.failedFawry
      )
    } finally {
      setLoading(
        false
      )
    }
  }

  /*
   * =========================================
   * INVALID STATE
   * =========================================
   */

  if (
    !validBooking
  ) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-72 items-center justify-center p-8 text-center">
            <p className="text-sm text-red-700">
              {copy.invalidBooking}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (
    !paymentMethod ||
    ![
      "card",
      "fawry",
      "cash",
    ].includes(
      paymentMethod
    )
  ) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-72 items-center justify-center p-8 text-center">
            <p className="text-sm text-red-700">
              {
                copy.paymentMethodMissing
              }
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section>
        <Link
          href="/dashboard/my-bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#512978] hover:underline"
        >
          <ArrowLeft className="size-4" />

          {copy.back}
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          {copy.title}
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          {copy.description}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {paymentMethod ===
            "card" && (
            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#512978]">
                    <CreditCard className="size-5" />
                  </div>

                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      {copy.card}
                    </CardTitle>

                    <CardDescription className="mt-1">
                      {
                        copy.cardDescription
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#512978]" />

                    <div>
                      <p className="font-medium text-slate-900">
                        {
                          copy.secure
                        }
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {
                          copy.secureDescription
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {message && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {message}
                  </p>
                )}

                {paymentStatus ===
                  "paid" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      router.push(
                        `/dashboard/booking-success?${successParams.toString()}`
                      )
                    }}
                    className="h-11 w-full bg-[#512978] text-white hover:bg-[#40205f]"
                  >
                    <CheckCircle2 className="mr-2 size-4" />

                    {
                      copy.continueBooking
                    }
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={
                      loading
                    }
                    onClick={
                      startPaymob
                    }
                    className="h-11 w-full bg-[#512978] text-white hover:bg-[#40205f]"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="mr-2 size-4 animate-spin" />

                        {
                          copy.openingSandbox
                        }
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 size-4" />

                        {
                          copy.openSandbox
                        }
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {paymentMethod ===
            "fawry" && (
            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#512978]">
                    <Store className="size-5" />
                  </div>

                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      {copy.fawry}
                    </CardTitle>

                    <CardDescription className="mt-1">
                      {
                        copy.fawryDescription
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                {fawryReference ? (
                  <>
                    <div className="rounded-xl border border-purple-100 bg-purple-50 p-5 text-center">
                      <p className="text-sm font-medium text-slate-600">
                        {
                          copy.reference
                        }
                      </p>

                      <p className="mt-2 break-all text-2xl font-semibold tracking-wider text-[#512978]">
                        {
                          fawryReference
                        }
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {
                          copy.referenceHint
                        }
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        router.push(
                          `/dashboard/booking-success?${successParams.toString()}`
                        )
                      }}
                      className="h-11 w-full bg-[#512978] text-white hover:bg-[#40205f]"
                    >
                      {
                        copy.continueBooking
                      }
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    disabled={
                      loading
                    }
                    onClick={
                      generateFawryReference
                    }
                    className="h-11 w-full bg-[#512978] text-white hover:bg-[#40205f]"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="mr-2 size-4 animate-spin" />

                        {
                          copy.generatingReference
                        }
                      </>
                    ) : (
                      <>
                        <Store className="mr-2 size-4" />

                        {
                          copy.generateReference
                        }
                      </>
                    )}
                  </Button>
                )}

                {message && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {message}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {paymentMethod ===
            "cash" && (
            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#512978]">
                    <Banknote className="size-5" />
                  </div>

                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      {copy.cash}
                    </CardTitle>

                    <CardDescription className="mt-1">
                      {
                        copy.cashDescription
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <Button
                  type="button"
                  onClick={() => {
                    router.push(
                      `/dashboard/booking-success?${successParams.toString()}`
                    )
                  }}
                  className="h-11 w-full bg-[#512978] text-white hover:bg-[#40205f]"
                >
                  {
                    copy.continueCash
                  }
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <aside>
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                {
                  copy.paymentReady
                }
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
              <SummaryRow
                label={
                  copy.bookingReference
                }
                value={
                  bookingReference ||
                  `#${bookingId}`
                }
              />

              <SummaryRow
                label={
                  copy.passenger
                }
                value={
                  passengerName ||
                  "-"
                }
              />

              <SummaryRow
                label={
                  copy.seat
                }
                value={
                  seat ||
                  "-"
                }
              />

              <SummaryRow
                label={
                  copy.paymentMethod
                }
                value={
                  paymentMethod ===
                  "card"
                    ? copy.card
                    : paymentMethod ===
                        "fawry"
                      ? copy.fawry
                      : copy.cash
                }
              />

              <SummaryRow
                label={
                  paymentStatusLabel(
                    paymentStatus,
                    language,
                    copy
                  )
                }
                value=""
                status
              />

              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    {
                      copy.amount
                    }
                  </span>

                  <span className="text-xl font-semibold text-slate-900">
                    {copy.currency}{" "}
                    {formatNumber(
                      amount,
                      language
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

/*
 * =========================================
 * SUMMARY ROW
 * =========================================
 */

function SummaryRow({
  label,
  value,
  status = false,
}: {
  label: string
  value: string
  status?: boolean
}) {
  if (
    status
  ) {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-600">
          Status
        </span>

        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-[#512978]">
          {label}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="max-w-48 text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  )
}

/*
 * =========================================
 * PAYMENT STATUS LABEL
 * =========================================
 */

function paymentStatusLabel(
  status: string,
  _language:
    LanguagePreference,
  copy:
    (typeof paymentCopy)[keyof typeof paymentCopy]
) {
  if (
    status ===
    "paid"
  ) {
    return copy.paid
  }

  if (
    status ===
    "unpaid"
  ) {
    return copy.unpaid
  }

  return copy.pending
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
        2,
    }
  ).format(
    Number.isFinite(
      value
    )
      ? value
      : 0
  )
}