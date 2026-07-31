import { BrandMark } from "@/components/shared/BrandMark";

export function AccessLoading() {
    return (
        <main
            className="flex min-h-screen items-center justify-center bg-canvas px-6"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <BrandMark />
                <span className="h-px w-24 overflow-hidden bg-line">
                    <span className="block h-full w-1/2 animate-pulse bg-brand" />
                </span>
                <p className="text-sm text-subtle">
                    Đang xác minh phiên đăng nhập…
                </p>
            </div>
        </main>
    );
}
