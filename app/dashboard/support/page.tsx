"use client"

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Bot,
  CircleHelp,
  LoaderCircle,
  MessageCircleMore,
  RotateCcw,
  Send,
  ShieldCheck,
  User,
} from "lucide-react"

import {
  useAppPreferences,
} from "@/components/app-preferences-provider"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

type BotResponse = {
  output?: string
  response?: string
  message?: string
  text?: string
  answer?: string
}

const supportCopy = {
  english: {
    title: "CairoRoute Support",
    subtitle: "Ask questions, report a problem, or submit a complaint.",
    safe: "Support assistant",
    newChat: "New chat",
    welcome:
      "Hi! I’m the CairoRoute support assistant. Tell me what happened or ask me anything about your trip, booking, payment, bus, or account.",
    placeholder: "Type your message...",
    send: "Send",
    thinking: "Thinking...",
    connectionError:
      "I couldn’t reach the support service. Please try again.",
    emptyMessage: "Write a message first.",
    quickTitle: "Quick questions",
    quick: [
      "I have a complaint about my trip",
      "I have a payment problem",
      "My booking is not showing",
      "I need help with my bus or pickup point",
    ],
    note:
      "For emergencies or immediate safety issues, contact the appropriate local emergency service.",
  },

  arabic: {
    title: "دعم CairoRoute",
    subtitle: "اسأل عن أي شيء، أبلغ عن مشكلة، أو قدم شكوى.",
    safe: "مساعد الدعم",
    newChat: "محادثة جديدة",
    welcome:
      "مرحبًا! أنا مساعد دعم CairoRoute. أخبرني بما حدث أو اسألني عن الرحلة أو الحجز أو الدفع أو الحافلة أو الحساب.",
    placeholder: "اكتب رسالتك...",
    send: "إرسال",
    thinking: "جارٍ التفكير...",
    connectionError:
      "تعذر الوصول إلى خدمة الدعم. حاول مرة أخرى.",
    emptyMessage: "اكتب رسالة أولًا.",
    quickTitle: "أسئلة سريعة",
    quick: [
      "لدي شكوى بخصوص رحلتي",
      "لدي مشكلة في الدفع",
      "حجزي لا يظهر",
      "أحتاج مساعدة بخصوص الحافلة أو نقطة الركوب",
    ],
    note:
      "في حالات الطوارئ أو مشكلات السلامة العاجلة، تواصل مع خدمة الطوارئ المحلية المناسبة.",
  },

  french: {
    title: "Support CairoRoute",
    subtitle:
      "Posez une question, signalez un problème ou envoyez une réclamation.",
    safe: "Assistant de support",
    newChat: "Nouvelle discussion",
    welcome:
      "Bonjour ! Je suis l’assistant de support CairoRoute. Expliquez-moi ce qui s’est passé ou posez une question sur votre trajet, réservation, paiement, bus ou compte.",
    placeholder: "Écrivez votre message...",
    send: "Envoyer",
    thinking: "Réflexion...",
    connectionError:
      "Impossible de joindre le service d’assistance. Réessayez.",
    emptyMessage: "Écrivez d’abord un message.",
    quickTitle: "Questions rapides",
    quick: [
      "J’ai une réclamation concernant mon trajet",
      "J’ai un problème de paiement",
      "Ma réservation n’apparaît pas",
      "J’ai besoin d’aide pour mon bus ou mon point de départ",
    ],
    note:
      "En cas d’urgence ou de problème de sécurité immédiat, contactez le service d’urgence local approprié.",
  },
} as const

function makeMessageId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") {
    return ""
  }

  const storageKey =
    "cairoroute-support-session"

  const existing =
    window.localStorage.getItem(
      storageKey
    )

  if (existing) {
    return existing
  }

  const created =
    crypto.randomUUID()

  window.localStorage.setItem(
    storageKey,
    created
  )

  return created
}

function extractBotText(
  value: unknown
): string {
  if (typeof value === "string") {
    return value
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text: string =
        extractBotText(item)

      if (text) {
        return text
      }
    }

    return ""
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const data =
      value as BotResponse &
        Record<string, unknown>

    const direct =
      data.output ??
      data.response ??
      data.message ??
      data.text ??
      data.answer

    if (typeof direct === "string") {
      return direct
    }

    for (
      const nested
      of Object.values(data)
    ) {
      const text: string =
        extractBotText(nested)

      if (text) {
        return text
      }
    }
  }

  return ""
}

export default function SupportPage() {
  const {
    language,
  } =
    useAppPreferences()

  const copy =
    supportCopy[
      language
    ]

  const [
    input,
    setInput,
  ] =
    useState("")

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState("")

  const [
    sessionId,
    setSessionId,
  ] =
    useState<string>(
      () =>
        getOrCreateSessionId()
    )

  const [
    messages,
    setMessages,
  ] =
    useState<ChatMessage[]>(
      () => [
        {
          id:
            makeMessageId(),
          role:
            "assistant",
          content:
            copy.welcome,
        },
      ]
    )

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    )

  useEffect(
    () => {
      messagesEndRef.current
        ?.scrollIntoView({
          behavior: "smooth",
        })
    },
    [
      messages,
      loading,
    ]
  )

  const direction =
    language === "arabic"
      ? "rtl"
      : "ltr"

  const webhookUrl =
    useMemo(
      () =>
        process.env
          .NEXT_PUBLIC_N8N_SUPPORT_WEBHOOK_URL ??
        "",
      []
    )

  async function sendMessage(
    content: string
  ) {
    const cleanMessage =
      content.trim()

    if (!cleanMessage) {
      setError(
        copy.emptyMessage
      )
      return
    }

    if (loading) {
      return
    }

    setError("")

    setMessages(
      (
        current
      ) => [
        ...current,
        {
          id:
            makeMessageId(),
          role:
            "user",
          content:
            cleanMessage,
        },
      ]
    )

    setInput("")
    setLoading(true)

    try {
      if (!webhookUrl) {
        throw new Error(
          "NEXT_PUBLIC_N8N_SUPPORT_WEBHOOK_URL is missing."
        )
      }

      const response =
        await fetch(
          webhookUrl,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                message:
                  cleanMessage,
                chatInput:
                  cleanMessage,
                sessionId,
                language,
                source:
                  "cairoroute-support",
              }),
          }
        )

      if (!response.ok) {
        throw new Error(
          `Support webhook returned ${response.status}.`
        )
      }

      const contentType =
        response.headers.get(
          "content-type"
        )

      let botText = ""

      if (
        contentType?.includes(
          "application/json"
        )
      ) {
        const result =
          (await response.json()) as unknown

        botText =
          extractBotText(
            result
          )
      } else {
        botText =
          await response.text()
      }

      if (!botText.trim()) {
        botText =
          copy.connectionError
      }

      setMessages(
        (
          current
        ) => [
          ...current,
          {
            id:
              makeMessageId(),
            role:
              "assistant",
            content:
              botText.trim(),
          },
        ]
      )
    } catch (
      requestError
    ) {
      console.error(
        requestError
      )

      setError(
        copy.connectionError
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    void sendMessage(input)
  }

  function handleKeyDown(
    event:
      KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault()
      void sendMessage(input)
    }
  }

  function handleNewChat() {
    const newSessionId =
      crypto.randomUUID()

    window.localStorage.setItem(
      "cairoroute-support-session",
      newSessionId
    )

    setSessionId(
      newSessionId
    )

    setMessages([
      {
        id:
          makeMessageId(),
        role:
          "assistant",
        content:
          copy.welcome,
      },
    ])

    setInput("")
    setError("")
  }

  return (
    <div
      dir={
        direction
      }
      className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-[#100b16] sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3a214f] dark:bg-[#17111f] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#512978]/10 dark:bg-[#512978]/25">
              <MessageCircleMore className="size-6 text-[#512978] dark:text-purple-300" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
                  {
                    copy.title
                  }
                </h1>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <ShieldCheck className="size-3.5" />
                  {
                    copy.safe
                  }
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-600 dark:text-purple-100/70">
                {
                  copy.subtitle
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleNewChat
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-[#3a214f] dark:bg-[#20152b] dark:text-purple-100 dark:hover:bg-[#2a1a39]"
          >
            <RotateCcw className="size-4" />
            {
              copy.newChat
            }
          </button>
        </div>

        <div className="grid min-h-[680px] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3a214f] dark:bg-[#17111f]">
            <div className="flex items-center gap-2">
              <CircleHelp className="size-5 text-[#512978] dark:text-purple-300" />

              <h2 className="font-semibold text-slate-950 dark:text-white">
                {
                  copy.quickTitle
                }
              </h2>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {copy.quick.map(
                (
                  item
                ) => (
                  <button
                    key={
                      item
                    }
                    type="button"
                    disabled={
                      loading
                    }
                    onClick={
                      () =>
                        void sendMessage(
                          item
                        )
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-start text-sm leading-5 text-slate-700 transition hover:border-[#512978]/30 hover:bg-[#512978]/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3a214f] dark:bg-[#20152b] dark:text-purple-100/90 dark:hover:bg-[#2a1a39]"
                  >
                    {
                      item
                    }
                  </button>
                )
              )}
            </div>

            <div className="mt-6 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              {
                copy.note
              }
            </div>
          </aside>

          <section className="flex min-h-[680px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#3a214f] dark:bg-[#17111f]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                {messages.map(
                  (
                    message
                  ) => {
                    const isUser =
                      message.role ===
                      "user"

                    return (
                      <div
                        key={
                          message.id
                        }
                        className={`flex items-start gap-3 ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#512978]/10 dark:bg-[#512978]/25">
                            <Bot className="size-4 text-[#512978] dark:text-purple-300" />
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                            isUser
                              ? "rounded-br-md bg-[#512978] text-white"
                              : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800 dark:border-[#3a214f] dark:bg-[#20152b] dark:text-purple-50"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {
                              message.content
                            }
                          </p>
                        </div>

                        {isUser && (
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-[#2a1a39]">
                            <User className="size-4 text-slate-700 dark:text-purple-100" />
                          </div>
                        )}
                      </div>
                    )
                  }
                )}

                {loading && (
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#512978]/10 dark:bg-[#512978]/25">
                      <Bot className="size-4 text-[#512978] dark:text-purple-300" />
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-[#3a214f] dark:bg-[#20152b] dark:text-purple-100/70">
                      <LoaderCircle className="size-4 animate-spin" />
                      {
                        copy.thinking
                      }
                    </div>
                  </div>
                )}

                <div
                  ref={
                    messagesEndRef
                  }
                />
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-4 dark:border-[#3a214f] dark:bg-[#17111f] sm:p-5">
              <div className="mx-auto w-full max-w-3xl">
                {error && (
                  <p className="mb-3 text-sm font-medium text-red-600 dark:text-red-300">
                    {
                      error
                    }
                  </p>
                )}

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="flex items-end gap-3"
                >
                  <textarea
                    value={
                      input
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setInput(
                          event.target.value
                        )
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                    rows={
                      1
                    }
                    placeholder={
                      copy.placeholder
                    }
                    className="max-h-40 min-h-12 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#512978] focus:ring-2 focus:ring-[#512978]/15 dark:border-[#49305f] dark:bg-[#20152b] dark:text-white dark:placeholder:text-purple-100/40"
                  />

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !input.trim()
                    }
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#512978] px-4 text-sm font-semibold text-white transition hover:bg-[#432163] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      )
                      : (
                        <Send className="size-4" />
                      )}

                    <span className="hidden sm:inline">
                      {
                        copy.send
                      }
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}