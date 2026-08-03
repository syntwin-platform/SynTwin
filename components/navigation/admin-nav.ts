import {
    Bot,
    Building2,
    LayoutDashboard,
    Users,
} from "lucide-react";

export const adminNavItems = [
    {
        icon: LayoutDashboard,
        label: "Tổng quan",
        href: "/admin/dashboard",
    },
    {
        icon: Users,
        label: "Người dùng",
        href: "/admin/users",
    },
    {
        icon: Building2,
        label: "Công ty",
        href: "/admin/companies",
    },
    {
        icon: Bot,
        label: "Quản lý Robot",
        href: "/admin/robots",
    },
] as const;
