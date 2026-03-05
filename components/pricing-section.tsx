import { Check, ArrowUpRight, ArrowRight, Tag } from "lucide-react"

const plans = [
  {
    name: "Essential",
    price: "$0",
    period: "/mo",
    description: "Perfect to get started with Finova",
    features: [
      "Current account with routing number",
      "Free virtual card",
      "Unlimited transfers",
      "Complete mobile app",
      "Chat support",
    ],
    cta: "Open account",
    popular: false,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    description: "For those who want more benefits",
    features: [
      "Everything in Essential",
      "Premium metal card",
      "2% cashback on purchases",
      "Travel insurance included",
      "Unlimited free withdrawals",
      "Priority 24/7 support",
    ],
    cta: "Choose Premium",
    popular: true,
  },
  {
    name: "Business",
    price: "$29.99",
    period: "/mo",
    description: "Complete solution for professionals",
    features: [
      "Everything in Premium",
      "Multi-user (5 cards)",
      "Accounting tools",
      "API and integrations",
      "Dedicated account manager",
      "Customizable limits",
    ],
    cta: "Contact sales",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
            <Tag className="w-4 h-4 text-black" />
            <span className="text-xs text-black uppercase tracking-widest">Pricing</span>
          </div>
          <h2 className="font-sans text-5xl font-normal mb-6 text-balance">Choose the plan that fits you</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transparent pricing with no hidden fees. Change plans or cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div key={index} className="relative group">
              {/* Halo effect on hover - positioned outside card */}
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-b from-white/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div
                className={`relative bg-card border p-8 flex flex-col rounded-3xl ${
                  plan.popular ? "border-foreground/50" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-light text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 border border-border rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-foreground" />
                      </div>
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`relative flex items-center justify-center gap-0 rounded-full transition-all duration-300 w-full py-2 overflow-hidden ${
                    plan.popular ? "bg-foreground text-background hover:bg-foreground/90" : "border border-border"
                  }`}
                >
                  {!plan.popular && (
                    <span className="absolute inset-0 bg-foreground rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300" />
                  )}
                  <span
                    className={`text-sm pr-3 relative z-10 transition-colors duration-300 ${plan.popular ? "text-background" : "text-foreground group-hover:text-background"}`}
                  >
                    {plan.cta}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                      plan.popular ? "bg-background" : ""
                    }`}
                  >
                    {plan.popular ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-foreground" />
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-foreground group-hover:opacity-0 absolute transition-opacity duration-300" />
                        <ArrowUpRight className="w-3.5 h-3.5 text-foreground group-hover:text-background opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
