import { Suspense } from "react";
import { AccessBoundary } from "@/components/auth/AccessBoundary";
import { AccessLoading } from "@/components/auth/AccessLoading";

export const metadata = {
  title: "SynTwin — Quản trị hệ thống",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AccessLoading />}>
      <AccessBoundary>{children}</AccessBoundary>
    </Suspense>
  );
}
