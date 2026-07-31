import { describe, expect, it } from "vitest";
import {
    getEligiblePricingDestination,
    getSafeDestination,
    isSafeDestination,
} from "@/lib/safe-destination";

describe("isSafeDestination", () => {
    it.each([
        "/dashboard",
        "/dashboard/demo",
        "/dashboard/robots?status=online",
        "/admin/dashboard",
        "/pricing",
        "/pricing?plan=Starter",
        "/pricing?plan=Business",
        "/pricing?plan=Enterprise",
        "/pricing?plan=Basic",
        "/pricing?plan=Premium",
        "/payment/vnpay-return?txnRef=ST-20260731_001",
        "/payment/vnpay-return?responseCode=00&signatureValid=true&status=success&transactionStatus=00&txnRef=ST-20260731_001",
    ])("accepts the known internal destination %s", (destination) => {
        expect(isSafeDestination(destination)).toBe(true);
    });

    it.each([
        "",
        "dashboard",
        "//evil.example/dashboard",
        "https://evil.example/dashboard",
        "javascript:alert(1)",
        "/\\evil.example",
        "/unknown",
        "/login",
        "/register",
        "/payment/vnpay-return",
        "/payment/vnpay-return?txnRef=",
        "/payment/vnpay-return?txnRef=ok&status=Paid",
        "/payment/vnpay-return?responseCode=00&signatureValid=yes&status=success&transactionStatus=00&txnRef=ST-1",
        "/payment/vnpay-return?responseCode=00&signatureValid=true&status=unknown&transactionStatus=00&txnRef=ST-1",
        "/pricing?plan=InvalidPlan",
        "/pricing?plan=basic",
        "/pricing?plan=Basic&return=https://evil.example",
    ])("rejects the unsafe or ineligible destination %s", (destination) => {
        expect(isSafeDestination(destination)).toBe(false);
    });
});

describe("getSafeDestination", () => {
    it("preserves the path and query for an eligible destination", () => {
        expect(
            getSafeDestination("/dashboard/robots?status=offline", "/")
        ).toBe("/dashboard/robots?status=offline");
    });

    it.each([
        [null, "/"],
        [undefined, "/dashboard"],
        ["//evil.example", "/dashboard/demo"],
        ["https://evil.example", "/pricing"],
        ["/unknown", "/"],
    ] as const)(
        "falls back for %s",
        (destination, fallback) => {
            expect(getSafeDestination(destination, fallback)).toBe(
                fallback
            );
        }
    );
});

describe("getEligiblePricingDestination", () => {
    it.each([
        ["/pricing?plan=Starter", "/pricing?plan=Starter"],
        ["/pricing?plan=Business", "/pricing?plan=Business"],
        ["/pricing?plan=Enterprise", "/pricing?plan=Enterprise"],
        ["/pricing?plan=Basic", "/pricing?plan=Basic"],
        ["/pricing?plan=Premium", "/pricing?plan=Premium"],
        ["/pricing", "/pricing"],
        ["/pricing?plan=Free", null],
        ["/pricing?plan=Unknown", null],
        ["/pricing?plan=Basic&checkout=1", null],
        ["https://evil.example/pricing?plan=Basic", null],
    ] as const)("normalizes %s", (destination, expected) => {
        expect(getEligiblePricingDestination(destination)).toBe(expected);
    });
});
