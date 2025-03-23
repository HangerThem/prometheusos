import React, { useEffect, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"

export default function HomePage() {
  const [percent, setPercent] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => (prev < 100 ? prev + 1 : 100))
    }, 20)
    setTimeout(() => {
      clearInterval(interval)
    }, 2000)
    setTimeout(() => {
      router.push("/dashboard")
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>PrometheusOS</title>
      </Head>

      <div className="fixed inset-0 flex items-center justify-center relative">
        <div className="text-gray-600 text-7xl font-bold">PrometheusOS</div>
        <div
          className="text-white text-7xl font-bold absolute transition-all duration-[2s] ease-in-out bg-gradient-to-r from-primary to-transparent"
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
        >
          PrometheusOS
        </div>
      </div>
    </div>
  )
}
