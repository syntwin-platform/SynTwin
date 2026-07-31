import { redirect } from "next/navigation";

// Kept for backwards-compatible links after paid-workspace admission.

export default function LegacyDashboardSettingsPage() {
  redirect("/dashboard/user");
}
