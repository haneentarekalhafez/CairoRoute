"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  CheckCircle2,
  LoaderCircle,
  XCircle,
} from "lucide-react"

import {
  useRouter,
  useSearchParams,
} from "next/navigation"

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

type ReturnState =
  | "verifying"
  | "success"
  | "failed"
  | "waiting"

type PaymentStatusResponse = {
  booking?: {
    id: number
    bookingReference: string
    status: string
  }

  payment?: {
    paymentMethod: string
    paymentStatus: string
    amount: number
  }

  message?: string
  error?: string
}

const returnCopy = {
  english: {
    title:
      "Payment result",

    description:
      "CairoRoute is confirming your payment securely.",

    verifying:
      "Verifying your payment...",

    waiting:
      "Your payment was received by Paymob. CairoRoute is waiting for the secure payment confirmation.",

    success:
      "Payment successful",

    successDescription:
      "Your payment has been confirmed and your booking is ready.",

    failed:
      "Payment not completed",

    failedDescription:
      "Your payment was not completed. Your seat has not been confirmed.",

    unable:
      "We could not verify this payment yet.",

    myBookings:
      "Go to My Bookings",

    tryAgain:
      "Return to dashboard",
  },

  arabic: {
    title:
      "نتيجة الدفع",

    description:
      "تقوم CairoRoute بتأكيد عملية الدفع بشكل آمن.",

    verifying:
      "جارٍ التحقق من الدفع...",

    waiting:
      "استلم Paymob عملية الدفع، وتنتظر CairoRoute التأكيد الآمن من بوابة الدفع.",

    success:
      "تم الدفع بنجاح",

    successDescription:
      "تم تأكيد الدفع وأصبح حجزك جاهزًا.",

    failed:
      "لم تكتمل عملية الدفع",

    failedDescription:
      "لم تكتمل عملية الدفع ولم يتم تأكيد المقعد.",

    unable:
      "تعذر التحقق من عملية الدفع حتى الآن.",

    myBookings:
      "الذهاب إلى حجوزاتي",

    tryAgain:
      "العودة إلى لوحة التحكم",
  },

  french: {
    title:
      "Résultat du paiement",

    description:
      "CairoRoute confirme votre paiement de manière sécurisée.",

    verifying:
      "Vérification du paiement...",

    waiting:
      "Paymob a reçu le paiement. CairoRoute attend la confirmation sécurisée de la passerelle.",

    success:
      "Paiement réussi",

    successDescription:
      "Votre paiement a été confirmé et votre réservation est prête.",

    failed:
      "Paiement non effectué",

    failedDescription:
      "Le paiement n’a pas été effectué et votre siège n’a pas été confirmé.",

    unable:
      "Nous ne pouvons pas encore vérifier ce paiement.",

    myBookings:
      "Voir mes réservations",

    tryAgain:
      "Retour au tableau de bord",
  },
} as const

export default function PaymentReturnPage() {
  const router =
    useRouter()

  const searchParams =
    useSearchParams()

  const {
    language,
  } =
    useAppPreferences()

  const copy =
    returnCopy[
      language
    ]

  const hasStarted =
    useRef(
      false
    )

  const [
    state,
    setState,
  ] =
    useState<ReturnState>(
      "verifying"
    )

  const [
    message,
    setMessage,
  ] =
    useState<string>(
      copy.verifying
    )

  const [
    bookingId,
    setBookingId,
  ] =
    useState<number | null>(
      null
    )

  useEffect(
    () => {
      if (
        hasStarted.current
      ) {
        return
      }

      hasStarted.current =
        true

      const transactionId =
        searchParams.get(
          "id"
        )

      const bookingReference =
        searchParams.get(
          "special_reference"
        ) ||
        searchParams.get(
          "merchant_order_id"
        )

      async function verifyPayment() {
        /*
         * Paymob's browser redirect is NOT trusted as
         * proof of payment.
         *
         * We ask our own backend, which reads the payment
         * state written by the verified Paymob webhook.
         */
        for (
          let attempt =
            0;
          attempt <
            8;
          attempt +=
            1
        ) {
          try {
            const query =
              new URLSearchParams()

            if (
              transactionId
            ) {
              query.set(
                "transactionId",
                transactionId
              )
            }

            if (
              bookingReference
            ) {
              query.set(
                "bookingReference",
                bookingReference
              )
            }

            const response =
              await fetch(
                `/api/payments/status?${query.toString()}`,
                {
                  method:
                    "GET",

                  cache:
                    "no-store",
                }
              )

            const result =
              (await response.json()) as PaymentStatusResponse

            if (
              response.ok &&
              result.booking
            ) {
              setBookingId(
                result.booking.id
              )
            }

            const paymentStatus =
              result.payment
                ?.paymentStatus

            const bookingStatus =
              result.booking
                ?.status

            if (
              response.ok &&
              paymentStatus ===
                "paid" &&
              bookingStatus ===
                "confirmed"
            ) {
              setState(
                "success"
              )

              setMessage(
                copy.successDescription
              )

              return
            }

            if (
              paymentStatus ===
                "failed"
            ) {
              setState(
                "failed"
              )

              setMessage(
                copy.failedDescription
              )

              return
            }
          } catch {
            /*
             * The webhook may still be finishing.
             * Keep polling briefly before showing waiting.
             */
          }

          await new Promise(
            (
              resolve
            ) => {
              window.setTimeout(
                resolve,
                1500
              )
            }
          )
        }

        setState(
          "waiting"
        )

        setMessage(
          copy.waiting
        )
      }

      void verifyPayment()
    },
    [
      copy.failedDescription,
      copy.successDescription,
      copy.waiting,
      searchParams,
    ]
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-[#100b16]">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-sm dark:border-[#3a214f] dark:bg-[#17111f]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl dark:text-white">
            {
              copy.title
            }
          </CardTitle>

          <CardDescription className="dark:text-purple-100/70">
            {
              copy.description
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          {state ===
            "verifying" && (
            <>
              <LoaderCircle className="mx-auto size-12 animate-spin text-[#512978]" />

              <p className="mt-4 text-sm text-slate-600 dark:text-purple-100/70">
                {
                  copy.verifying
                }
              </p>
            </>
          )}

          {state ===
            "success" && (
            <>
              <CheckCircle2 className="mx-auto size-14 text-emerald-600" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
                {
                  copy.success
                }
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-purple-100/70">
                {
                  message
                }
              </p>

              <button
                type="button"
                onClick={
                  () => {
                    if (
                      bookingId
                    ) {
                      router.push(
                        "/dashboard/bookings"
                      )

                      return
                    }

                    router.push(
                      "/dashboard/bookings"
                    )
                  }
                }
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#512978] px-4 text-sm font-semibold text-white transition hover:bg-[#432163]"
              >
                {
                  copy.myBookings
                }
              </button>
            </>
          )}

          {state ===
            "failed" && (
            <>
              <XCircle className="mx-auto size-14 text-red-600" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
                {
                  copy.failed
                }
              </h2>

              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {
                  message
                }
              </p>

              <button
                type="button"
                onClick={
                  () =>
                    router.push(
                      "/dashboard"
                    )
                }
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#512978] px-4 text-sm font-semibold text-white transition hover:bg-[#432163]"
              >
                {
                  copy.tryAgain
                }
              </button>
            </>
          )}

          {state ===
            "waiting" && (
            <>
              <LoaderCircle className="mx-auto size-12 text-[#512978]" />

              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
                {
                  copy.unable
                }
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-purple-100/70">
                {
                  message
                }
              </p>

              <button
                type="button"
                onClick={
                  () =>
                    router.push(
                      "/dashboard/bookings"
                    )
                }
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#512978] px-4 text-sm font-semibold text-white transition hover:bg-[#432163]"
              >
                {
                  copy.myBookings
                }
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}