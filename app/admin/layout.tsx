import React from "react";

export const metadata = {
  title: "SynTwin — Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
