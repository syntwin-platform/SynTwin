"use client";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import Link from "next/link";

export function DemoMutationButton() {
    const [showNotice, setShowNotice] = useState(false);
    return (
        <div>
            <button type="button" onClick={() => setShowNotice(true)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-semibold text-steel">
                <LockKeyhole className="size-4" /> Thêm robot
            </button>
            {showNotice && <FeedbackBanner className="mt-3" tone="warning">Tính năng này chỉ có trong không gian làm việc trả phí. <Link href="/pricing" className="font-semibold underline">Xem gói Basic và Premium</Link>.</FeedbackBanner>}
        </div>
    );
}
