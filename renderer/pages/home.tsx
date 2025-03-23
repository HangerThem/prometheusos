import React, { useEffect, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import Image from "next/image"
import Logo from "../components/Logo"

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
    <div className="flex flex-row items-center justify-center min-h-screen py-2 gap-4">
      <Head>
        <title>PrometheusOS</title>
      </Head>

      <div className="flex flex-col items-center justify-center h-64">
        <Logo percent={percent} />
      </div>
    </div>
  )
}
