"use client"

import { useMemo, useState } from "react"

import {
  BusFront,
  ChevronDown,
  CircleHelp,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  ShieldAlert,
  TicketCheck,
} from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"

const helpCopy = {
  english: {
    helpCentre:
      "Help Centre",

    helpDescription:
      "Find answers about routes, pickup points, bookings, and account support.",

    searchHelp:
      "Search help articles",

    pickupPoints:
      "Pickup points",

    pickupPointsDescription:
      "Location detection and nearby pickup suggestions",

    routesAndBuses:
      "Routes and buses",

    routesAndBusesDescription:
      "Trip routes, timings, and vehicle information",

    bookings:
      "Bookings",

    bookingsDescription:
      "Booking confirmation, changes, and trip history",

    safety:
      "Safety",

    safetyDescription:
      "Trip safety information and urgent assistance",

    frequentlyAskedQuestions:
      "Frequently asked questions",

    faqDescription:
      "Common questions about using CairoRoute.",

    noMatchingQuestions:
      "No matching questions",

    noMatchingQuestionsDescription:
      "Try another search phrase or contact support.",

    contactSupport:
      "Contact support",

    contactSupportDescription:
      "Send a question or report a problem.",

    subject:
      "Subject",

    subjectPlaceholder:
      "What do you need help with?",

    message:
      "Message",

    messagePlaceholder:
      "Describe your question or issue",

    missingFields:
      "Please enter a subject and describe your issue.",

    submitted:
      "Your support request was submitted in the frontend prototype.",

    sendRequest:
      "Send request",

    contactInformation:
      "Contact information",

    contactInformationDescription:
      "Reach the CairoRoute support team using the details below.",

    supportEmail:
      "Support email",

    supportHotline:
      "Support hotline",
  },

  arabic: {
    helpCentre:
      "مركز المساعدة",

    helpDescription:
      "اعثر على إجابات حول المسارات ونقاط الركوب والحجوزات ودعم الحساب.",

    searchHelp:
      "ابحث في مقالات المساعدة",

    pickupPoints:
      "نقاط الركوب",

    pickupPointsDescription:
      "تحديد الموقع واقتراح نقاط الركوب القريبة",

    routesAndBuses:
      "المسارات والحافلات",

    routesAndBusesDescription:
      "مسارات الرحلات والمواعيد ومعلومات المركبات",

    bookings:
      "الحجوزات",

    bookingsDescription:
      "تأكيد الحجز والتغييرات وسجل الرحلات",

    safety:
      "السلامة",

    safetyDescription:
      "معلومات السلامة أثناء الرحلة والمساعدة العاجلة",

    frequentlyAskedQuestions:
      "الأسئلة الشائعة",

    faqDescription:
      "أسئلة شائعة حول استخدام CairoRoute.",

    noMatchingQuestions:
      "لا توجد أسئلة مطابقة",

    noMatchingQuestionsDescription:
      "جرّب عبارة بحث أخرى أو تواصل مع الدعم.",

    contactSupport:
      "التواصل مع الدعم",

    contactSupportDescription:
      "أرسل سؤالًا أو أبلغ عن مشكلة.",

    subject:
      "الموضوع",

    subjectPlaceholder:
      "بماذا تحتاج إلى المساعدة؟",

    message:
      "الرسالة",

    messagePlaceholder:
      "اشرح سؤالك أو المشكلة",

    missingFields:
      "يرجى إدخال الموضوع ووصف المشكلة.",

    submitted:
      "تم إرسال طلب الدعم في النموذج الأولي للواجهة.",

    sendRequest:
      "إرسال الطلب",

    contactInformation:
      "معلومات الاتصال",

    contactInformationDescription:
      "تواصل مع فريق دعم CairoRoute باستخدام البيانات أدناه.",

    supportEmail:
      "بريد الدعم",

    supportHotline:
      "الخط الساخن للدعم",
  },

  french: {
    helpCentre:
      "Centre d’aide",

    helpDescription:
      "Trouvez des réponses sur les trajets, les points de prise en charge, les réservations et l’assistance du compte.",

    searchHelp:
      "Rechercher dans l’aide",

    pickupPoints:
      "Points de prise en charge",

    pickupPointsDescription:
      "Détection de position et suggestions de points proches",

    routesAndBuses:
      "Trajets et bus",

    routesAndBusesDescription:
      "Itinéraires, horaires et informations sur les véhicules",

    bookings:
      "Réservations",

    bookingsDescription:
      "Confirmation, modifications et historique des trajets",

    safety:
      "Sécurité",

    safetyDescription:
      "Informations de sécurité et assistance urgente",

    frequentlyAskedQuestions:
      "Questions fréquentes",

    faqDescription:
      "Questions courantes sur l’utilisation de CairoRoute.",

    noMatchingQuestions:
      "Aucune question correspondante",

    noMatchingQuestionsDescription:
      "Essayez une autre recherche ou contactez l’assistance.",

    contactSupport:
      "Contacter l’assistance",

    contactSupportDescription:
      "Envoyez une question ou signalez un problème.",

    subject:
      "Objet",

    subjectPlaceholder:
      "De quoi avez-vous besoin ?",

    message:
      "Message",

    messagePlaceholder:
      "Décrivez votre question ou votre problème",

    missingFields:
      "Veuillez saisir un objet et décrire votre problème.",

    submitted:
      "Votre demande d’assistance a été envoyée dans le prototype frontend.",

    sendRequest:
      "Envoyer la demande",

    contactInformation:
      "Coordonnées",

    contactInformationDescription:
      "Contactez l’équipe d’assistance CairoRoute avec les informations ci-dessous.",

    supportEmail:
      "E-mail d’assistance",

    supportHotline:
      "Ligne d’assistance",
  },
} as const

const faqCopy = {
  english: [
    {
      question:
        "How does CairoRoute suggest the nearest pickup point?",

      answer:
        "CairoRoute will compare your current location with the available pickup points for routes going toward your destination, then suggest the closest suitable option.",
    },

    {
      question:
        "Can I choose a different pickup point?",

      answer:
        "Yes. After searching, you will be able to compare the available pickup points and select another suitable option before confirming your booking.",
    },

    {
      question:
        "Where can I find my confirmed trips?",

      answer:
        "Your upcoming and previous trips will appear inside the My Bookings page.",
    },

    {
      question:
        "Can I cancel or change a booking?",

      answer:
        "Cancellation and rescheduling controls will appear inside the booking details page. The available options will depend on the selected trip.",
    },

    {
      question:
        "What information will be shown about the bus?",

      answer:
        "The booking flow will show the bus type, color, plate number, departure time, pickup point, destination, and available seats.",
    },
  ],

  arabic: [
    {
      question:
        "كيف يقترح CairoRoute أقرب نقطة ركوب؟",

      answer:
        "يقارن CairoRoute موقعك الحالي بنقاط الركوب المتاحة للمسارات المتجهة إلى وجهتك، ثم يقترح أقرب خيار مناسب.",
    },

    {
      question:
        "هل يمكنني اختيار نقطة ركوب مختلفة؟",

      answer:
        "نعم. بعد البحث يمكنك مقارنة نقاط الركوب المتاحة واختيار خيار آخر مناسب قبل تأكيد الحجز.",
    },

    {
      question:
        "أين أجد رحلاتي المؤكدة؟",

      answer:
        "ستظهر رحلاتك القادمة والسابقة داخل صفحة حجوزاتي.",
    },

    {
      question:
        "هل يمكنني إلغاء الحجز أو تغييره؟",

      answer:
        "ستظهر خيارات الإلغاء وإعادة الجدولة داخل تفاصيل الحجز. وتختلف الخيارات المتاحة حسب الرحلة المختارة.",
    },

    {
      question:
        "ما المعلومات التي ستظهر عن الحافلة؟",

      answer:
        "سيعرض مسار الحجز نوع الحافلة ولونها ورقم اللوحة ووقت المغادرة ونقطة الركوب والوجهة والمقاعد المتاحة.",
    },
  ],

  french: [
    {
      question:
        "Comment CairoRoute suggère-t-il le point de prise en charge le plus proche ?",

      answer:
        "CairoRoute compare votre position actuelle avec les points de prise en charge disponibles pour les trajets vers votre destination, puis suggère l’option adaptée la plus proche.",
    },

    {
      question:
        "Puis-je choisir un autre point de prise en charge ?",

      answer:
        "Oui. Après la recherche, vous pouvez comparer les points disponibles et sélectionner une autre option adaptée avant de confirmer votre réservation.",
    },

    {
      question:
        "Où puis-je trouver mes trajets confirmés ?",

      answer:
        "Vos trajets à venir et précédents apparaissent dans la page Mes réservations.",
    },

    {
      question:
        "Puis-je annuler ou modifier une réservation ?",

      answer:
        "Les options d’annulation et de reprogrammation apparaissent dans les détails de la réservation. Les options disponibles dépendent du trajet sélectionné.",
    },

    {
      question:
        "Quelles informations seront affichées sur le bus ?",

      answer:
        "Le processus de réservation affiche le type de bus, sa couleur, son numéro d’immatriculation, l’heure de départ, le point de prise en charge, la destination et les places disponibles.",
    },
  ],
} as const

export default function HelpPage() {
  const {
    language,
  } =
    useAppPreferences()

  const copy =
    helpCopy[
      language
    ]

  const frequentlyAskedQuestions =
    faqCopy[
      language
    ]

  const [
    searchValue,
    setSearchValue,
  ] =
    useState("")

  const [
    openQuestion,
    setOpenQuestion,
  ] =
    useState<number | null>(
      0
    )

  const [
    subject,
    setSubject,
  ] =
    useState("")

  const [
    supportMessage,
    setSupportMessage,
  ] =
    useState("")

  const [
    feedback,
    setFeedback,
  ] =
    useState("")

  const filteredQuestions =
    useMemo(
      () => {
        const cleanSearch =
          searchValue
            .trim()
            .toLocaleLowerCase(
              getLocale(
                language
              )
            )

        if (
          !cleanSearch
        ) {
          return frequentlyAskedQuestions
        }

        return frequentlyAskedQuestions.filter(
          (
            item
          ) => {
            const searchableText =
              `${item.question} ${item.answer}`.toLocaleLowerCase(
                getLocale(
                  language
                )
              )

            return searchableText.includes(
              cleanSearch
            )
          }
        )
      },
      [
        frequentlyAskedQuestions,
        language,
        searchValue,
      ]
    )

  function submitSupportRequest(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !subject.trim() ||
      !supportMessage.trim()
    ) {
      setFeedback(
        copy.missingFields
      )

      return
    }

    setFeedback(
      copy.submitted
    )

    setSubject(
      ""
    )

    setSupportMessage(
      ""
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl bg-[#241536] px-6 py-8 text-white md:px-8">
        <div className="max-w-2xl">
          <div className="flex size-11 items-center justify-center rounded-lg bg-white/10">
            <CircleHelp className="size-6" />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            {
              copy.helpCentre
            }
          </h1>

          <p className="mt-2 text-purple-100/80">
            {
              copy.helpDescription
            }
          </p>

          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

            <Input
              value={
                searchValue
              }
              onChange={(
                event
              ) =>
                setSearchValue(
                  event.target.value
                )
              }
              placeholder={
                copy.searchHelp
              }
              className="h-12 border-white bg-white pl-11 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <HelpCategory
          icon={
            MapPin
          }
          title={
            copy.pickupPoints
          }
          description={
            copy.pickupPointsDescription
          }
        />

        <HelpCategory
          icon={
            BusFront
          }
          title={
            copy.routesAndBuses
          }
          description={
            copy.routesAndBusesDescription
          }
        />

        <HelpCategory
          icon={
            TicketCheck
          }
          title={
            copy.bookings
          }
          description={
            copy.bookingsDescription
          }
        />

        <HelpCategory
          icon={
            ShieldAlert
          }
          title={
            copy.safety
          }
          description={
            copy.safetyDescription
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl text-slate-900">
              {
                copy.frequentlyAskedQuestions
              }
            </CardTitle>

            <CardDescription>
              {
                copy.faqDescription
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="divide-y divide-slate-100 p-0">
            {filteredQuestions.length >
            0 ? (
              filteredQuestions.map(
                (
                  item,
                  index
                ) => {
                  const isOpen =
                    openQuestion ===
                    index

                  return (
                    <div
                      key={
                        item.question
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenQuestion(
                            isOpen
                              ? null
                              : index
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-900">
                          {
                            item.question
                          }
                        </span>

                        <ChevronDown
                          className={`size-5 shrink-0 text-slate-500 transition ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5">
                          <p className="text-sm leading-6 text-slate-600">
                            {
                              item.answer
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )
                }
              )
            ) : (
              <div className="px-6 py-10 text-center">
                <Search className="mx-auto size-8 text-slate-400" />

                <p className="mt-3 font-medium text-slate-800">
                  {
                    copy.noMatchingQuestions
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    copy.noMatchingQuestionsDescription
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                {
                  copy.contactSupport
                }
              </CardTitle>

              <CardDescription>
                {
                  copy.contactSupportDescription
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form
                onSubmit={
                  submitSupportRequest
                }
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="support-subject">
                    {
                      copy.subject
                    }
                  </Label>

                  <Input
                    id="support-subject"
                    value={
                      subject
                    }
                    onChange={(
                      event
                    ) =>
                      setSubject(
                        event.target.value
                      )
                    }
                    placeholder={
                      copy.subjectPlaceholder
                    }
                    className="h-11 border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-message">
                    {
                      copy.message
                    }
                  </Label>

                  <Textarea
                    id="support-message"
                    value={
                      supportMessage
                    }
                    onChange={(
                      event:
                        React.ChangeEvent<HTMLTextAreaElement>
                    ) =>
                      setSupportMessage(
                        event.target.value
                      )
                    }
                    placeholder={
                      copy.messagePlaceholder
                    }
                    className="min-h-32 resize-none border-slate-300"
                  />
                </div>

                {feedback && (
                  <p className="text-sm leading-6 text-slate-600">
                    {
                      feedback
                    }
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#512978] text-white hover:bg-[#40205f]"
                >
                  <Send className="size-4" />

                  {
                    copy.sendRequest
                  }
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">
                {
                  copy.contactInformation
                }
              </CardTitle>

              <CardDescription>
                {
                  copy.contactInformationDescription
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ContactMethod
                icon={
                  Mail
                }
                title={
                  copy.supportEmail
                }
                description="support@cairoroute.com"
              />

              <ContactMethod
                icon={
                  Phone
                }
                title={
                  copy.supportHotline
                }
                description="+20 2 2345 6789"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function HelpCategory({
  icon: Icon,
  title,
  description,
}: {
  icon:
    React.ElementType

  title:
    string

  description:
    string
}) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
          <Icon className="size-5" />
        </div>

        <h2 className="mt-4 font-semibold text-slate-900">
          {
            title
          }
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {
            description
          }
        </p>
      </CardContent>
    </Card>
  )
}

function ContactMethod({
  icon: Icon,
  title,
  description,
}: {
  icon:
    React.ElementType

  title:
    string

  description:
    string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
        <Icon className="size-4" />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-900">
          {
            title
          }
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {
            description
          }
        </p>
      </div>
    </div>
  )
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