"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import Image from "next/image"

import {
  Camera,
  CheckCircle2,
  Mail,
  Phone,
  Save,
  Shield,
  UserRound,
  XCircle,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

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

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  emergency_name: string | null
  emergency_phone: string | null
  created_at: string
}

type ProfileResponse = {
  profile: Profile | null
  email: string | null
  message?: string
  error?: string
}

export default function ProfilePage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null)

  const [fullName, setFullName] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [phoneNumber, setPhoneNumber] =
    useState("")

  const [emergencyName, setEmergencyName] =
    useState("")

  const [emergencyPhone, setEmergencyPhone] =
    useState("")

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [
    uploadingAvatar,
    setUploadingAvatar,
  ] =
    useState(false)

  const [message, setMessage] =
    useState("")

  const [isError, setIsError] =
    useState(false)

  /*
   * ---------------------------------------
   * LOAD PROFILE
   * ---------------------------------------
   */

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setMessage("")
        setIsError(false)

        const supabase =
          createClient()

        const {
          data: { session },
          error: sessionError,
        } =
          await supabase.auth.getSession()

        if (
          sessionError ||
          !session
        ) {
          throw new Error(
            "Your login session could not be found. Please log in again."
          )
        }

        const response =
          await fetch(
            "/api/profile",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              cache: "no-store",
            }
          )

        const result =
          (await response.json()) as ProfileResponse

        if (!response.ok) {
          throw new Error(
            result.error
              ? `${result.message} ${result.error}`
              : result.message ||
                  "Failed to load profile."
          )
        }

        setEmail(
          result.email ?? ""
        )

        if (
          result.profile
        ) {
          setFullName(
            result.profile
              .full_name ?? ""
          )

          setPhoneNumber(
            result.profile
              .phone ?? ""
          )

          setEmergencyName(
            result.profile
              .emergency_name ?? ""
          )

          setEmergencyPhone(
            result.profile
              .emergency_phone ?? ""
          )

          setAvatarUrl(
            result.profile
              .avatar_url
          )
        }
      } catch (error) {
        setIsError(true)

        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load profile."
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  /*
   * ---------------------------------------
   * SAVE / UPDATE PROFILE
   * ---------------------------------------
   */

  async function saveProfile(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    try {
      setSaving(true)
      setMessage("")
      setIsError(false)

      const supabase =
        createClient()

      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth.getSession()

      if (
        sessionError ||
        !session
      ) {
        throw new Error(
          "Your login session could not be found. Please log in again."
        )
      }

      const response =
        await fetch(
          "/api/profile",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              fullName:
                fullName.trim(),

              phone:
                phoneNumber.trim(),

              emergencyName:
                emergencyName.trim(),

              emergencyPhone:
                emergencyPhone.trim(),

              avatarUrl,
            }),
          }
        )

      const result =
        (await response.json()) as ProfileResponse

      if (!response.ok) {
        throw new Error(
          result.error
            ? `${result.message} ${result.error}`
            : result.message ||
                "Failed to save profile."
        )
      }

      if (
        result.profile
      ) {
        setFullName(
          result.profile
            .full_name ?? ""
        )

        setPhoneNumber(
          result.profile
            .phone ?? ""
        )

        setEmergencyName(
          result.profile
            .emergency_name ?? ""
        )

        setEmergencyPhone(
          result.profile
            .emergency_phone ?? ""
        )

        setAvatarUrl(
          result.profile
            .avatar_url
        )
      }

      setMessage(
        "Profile saved successfully."
      )

      setIsError(false)
    } catch (error) {
      setIsError(true)

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save profile."
      )
    } finally {
      setSaving(false)
    }
  }

  /*
   * ---------------------------------------
   * UPLOAD PROFILE PICTURE
   * ---------------------------------------
   */

  async function uploadProfilePicture(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      setUploadingAvatar(true)
      setMessage("")
      setIsError(false)

      if (
        !file.type.startsWith("image/")
      ) {
        throw new Error(
          "Please select an image file."
        )
      }

      const maxFileSize =
        5 * 1024 * 1024

      if (
        file.size >
        maxFileSize
      ) {
        throw new Error(
          "Profile picture must be smaller than 5 MB."
        )
      }

      const supabase =
        createClient()

      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth.getSession()

      if (
        sessionError ||
        !session
      ) {
        throw new Error(
          "Your login session could not be found. Please log in again."
        )
      }

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg"

      const filePath =
        `${session.user.id}/avatar-${Date.now()}.${extension}`

      /*
       * Upload actual image to Supabase Storage.
       */
      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("avatars")
          .upload(
            filePath,
            file,
            {
              upsert: true,

              contentType:
                file.type,
            }
          )

      if (uploadError) {
        throw new Error(
          uploadError.message
        )
      }

      /*
       * Get public URL.
       */
      const {
        data:
          publicUrlData,
      } =
        supabase.storage
          .from("avatars")
          .getPublicUrl(
            filePath
          )

      const newAvatarUrl =
        publicUrlData.publicUrl

      if (!newAvatarUrl) {
        throw new Error(
          "Unable to get profile picture URL."
        )
      }

      /*
       * Save avatar URL in public.profiles
       * through our API route.
       */
      const response =
        await fetch(
          "/api/profile",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              fullName:
                fullName.trim(),

              phone:
                phoneNumber.trim(),

              emergencyName:
                emergencyName.trim(),

              emergencyPhone:
                emergencyPhone.trim(),

              avatarUrl:
                newAvatarUrl,
            }),
          }
        )

      const result =
        (await response.json()) as ProfileResponse

      if (!response.ok) {
        throw new Error(
          result.error
            ? `${result.message} ${result.error}`
            : result.message ||
                "Failed to save profile picture."
        )
      }

      setAvatarUrl(
        newAvatarUrl
      )

      setMessage(
        "Profile picture updated successfully."
      )

      setIsError(false)
    } catch (error) {
      setIsError(true)

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture."
      )
    } finally {
      setUploadingAvatar(false)

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          ""
      }
    }
  }

  /*
   * ---------------------------------------
   * LOADING
   * ---------------------------------------
   */

  if (loading) {
    return (
      <div className="mx-auto flex min-h-80 w-full max-w-6xl items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading your profile...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section>
        <p className="text-sm font-medium text-[#512978]">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Profile
        </h1>

        <p className="mt-2 text-slate-600">
          Manage your personal and emergency contact information.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* PROFILE CARD */}

        <Card className="h-fit rounded-xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="relative">
              {avatarUrl ? (
                <Image
                  src={
                    avatarUrl
                  }
                  alt="Profile"
                  width={112}
                  height={112}
                  unoptimized
                  className="size-28 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-28 items-center justify-center rounded-full bg-[#512978] text-white">
                  <UserRound className="size-12" />
                </div>
              )}

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/*"
                className="hidden"
                onChange={
                  uploadProfilePicture
                }
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploadingAvatar
                }
                className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Change profile picture"
                title="Change profile picture"
              >
                <Camera className="size-4" />
              </button>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              {fullName ||
                "Passenger profile"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {email ||
                "CairoRoute passenger"}
            </p>

            {uploadingAvatar && (
              <p className="mt-3 text-xs font-medium text-[#512978]">
                Uploading profile picture...
              </p>
            )}

            <div className="mt-6 w-full rounded-lg border border-purple-100 bg-purple-50 p-4 text-left">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 size-5 shrink-0 text-[#512978]" />

                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Private information
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Your contact information is only used for bookings and trip communication.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PROFILE FORM */}

        <form
          onSubmit={
            saveProfile
          }
          className="space-y-6"
        >
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                Personal information
              </CardTitle>

              <CardDescription>
                Update the information associated with your CairoRoute account.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
              {/* FULL NAME */}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="full-name">
                  Full name
                </Label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="full-name"
                    value={
                      fullName
                    }
                    onChange={(
                      event
                    ) => {
                      setFullName(
                        event.target.value
                      )

                      setMessage(
                        ""
                      )
                    }}
                    placeholder="Enter your full name"
                    disabled={
                      saving ||
                      uploadingAvatar
                    }
                    className="h-11 border-slate-300 pl-10"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email address
                </Label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="email"
                    type="email"
                    value={
                      email
                    }
                    readOnly
                    disabled
                    className="h-11 border-slate-300 bg-slate-50 pl-10 text-slate-500"
                  />
                </div>

                <p className="text-xs text-slate-500">
                  Email is managed by your login account.
                </p>
              </div>

              {/* PHONE */}

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone number
                </Label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="phone"
                    type="tel"
                    value={
                      phoneNumber
                    }
                    onChange={(
                      event
                    ) => {
                      setPhoneNumber(
                        event.target.value
                      )

                      setMessage(
                        ""
                      )
                    }}
                    placeholder="+20 1XX XXX XXXX"
                    disabled={
                      saving ||
                      uploadingAvatar
                    }
                    className="h-11 border-slate-300 pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EMERGENCY CONTACT */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                Emergency contact
              </CardTitle>

              <CardDescription>
                This person may be contacted if an urgent issue occurs during a trip.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency-name">
                  Contact name
                </Label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="emergency-name"
                    value={
                      emergencyName
                    }
                    onChange={(
                      event
                    ) => {
                      setEmergencyName(
                        event.target.value
                      )

                      setMessage(
                        ""
                      )
                    }}
                    placeholder="Emergency contact name"
                    disabled={
                      saving ||
                      uploadingAvatar
                    }
                    className="h-11 border-slate-300 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-phone">
                  Emergency phone number
                </Label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="emergency-phone"
                    type="tel"
                    value={
                      emergencyPhone
                    }
                    onChange={(
                      event
                    ) => {
                      setEmergencyPhone(
                        event.target.value
                      )

                      setMessage(
                        ""
                      )
                    }}
                    placeholder="+20 1XX XXX XXXX"
                    disabled={
                      saving ||
                      uploadingAvatar
                    }
                    className="h-11 border-slate-300 pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SAVE */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {message && (
                <p
                  className={`flex items-center gap-2 text-sm ${
                    isError
                      ? "text-red-700"
                      : "text-emerald-700"
                  }`}
                >
                  {isError ? (
                    <XCircle className="size-4" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}

                  {message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                saving ||
                uploadingAvatar
              }
              className="h-11 bg-[#512978] px-6 text-white hover:bg-[#40205f]"
            >
              <Save className="size-4" />

              {saving
                ? "Saving..."
                : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}