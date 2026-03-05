"use client"

import { ArrowUpRight, ArrowRight, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"
import { AnimatedText } from "./animated-text"

function useCountUp(end: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return count + suffix
}

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const cashback = useCountUp(3, 2000, "%")
  const annualFees = useCountUp(0, 2000, "%")
  const customers = useCountUp(10, 2000, "M+")
  const satisfaction = useCountUp(99, 2000, "%")

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-8">
              <CreditCard className="w-4 h-4 text-black" />
              <span className="text-xs text-black uppercase tracking-widest">Credit Card</span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl font-normal leading-tight mb-6 lg:text-8xl w-full">
              <AnimatedText text="Upgrade your wallet with the next-gen card" delay={0.3} />
            </h1>
          </div>

          <p
            className={`max-w-2xl mx-auto leading-relaxed mb-10 transition-all duration-1000 delay-[800ms] text-base text-zinc-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Experience seamless payments, instant transfers, and smart financial tools designed to give you complete
            control over your money.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-12">
          <div className="relative">
            <div
              className={`relative w-[520px] md:w-[625px] lg:w-[780px] will-change-transform transition-all duration-[1500ms] ease-out delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[400px]"
              }`}
            >
              <img src="/images/card-hand.png" alt="Hand holding iPhone" className="w-full h-auto relative z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-6xl">
            <div
              className={`text-left transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-6xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
                {cashback}
              </p>
              <p className="text-base font-medium text-foreground mb-1">Cashback</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Earn 3% back on everyday purchases with this card that makes rewards simple.
              </p>
            </div>

            <div
              className={`text-left transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-6xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
                {annualFees}
              </p>
              <p className="text-base font-medium text-foreground mb-1">Annual fees</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Benefit from our transparent pricing with absolutely zero annual fees for this account.
              </p>
            </div>

            <div
              className={`text-left transition-all duration-1000 delay-[400ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-6xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
                {customers}
              </p>
              <p className="text-base font-medium text-foreground mb-1">Customers</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join over 10 million satisfied customers who trust our reliable banking service daily.
              </p>
            </div>

            <div
              className={`text-left transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-6xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
                {satisfaction}
              </p>
              <p className="text-base font-medium text-foreground mb-1">Satisfaction rate</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                99% satisfaction shows our strong and ongoing commitment to great service.
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex justify-center mt-16 transition-all duration-1000 delay-[600ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <button className="relative flex items-center gap-0 border border-border rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden">
            {/* Background that expands on hover */}
            <span className="absolute inset-0 bg-foreground rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 origin-right" />

            <span className="relative text-sm text-foreground group-hover:text-background pr-4 uppercase tracking-wide transition-colors duration-300">
              Open your account
            </span>
            <span className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-foreground group-hover:hidden" />
              <ArrowUpRight className="w-4 h-4 text-background hidden group-hover:block" />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
