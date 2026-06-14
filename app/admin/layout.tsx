import { AuthGuard } from "@/components/AuthGuard";

export const metadata = {
  title: "SynTwin - Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAdmin>
      {children}
    </AuthGuard>
  );
}