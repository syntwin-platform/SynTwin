import type { Session } from "@/lib/auth";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminMobileNav } from "@/components/AdminMobileNav";
import { AdminSidebar } from "@/components/AdminSidebar";

export function AdminShell({
    session,
    children,
}: {
    session: Session;
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-canvas">
            <div className="hidden sm:block"><AdminSidebar /></div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <AdminHeader session={session} />
                {children}
                <AdminMobileNav />
            </div>
        </div>
    );
}
