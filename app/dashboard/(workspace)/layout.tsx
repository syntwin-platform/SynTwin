import { CompanyProvider } from "@/lib/company-context";

export default function CustomerWorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CompanyProvider>{children}</CompanyProvider>;
}
