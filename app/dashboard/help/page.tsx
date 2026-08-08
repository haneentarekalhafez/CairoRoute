"use client"

import { useState } from "react"
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

const frequentlyAskedQuestions = [
  {
    question: "How does CairoRoute suggest the nearest pickup point?",
    answer:
      "CairoRoute will compare your current location with the available pickup points for routes going toward your destination, then suggest the closest suitable option.",
  },
  {
    question: "Can I choose a different pickup point?",
    answer:
      "Yes. After searching, you will be able to compare the available pickup points and select another suitable option before confirming your booking.",
  },
  {
    question: "Where can I find my confirmed trips?",
    answer:
      "Your upcoming and previous trips will appear inside the My Bookings page.",
  },
  {
    question: "Can I cancel or change a booking?",
    answer:
      "Cancellation and rescheduling controls will appear inside the booking details page. The available options will depend on the selected trip.",
  },
  {
    question: "What information will be shown about the bus?",
    answer:
      "The booking flow will show the bus type, color, plate number, departure time, pickup point, destination, and available seats.",
  },
]

export default function HelpPage() {
  const [searchValue, setSearchValue] = useState("")
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  const [subject, setSubject] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [feedback, setFeedback] = useState("")

  const filteredQuestions = frequentlyAskedQuestions.filter((item) => {
    const searchableText = `${item.question} ${item.answer}`.toLowerCase()

    return searchableText.includes(searchValue.toLowerCase())
  })

  function submitSupportRequest(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!subject.trim() || !supportMessage.trim()) {
      setFeedback("Please enter a subject and describe your issue.")
      return
    }

    setFeedback(
      "Your support request was submitted in the frontend prototype."
    )

    setSubject("")
    setSupportMessage("")
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl bg-[#241536] px-6 py-8 text-white md:px-8">
        <div className="max-w-2xl">
          <div className="flex size-11 items-center justify-center rounded-lg bg-white/10">
            <CircleHelp className="size-6" />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            Help Centre
          </h1>

          <p className="mt-2 text-purple-100/80">
            Find answers about routes, pickup points, bookings, and account
            support.
          </p>

          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search help articles"
              className="h-12 border-white bg-white pl-11 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <HelpCategory
          icon={MapPin}
          title="Pickup points"
          description="Location detection and nearby pickup suggestions"
        />

        <HelpCategory
          icon={BusFront}
          title="Routes and buses"
          description="Trip routes, timings, and vehicle information"
        />

        <HelpCategory
          icon={TicketCheck}
          title="Bookings"
          description="Booking confirmation, changes, and trip history"
        />

        <HelpCategory
          icon={ShieldAlert}
          title="Safety"
          description="Trip safety information and urgent assistance"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl text-slate-900">
              Frequently asked questions
            </CardTitle>

            <CardDescription>
              Common questions about using CairoRoute.
            </CardDescription>
          </CardHeader>

          <CardContent className="divide-y divide-slate-100 p-0">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((item, index) => {
                const isOpen = openQuestion === index

                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenQuestion(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">
                        {item.question}
                      </span>

                      <ChevronDown
                        className={`size-5 shrink-0 text-slate-500 transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5">
                        <p className="text-sm leading-6 text-slate-600">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-10 text-center">
                <Search className="mx-auto size-8 text-slate-400" />

                <p className="mt-3 font-medium text-slate-800">
                  No matching questions
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try another search phrase or contact support.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                Contact support
              </CardTitle>

              <CardDescription>
                Send a question or report a problem.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form
                onSubmit={submitSupportRequest}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="support-subject">
                    Subject
                  </Label>

                  <Input
                    id="support-subject"
                    value={subject}
                    onChange={(event) =>
                      setSubject(event.target.value)
                    }
                    placeholder="What do you need help with?"
                    className="h-11 border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-message">
                    Message
                  </Label>

                  <Textarea
                    id="support-message"
                    value={supportMessage}
                    onChange={(
                      event: React.ChangeEvent<HTMLTextAreaElement>
                    ) => setSupportMessage(event.target.value)}
                    placeholder="Describe your question or issue"
                    className="min-h-32 resize-none border-slate-300"
                  />
                </div>

                {feedback && (
                  <p className="text-sm leading-6 text-slate-600">
                    {feedback}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#512978] text-white hover:bg-[#40205f]"
                >
                  <Send className="size-4" />
                  Send request
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">
                Contact information
              </CardTitle>

              <CardDescription>
                Reach the CairoRoute support team using the details below.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ContactMethod
                icon={Mail}
                title="Support email"
                description="support@cairoroute.com"
              />

              <ContactMethod
                icon={Phone}
                title="Support hotline"
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
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
          <Icon className="size-5" />
        </div>

        <h2 className="mt-4 font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
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
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
        <Icon className="size-4" />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}