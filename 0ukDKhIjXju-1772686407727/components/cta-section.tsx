import { ArrowUpRight, ArrowRight, Play } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
            <Play className="w-4 h-4 text-black" />
            <span className="text-xs text-black uppercase tracking-widest">Get started</span>
          </div>
          <h2 className="font-sans text-5xl font-normal leading-tight max-w-4xl mx-auto">
            Open your account today and meet the future of banking
          </h2>
        </div>

        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-4xl">
            {/* Gradient overlay - black to transparent from bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

            {/* iPad hand image */}
            <img
              src="/images/ipad-hand.png"
              alt="Hands holding iPad showing banking dashboard"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Bottom stats and CTA */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex gap-12">
            <div>
              <p className="text-4xl font-light text-foreground">10+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Customers</p>
            </div>
            <div>
              <p className="text-4xl font-light text-foreground">250B+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Capital managed</p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-sm max-w-sm text-center md:text-right text-zinc-200">
              Join us to experience innovative banking solutions designed for your modern lifestyle, offering security,
              convenience, and excellent customer service.
            </p>
            
          </div>
        </div>
      </div>
    </section>
  )
}
