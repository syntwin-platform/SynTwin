import { AuthGuard } from "@/components/AuthGuard";
import { CompanyProvider } from "@/lib/company-context";

export const metadata = {
    title: "SynTwin - Factory Dashboard",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <CompanyProvider>
                {children}
            </CompanyProvider>
        </AuthGuard>
    );
}