import React from "react"
import type { AppProps } from "next/app"

import "../styles/globals.css"
import { PinsProvider } from "../context/usePins"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PinsProvider>
      <Component {...pageProps} />
    </PinsProvider>
  )
}

export default MyApp
