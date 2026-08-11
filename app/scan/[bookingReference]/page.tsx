"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Banknote,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  QrCode,
  XCircle,
} from "lucide-react"

import { useParams } from "next/navigation"

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

type ScanState =
  | "loading"
  | "success"
  | "cash_due"
  | "error"

type PaymentMethod =
  | "card"
  | "fawry"
  | "cash"

type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded"

type ScanResponse = {
  message: string

  alreadyCompleted?: boolean
  canBoard?: boolean
  requiresCashCollection?: boolean
  amountDue?: number

  booking?: {
    id: number
    booking_reference: string
    status: string
    passenger_name: string
    total_price?: number
    trip_id: number
  }

  payment?: {
    id: number
    booking_id: number
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    amount: number
    provider: string | null
    provider_reference: string | null
    paid_at: string | null
  }

  error?: string
}

const scanCopy = {
  english: {
    checkingTicket:
      "Checking ticket.",

    alreadyCheckedIn:
      "This passenger has already checked in.",

    checkedInSuccessfully:
      "Passenger checked in successfully.",

    unableToVerify:
      "Unable to verify this ticket.",

    ticketTitle:
      "CairoRoute Ticket",

    boardingVerification:
      "Boarding verification",

    ticketAccepted:
      "Ticket accepted",

    ticketRejected:
      "Ticket rejected",

    cashPaymentRequired:
      "Cash payment required",

    cashPaymentMessage:
      "Collect the cash payment before allowing the passenger to board.",

    confirmCashReceived:
      "Confirm cash received",

    confirmingCash:
      "Confirming payment.",

    passenger:
      "Passenger",

    bookingStatus:
      "Booking status",

    paymentMethod:
      "Payment method",

    paymentStatus:
      "Payment status",

    amount:
      "Amount",

    card:
      "Card",

    fawry:
      "Fawry",

    cash:
      "Cash",

    paid:
      "Paid",

    unpaid:
      "Unpaid",

    pending:
      "Pending",

    failed:
      "Failed",

    refunded:
      "Refunded",

    confirmed:
      "Confirmed",

    completed:
      "Completed",

    pendingPayment:
      "Pending payment",

    cancelled:
      "Cancelled",

    egp:
      "EGP",
  },

  arabic: {
    checkingTicket:
      "جارٍ التحقق من التذكرة.",

    alreadyCheckedIn:
      "تم تسجيل صعود هذا الراكب بالفعل.",

    checkedInSuccessfully:
      "تم تسجيل صعود الراكب بنجاح.",

    unableToVerify:
      "تعذر التحقق من هذه التذكرة.",

    ticketTitle:
      "تذكرة CairoRoute",

    boardingVerification:
      "التحقق من الصعود",

    ticketAccepted:
      "تم قبول التذكرة",

    ticketRejected:
      "تم رفض التذكرة",

    cashPaymentRequired:
      "الدفع النقدي مطلوب",

    cashPaymentMessage:
      "يجب تحصيل المبلغ النقدي قبل السماح للراكب بالصعود.",

    confirmCashReceived:
      "تأكيد استلام المبلغ",

    confirmingCash:
      "جارٍ تأكيد الدفع.",

    passenger:
      "الراكب",

    bookingStatus:
      "حالة الحجز",

    paymentMethod:
      "طريقة الدفع",

    paymentStatus:
      "حالة الدفع",

    amount:
      "المبلغ",

    card:
      "بطاقة",

    fawry:
      "فوري",

    cash:
      "نقدي",

    paid:
      "مدفوع",

    unpaid:
      "غير مدفوع",

    pending:
      "قيد الانتظار",

    failed:
      "فشل",

    refunded:
      "مسترد",

    confirmed:
      "مؤكد",

    completed:
      "مكتمل",

    pendingPayment:
      "الدفع قيد الانتظار",

    cancelled:
      "ملغي",

    egp:
      "ج.م",
  },

  french: {
    checkingTicket:
      "Vérification du billet.",

    alreadyCheckedIn:
      "Ce passager a déjà été enregistré.",

    checkedInSuccessfully:
      "Passager enregistré avec succès.",

    unableToVerify:
      "Impossible de vérifier ce billet.",

    ticketTitle:
      "Billet CairoRoute",

    boardingVerification:
      "Vérification d’embarquement",

    ticketAccepted:
      "Billet accepté",

    ticketRejected:
      "Billet refusé",

    cashPaymentRequired:
      "Paiement en espèces requis",

    cashPaymentMessage:
      "Encaissez le paiement en espèces avant d’autoriser l’embarquement.",

    confirmCashReceived:
      "Confirmer l’encaissement",

    confirmingCash:
      "Confirmation du paiement.",

    passenger:
      "Passager",

    bookingStatus:
      "Statut de réservation",

    paymentMethod:
      "Mode de paiement",

    paymentStatus:
      "Statut du paiement",

    amount:
      "Montant",

    card:
      "Carte",

    fawry:
      "Fawry",

    cash:
      "Espèces",

    paid:
      "Payé",

    unpaid:
      "Non payé",

    pending:
      "En attente",

    failed:
      "Échoué",

    refunded:
      "Remboursé",

    confirmed:
      "Confirmé",

    completed:
      "Terminé",

    pendingPayment:
      "Paiement en attente",

    cancelled:
      "Annulé",

    egp:
      "EGP",
  },
} as const

export default function ScanBookingPage() {
  const params =
    useParams<{
      bookingReference: string
    }>()

  const {
    language,
  } =
    useAppPreferences()

  const copy =
    scanCopy[
      language
    ]

  const hasScanned =
    useRef(
      false
    )

  const [
    state,
    setState,
  ] =
    useState<ScanState>(
      "loading"
    )

  const [
    message,
    setMessage,
  ] =
    useState<string>(
      copy.checkingTicket
    )

  const [
    result,
    setResult,
  ] =
    useState<ScanResponse | null>(
      null
    )

  const [
    confirmingCash,
    setConfirmingCash,
  ] =
    useState(
      false
    )

  function translatePaymentMethod(
    method:
      PaymentMethod | undefined
  ) {
    if (
      method ===
      "card"
    ) {
      return copy.card
    }

    if (
      method ===
      "fawry"
    ) {
      return copy.fawry
    }

    if (
      method ===
      "cash"
    ) {
      return copy.cash
    }

    return "-"
  }

  function translatePaymentStatus(
    status:
      PaymentStatus | undefined
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

    if (
      status ===
      "pending"
    ) {
      return copy.pending
    }

    if (
      status ===
      "failed"
    ) {
      return copy.failed
    }

    if (
      status ===
      "refunded"
    ) {
      return copy.refunded
    }

    return "-"
  }

  function translateBookingStatus(
    status:
      string | undefined
  ) {
    if (
      status ===
      "confirmed"
    ) {
      return copy.confirmed
    }

    if (
      status ===
      "completed"
    ) {
      return copy.completed
    }

    if (
      status ===
      "pending_payment"
    ) {
      return copy.pendingPayment
    }

    if (
      status ===
      "cancelled"
    ) {
      return copy.cancelled
    }

    return status ??
      "-"
  }

  async function submitScan(
    confirmCashCollected:
      boolean
  ) {
    const bookingReference =
      decodeURIComponent(
        params.bookingReference
      )

    const response =
      await fetch(
        "/api/bookings/scan",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              {
                bookingReference,
                confirmCashCollected,
              }
            ),
        }
      )

    const scanResult =
      (await response.json()) as ScanResponse

    setResult(
      scanResult
    )

    if (
      scanResult
        .requiresCashCollection
    ) {
      setMessage(
        scanResult.message ||
          copy.cashPaymentMessage
      )

      setState(
        "cash_due"
      )

      return
    }

    if (
      !response.ok
    ) {
      setMessage(
        scanResult.error
          ? `${scanResult.message} ${scanResult.error}`
          : scanResult.message
      )

      setState(
        "error"
      )

      return
    }

    setMessage(
      scanResult.alreadyCompleted
        ? copy.alreadyCheckedIn
        : copy.checkedInSuccessfully
    )

    setState(
      "success"
    )
  }

  useEffect(
    () => {
      if (
        hasScanned.current
      ) {
        return
      }

      hasScanned.current =
        true

      async function scanBooking() {
        try {
          setMessage(
            copy.checkingTicket
          )

          await submitScan(
            false
          )
        } catch (
          error
        ) {
          setState(
            "error"
          )

          setMessage(
            error instanceof Error
              ? error.message
              : copy.unableToVerify
          )
        }
      }

      void scanBooking()
    },
    // The QR should be processed once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      params.bookingReference,
    ]
  )

  async function handleConfirmCash() {
    if (
      confirmingCash
    ) {
      return
    }

    try {
      setConfirmingCash(
        true
      )

      setMessage(
        copy.confirmingCash
      )

      await submitScan(
        true
      )
    } catch (
      error
    ) {
      setState(
        "error"
      )

      setMessage(
        error instanceof Error
          ? error.message
          : copy.unableToVerify
      )
    } finally {
      setConfirmingCash(
        false
      )
    }
  }

  const booking =
    result?.booking

  const payment =
    result?.payment

  const amount =
    result?.amountDue ??
    (
      payment
        ? Number(
            payment.amount
          )
        : booking?.total_price
          ? Number(
              booking.total_price
            )
          : null
    )

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#512978]/10">
            <QrCode className="size-6 text-[#512978]" />
          </div>

          <CardTitle className="mt-3 text-2xl">
            {
              copy.ticketTitle
            }
          </CardTitle>

          <CardDescription>
            {
              copy.boardingVerification
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          {state ===
            "loading" && (
            <>
              <LoaderCircle className="mx-auto size-10 animate-spin text-[#512978]" />

              <p className="mt-4 text-slate-600">
                {
                  message
                }
              </p>
            </>
          )}

          {state ===
            "success" && (
            <>
              <CheckCircle2 className="mx-auto size-14 text-emerald-600" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {
                  result
                    ?.alreadyCompleted
                    ? copy.alreadyCheckedIn
                    : copy.ticketAccepted
                }
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {
                  message
                }
              </p>
            </>
          )}

          {state ===
            "cash_due" && (
            <>
              <Banknote className="mx-auto size-14 text-amber-600" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {
                  copy.cashPaymentRequired
                }
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {
                  copy.cashPaymentMessage
                }
              </p>
            </>
          )}

          {state ===
            "error" && (
            <>
              <XCircle className="mx-auto size-14 text-red-600" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {
                  copy.ticketRejected
                }
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {
                  message
                }
              </p>
            </>
          )}

          {state !==
            "loading" &&
            (
              booking ||
              payment
            ) && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              {booking?.passenger_name && (
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-2">
                  <span className="text-sm text-slate-500">
                    {
                      copy.passenger
                    }
                  </span>

                  <span className="text-right text-sm font-semibold text-slate-900">
                    {
                      booking.passenger_name
                    }
                  </span>
                </div>
              )}

              {booking?.status && (
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-2">
                  <span className="text-sm text-slate-500">
                    {
                      copy.bookingStatus
                    }
                  </span>

                  <span className="text-right text-sm font-semibold text-slate-900">
                    {
                      translateBookingStatus(
                        booking.status
                      )
                    }
                  </span>
                </div>
              )}

              {payment?.payment_method && (
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-2">
                  <span className="text-sm text-slate-500">
                    {
                      copy.paymentMethod
                    }
                  </span>

                  <span className="flex items-center gap-2 text-right text-sm font-semibold text-slate-900">
                    {payment.payment_method ===
                    "cash"
                      ? (
                        <Banknote className="size-4" />
                      )
                      : (
                        <CreditCard className="size-4" />
                      )}

                    {
                      translatePaymentMethod(
                        payment.payment_method
                      )
                    }
                  </span>
                </div>
              )}

              {payment?.payment_status && (
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-2">
                  <span className="text-sm text-slate-500">
                    {
                      copy.paymentStatus
                    }
                  </span>

                  <span className="text-right text-sm font-semibold text-slate-900">
                    {
                      translatePaymentStatus(
                        payment.payment_status
                      )
                    }
                  </span>
                </div>
              )}

              {amount !==
                null && (
                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="text-sm text-slate-500">
                    {
                      copy.amount
                    }
                  </span>

                  <span className="text-right text-sm font-semibold text-slate-900">
                    {
                      amount.toFixed(
                        2
                      )
                    }{" "}
                    {
                      copy.egp
                    }
                  </span>
                </div>
              )}
            </div>
          )}

          {state ===
            "cash_due" && (
            <button
              type="button"
              onClick={
                handleConfirmCash
              }
              disabled={
                confirmingCash
              }
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#512978] px-4 text-sm font-semibold text-white transition hover:bg-[#432163] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirmingCash
                ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />

                    {
                      copy.confirmingCash
                    }
                  </>
                )
                : copy.confirmCashReceived}
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}