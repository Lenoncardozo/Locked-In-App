"use client"

import { useState, useEffect } from "react"

// Replace with English month names
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function DigitalClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    return `${hours}:${minutes}:${seconds}`
  }

  // Replace the formatJapaneseDate function with formatEnglishDate
  const formatEnglishDate = (date: Date) => {
    const day = date.getDate()
    const month = date.getMonth() // Array is 0-indexed
    const year = date.getFullYear()

    return `${monthNames[month]} ${day}, ${year}`
  }

  return (
    <div className="relative text-6xl font-bold text-primary bg-transparent p-4 font-mono">
      <div className="flex flex-col items-center">
        <div>{formatTime(time)}</div>
        <div className="text-lg mt-2 text-primary/60">{formatEnglishDate(time)}</div>
      </div>
    </div>
  )
}

