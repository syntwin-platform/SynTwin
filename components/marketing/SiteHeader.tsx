"use client";

import Link from "next/link";
import { ArrowRight, LogOut, LayoutDashboard } from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { useSession } from "@/hooks/useSession";
import { clearSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function SiteHeader() {
    const session = useSession();
    const router = useRouter();

    const handleLogout = () => {
        clearSession();
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <span className="sm:hidden"><BrandMark compact /></span>
                <span className="hidden sm:inline"><BrandMark /></span>
                <nav aria-label="Điều hướng chính" className="hidden items-center gap-7 lg:flex">
                    <Link href="#nang-luc" className="text-sm text-steel hover:text-ink">Năng lực</Link>
                    <Link href="#van-hanh" className="text-sm text-steel hover:text-ink">Cách vận hành</Link>
                    <Link href="#bao-mat" className="text-sm text-steel hover:text-ink">Quyền truy cập</Link>
                    <Link href="/pricing" className="text-sm text-steel hover:text-ink">Bảng giá</Link>
                </nav>
                <div className="flex items-center gap-1 sm:gap-2">
                    {session ? (
                        <>
                            <Link href="/dashboard" className="hidden min-h-11 items-center gap-2 px-3 text-sm font-medium text-steel hover:text-brand sm:inline-flex">
                                <LayoutDashboard className="size-4" aria-hidden="true" />
                                Bảng điều khiển
                            </Link>
                            <button onClick={handleLogout} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-canvas px-3 text-sm font-medium text-steel border border-line hover:text-ink sm:px-4">
                                Đăng xuất <LogOut className="size-4" aria-hidden="true" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hidden min-h-11 items-center px-3 text-sm font-medium text-steel hover:text-brand sm:inline-flex">Đăng nhập</Link>
                            <Link href="/register" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-hover sm:px-4">
                                Bắt đầu <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
