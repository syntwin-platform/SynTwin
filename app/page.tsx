import { AccessSecurity } from "@/components/marketing/AccessSecurity";
import { Capabilities } from "@/components/marketing/Capabilities";
import { LandingFaq } from "@/components/marketing/LandingFaq";
import { LandingHero } from "@/components/marketing/LandingHero";
import { OperatingFlow } from "@/components/marketing/OperatingFlow";
import { PlanPreview } from "@/components/marketing/PlanPreview";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function LandingPage() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-canvas">
            <SiteHeader />
            <main>
                <LandingHero />
                <ProductPreview />
                <Capabilities />
                <OperatingFlow />
                <AccessSecurity />
                <PlanPreview />
                <LandingFaq />
            </main>
            <SiteFooter />
        </div>
    );
}
