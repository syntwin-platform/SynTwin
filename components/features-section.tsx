"use client"

import { Check, Sparkles } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const features = [
  "Account opening in 5 minutes",
  "US routing number included",
  "Free instant transfers",
  "24/7 customer support",
  "No hidden fees",
  "Automatic categorization",
]

const allTransactions = [
  { name: "Walmart", amount: "-$45.80", category: "Groceries" },
  { name: "Spotify", amount: "-$9.99", category: "Subscription" },
  { name: "Transfer received", amount: "+$2,500.00", category: "Salary" },
  { name: "Amazon", amount: "-$127.50", category: "Shopping" },
  { name: "Starbucks", amount: "-$5.40", category: "Coffee" },
  { name: "Netflix", amount: "-$15.99", category: "Subscription" },
  { name: "Gas Station", amount: "-$52.00", category: "Transportation" },
  { name: "Freelance payment", amount: "+$1,200.00", category: "Income" },
  { name: "Restaurant", amount: "-$68.30", category: "Dining" },
  { name: "Apple", amount: "-$99.00", category: "Technology" },
]

export function FeaturesSection() {
  const [balance, setBalance] = useState(12458.32)
  const scrollRef = useRef<HTMLDivElement>(null)
 const animationRef = useRef<number | null>(null)
  const scrollPosition = useRef(0)
  const lastUpdateTime = useRef(0)

  const tripleTransactions = [...allTransactions, ...allTransactions, ...allTransactions]

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!scrollRef.current) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      if (!lastUpdateTime.current) lastUpdateTime.current = timestamp
      const deltaTime = timestamp - lastUpdateTime.current
      lastUpdateTime.current = timestamp

      scrollPosition.current += (deltaTime / 1000) * 35

      const singleSetHeight = scrollRef.current.scrollHeight / 3

      if (scrollPosition.current >= singleSetHeight) {
        scrollPosition.current = 0

        const randomTransaction = allTransactions[Math.floor(Math.random() * allTransactions.length)]
        const amount = Number.parseFloat(randomTransaction.amount.replace(/[,$]/g, ""))
        setBalance((prev) => prev + amount)
      }

      scrollRef.current.style.transform = `translateY(-${scrollPosition.current}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-card border border-border p-6 shadow-xl rounded-3xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Available balance</p>
                    <p className="text-3xl font-light text-foreground transition-all duration-500">
                      ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-10 h-10 border border-border rounded-full flex items-center justify-center">
                    <span className="text-foreground text-sm font-medium">F</span>
                  </div>
                </div>

                <div className="relative h-[240px] overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />

                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider relative z-20">
                      Recent transactions
                    </p>

                    <div className="relative">
                      <div ref={scrollRef} className="space-y-0 will-change-transform">
                        {tripleTransactions.map((tx, i) => (
                          <div
                            key={`${tx.name}-${i}`}
                            className="flex items-center justify-between py-3 border-b border-border"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 bg-card border border-border rounded-lg flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">{tx.name[0]}</span>
                              </div>
                              <div>
                                <p className="text-sm text-foreground">{tx.name}</p>
                                <p className="text-xs text-muted-foreground">{tx.category}</p>
                              </div>
                            </div>
                            <p
                              className={`text-sm ${tx.amount.startsWith("+") ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {tx.amount}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-black" />
                <span className="text-xs text-black uppercase tracking-widest">Features</span>
              </div>
              <h2 className="font-sans text-5xl font-normal mb-6 text-balance">
                Designed for individuals and businesses
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Open your account today and meet the future of banking. Innovative solutions designed for your modern
                lifestyle, offering security, convenience, and excellent customer service.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 border border-border rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-foreground" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
