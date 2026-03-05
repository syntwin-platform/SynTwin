import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "How do I open a Finova account?",
    answer:
      "Opening a Finova account is simple and fast. Download our application, fill out the registration form, verify your identity with a valid ID, and your account will be active in minutes. No proof of address required.",
  },
  {
    question: "What are the Finova card fees?",
    answer:
      "Our Essential plan is completely free, including a virtual card and unlimited transfers. The Premium plan at $9.99/month includes a metal card with 2% cashback. No hidden fees, everything is transparent.",
  },
  {
    question: "Can I use my card abroad?",
    answer:
      "Your Finova card works in over 35 countries without hidden exchange fees. We apply the real interbank exchange rate. Withdrawals are free with the Premium plan.",
  },
  {
    question: "How does cashback work?",
    answer:
      "With the Premium plan, you get 2% cashback on all your card purchases, automatically credited to your account each month. No limit, no restrictive categories.",
  },
  {
    question: "Is my money safe?",
    answer:
      "Yes, totally. Finova is licensed by financial regulators and your deposits are guaranteed up to $250,000 by FDIC. We use bank-level encryption and biometric authentication.",
  },
  {
    question: "Can I have multiple accounts or sub-accounts?",
    answer:
      "Yes, you can create dedicated spaces (savings, travel, projects) directly in the application. Each space has its own routing number and can be shared with other Finova users.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-black" />
            <span className="text-xs text-black uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="font-sans text-5xl font-normal mb-6 text-balance">Frequently asked questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Finova. Can&apos;t find your answer? Contact our support.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-foreground/30"
            >
              <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
