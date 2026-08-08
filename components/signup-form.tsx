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

export function SignupForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.")
      return
    }

    if (password.length < 8) {
      setMessage(
        "Password must contain at least 8 characters."
      )
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const supabase = createClient()

      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,

          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error(
          "Account creation failed."
        )
      }

      /*
       * Signup succeeded.
       * Always redirect the user to login.
       */
      router.push("/login")
      router.refresh()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
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
          Create an account
        </CardTitle>

        <CardDescription>
          Enter your details to start using CairoRoute.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">
                Full name
              </FieldLabel>

              <Input
                id="name"
                name="name"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value)
                  setMessage("")
                }}
                placeholder="Your full name"
                autoComplete="name"
                className="h-11"
                disabled={loading}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">
                Phone number
              </FieldLabel>

              <Input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value)
                  setMessage("")
                }}
                placeholder="01XXXXXXXXX"
                autoComplete="tel"
                className="h-11"
                disabled={loading}
                required
              />
            </Field>

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
                className="h-11"
                disabled={loading}
                required
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
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                className="h-11"
                disabled={loading}
                required
              />

              <FieldDescription>
                Use at least 8 characters.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm password
              </FieldLabel>

              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  )
                  setMessage("")
                }}
                placeholder="Enter the password again"
                autoComplete="new-password"
                minLength={8}
                className="h-11"
                disabled={loading}
                required
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
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </Field>

            <FieldDescription className="text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-violet-700 hover:underline"
              >
                Log in
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}