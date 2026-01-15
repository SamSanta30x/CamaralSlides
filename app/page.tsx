'use client'

import { useAuth } from "@/lib/auth/AuthContext"
import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Brands from "@/components/Brands"
import DashboardContent from "@/components/DashboardContent"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Loading...</p>
      </div>
    )
  }

  // If user is authenticated, show dashboard
  if (user) {
    return <DashboardContent />
  }

  // If not authenticated, show landing
  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(124deg, rgba(255, 255, 255, 0.50) 29.93%, rgba(247, 244, 237, 0.50) 70.67%), linear-gradient(245deg, rgba(255, 255, 255, 0.50) 33.91%, rgba(247, 244, 237, 0.50) 83.92%), #FFF'
      }}
    >
      <Header />
      <main className="flex w-full flex-col items-center justify-center">
        <Hero />
        <Brands />
      </main>
    </div>
  )
}
