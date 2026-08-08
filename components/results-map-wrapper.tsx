"use client"

import dynamic from "next/dynamic"

const ResultsMap = dynamic(
  () => import("@/components/results-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[430px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          Loading map...
        </p>
      </div>
    ),
  }
)

export default function ResultsMapWrapper() {
  return <ResultsMap />
}