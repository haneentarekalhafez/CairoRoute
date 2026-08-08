"use client"

import { useEffect, useState } from "react"
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet"

import "leaflet/dist/leaflet.css"

type Location = {
  lat: number
  lng: number
}

type PickupPoint = {
  id: number
  name: string
  area: string
  latitude: number
  longitude: number
  is_active: boolean
}

export default function ResultsMap() {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([])
  const [userLocation, setUserLocation] = useState<Location | null>(null)

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [locationMessage, setLocationMessage] = useState(
    "Click the button to detect your location."
  )

  useEffect(() => {
    async function loadPickupPoints() {
      try {
        const response = await fetch("/api/pickup-points")

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load pickup points."
          )
        }

        setPickupPoints(
          result.filter(
            (pickupPoint: PickupPoint) => pickupPoint.is_active
          )
        )
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An unknown error occurred."
        )
      } finally {
        setLoading(false)
      }
    }

    loadPickupPoints()
  }, [])

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Your browser does not support location detection."
      )
      return
    }

    setLocationMessage("Detecting your location...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })

        setLocationMessage("Your location was detected.")
      },
      () => {
        setLocationMessage(
          "Location access was blocked. Allow location permission and try again."
        )
      }
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Pickup points map
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Showing {pickupPoints.length} active pickup points from the
            database.
          </p>
        </div>

        <button
          type="button"
          onClick={detectLocation}
          className="rounded-lg bg-[#512978] px-4 py-2 text-sm font-medium text-white hover:bg-[#40205f]"
        >
          Use my location
        </button>
      </div>

      {loading ? (
        <div className="flex h-[430px] items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading pickup points...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="flex h-[430px] items-center justify-center p-6 text-center">
          <div>
            <p className="font-medium text-red-700">
              Failed to load pickup points
            </p>

            <p className="mt-2 text-sm text-red-600">
              {errorMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[430px]">
          <MapContainer
            center={[30.0444, 31.2357]}
            zoom={10}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {pickupPoints.map((point) => (
              <CircleMarker
                key={point.id}
                center={[point.latitude, point.longitude]}
                radius={9}
                pathOptions={{
                  color: "#512978",
                  fillColor: "#512978",
                  fillOpacity: 1,
                }}
              >
                <Popup>
                  <div>
                    <strong>{point.name}</strong>
                    <br />
                    {point.area}
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {userLocation && (
              <CircleMarker
                center={[userLocation.lat, userLocation.lng]}
                radius={10}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                }}
              >
                <Popup>Your current location</Popup>
              </CircleMarker>
            )}
          </MapContainer>
        </div>
      )}

      <p className="border-t border-slate-100 p-4 text-sm text-slate-600">
        {locationMessage}
      </p>
    </section>
  )
}