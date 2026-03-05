"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "John Carter",
    role: "VP of Finance at Agency",
    content: "I have never encountered a better banking partner than Finova - they are exceptional!",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    name: "Sophie Moore",
    role: "VP of Marketing at Business",
    content: "Finova is the epitome of innovation, bringing the future of banking to the present.",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    name: "Matt Cannon",
    role: "VP of Product at Company",
    content: "Effortlessly manage accounts and track expenses with this outstanding banking app!",
    avatar: "/placeholder.svg?height=48&width=48",
  },
]

const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials]

export function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPaused || !scrollRef.current) return

    const scrollContainer = scrollRef.current
    let animationFrameId: number

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 1

        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 3) {
          scrollContainer.scrollLeft = 0
        }
      }
      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationFrameId)
  }, [isPaused])

  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-4">
              <MessageCircle className="w-4 h-4 text-black" />
              <span className="text-xs text-black uppercase tracking-widest">Testimonials</span>
            </div>
            <h2 className="font-sans text-5xl font-normal leading-tight">What they say about us</h2>
          </div>

          <div className="lg:w-2/3 relative">
            {/* Gradient overlay on the left side */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

            {/* Gradient overlay on the right */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              style={{ scrollBehavior: "auto" }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full sm:w-[400px] bg-card border border-border rounded-2xl p-8"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <p className="text-lg text-foreground leading-relaxed flex-1">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-foreground font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
