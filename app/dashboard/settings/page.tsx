import { redirect } from "next/navigation";

export default function LegacyDashboardSettingsPage() {
  redirect("/dashboard/user");
}
