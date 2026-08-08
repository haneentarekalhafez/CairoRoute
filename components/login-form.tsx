"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { FormEvent } from "react"

import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"

export function LoginForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setMessage("")

    try {
      const supabase = createClient()

      /*
       * Log the user in.
       */
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (error) {
        throw error
      }

      if (!data.user || !data.session) {
        throw new Error(
          "Login succeeded but no session was created."
        )
      }

      /*
       * IMPORTANT:
       * Verify that Supabase actually saved
       * the browser session before leaving login.
       */
      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!sessionData.session) {
        throw new Error(
          "Login session could not be saved."
        )
      }

      /*
       * We now KNOW the browser has a session.
       */
      router.replace("/dashboard")
      router.refresh()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to log in."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      className="border-slate-200 bg-white shadow-sm"
      {...props}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Welcome back
        </CardTitle>

        <CardDescription>
          Log in to continue to CairoRoute.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">
                Email address
              </FieldLabel>

              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setMessage("")
                }}
                placeholder="name@example.com"
                autoComplete="email"
                disabled={loading}
                required
                className="h-11"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">
                Password
              </FieldLabel>

              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setMessage("")
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
                className="h-11"
              />
            </Field>

            {message && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {message}
              </p>
            )}

            <Field>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-violet-700 text-white hover:bg-violet-800"
              >
                {loading
                  ? "Logging in..."
                  : "Log in"}
              </Button>
            </Field>

            <FieldDescription className="text-center">
              Don&apos;t have an account?{" "}

              <Link
                href="/signup"
                className="font-medium text-violet-700 hover:underline"
              >
                Create account
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}