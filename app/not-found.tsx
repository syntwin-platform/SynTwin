"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[100dvh] w-screen flex-col items-center justify-center bg-[#F9FAFA] p-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="mb-2 text-6xl font-bold tracking-tight text-[#0F172A]">
        404
      </h1>
      <h2 className="mb-4 text-2xl font-semibold text-[#334155]">
        Sector Not Found
      </h2>
      <p className="mb-8 max-w-md text-[#64748B]">
        The digital twin sector you are looking for has been moved, deleted, or does not exist. Please check the URL or return to the main dashboard.
      </p>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-lg bg-[#0F172A] px-6 py-3 font-medium text-white transition-colors hover:bg-[#334155]"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
