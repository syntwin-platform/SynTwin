import { CreditCard, Wallet, PiggyBank, LineChart, Shield, Smartphone, Layers } from "lucide-react"

const services = [
  {
    icon: CreditCard,
    title: "Premium Card",
    description: "A fee-free card with cashback on all your purchases and exclusive benefits.",
  },
  {
    icon: Wallet,
    title: "Multi-Currency Accounts",
    description: "Manage multiple currencies without hidden exchange fees. Perfect for travelers.",
  },
  {
    icon: PiggyBank,
    title: "Automatic Savings",
    description: "Round up your purchases and save automatically without thinking about it.",
  },
  {
    icon: LineChart,
    title: "Simplified Investing",
    description: "Invest in stocks and ETFs from just $1 with intuitive tools.",
  },
  {
    icon: Shield,
    title: "Maximum Security",
    description: "Advanced protection with biometric authentication and real-time alerts.",
  },
  {
    icon: Smartphone,
    title: "Intuitive Mobile App",
    description: "Manage everything from your smartphone with a modern and fluid interface.",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full mb-6 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2]">
            <Layers className="w-4 h-4 text-black" />
            <span className="text-xs text-black uppercase tracking-widest">Services</span>
          </div>
          <h2 className="font-sans text-5xl font-normal mb-6 text-balance">Discover our range of banking services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore our banking services, from personal accounts to business solutions, all designed for your comfort
            and financial growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="group relative rounded-3xl transition-all duration-300">
              {/* Gradient border wrapper - only visible on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#ADA996] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Card content */}
              <div className="relative bg-card p-8 rounded-3xl h-full border border-border group-hover:border-transparent transition-all duration-300 m-[1px]">
                <div className="w-12 h-12 border border-border rounded-xl flex items-center justify-center mb-6 group-hover:border-foreground/30 transition-colors">
                  <service.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
