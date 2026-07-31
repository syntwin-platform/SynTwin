import { describe, expect, it } from "vitest";
import {
    evaluateRouteAccess,
    getDefaultDestination,
    getPostLoginDestination,
    isAdmin,
    isFreeCustomer,
    isPaidCustomer,
    type AccessSession,
} from "@/lib/access-policy";

const free = session("User", "Free");
const basic = session("User", "Basic");
const premium = session("User", "Premium");
const admin = session("SuperAdmin", "Premium");

describe("subscription predicates", () => {
    it.each([
        ["Free", free, true, false, false],
        ["Basic", basic, false, true, false],
        ["Premium", premium, false, true, false],
        ["SuperAdmin", admin, false, false, true],
        ["anonymous", null, false, false, false],
    ] as const)(
        "classifies %s without using the legacy plan field",
        (_label, identity, expectedFree, expectedPaid, expectedAdmin) => {
            expect(isFreeCustomer(identity)).toBe(expectedFree);
            expect(isPaidCustomer(identity)).toBe(expectedPaid);
            expect(isAdmin(identity)).toBe(expectedAdmin);
        }
    );
});

describe("getDefaultDestination", () => {
    it.each([
        ["anonymous", null, "/login"],
        ["Free", free, "/dashboard/demo"],
        ["Basic", basic, "/dashboard"],
        ["Premium", premium, "/dashboard"],
        ["SuperAdmin", admin, "/admin/dashboard"],
    ] as const)("routes %s to %s", (_label, identity, expected) => {
        expect(getDefaultDestination(identity)).toBe(expected);
    });
});

describe("evaluateRouteAccess", () => {
    it.each([
        ["/dashboard/demo", null, denied("/login?next=%2Fdashboard%2Fdemo")],
        ["/dashboard/demo", free, allowed()],
        ["/dashboard/demo", basic, denied("/dashboard")],
        ["/dashboard/demo", premium, denied("/dashboard")],
        ["/dashboard/demo", admin, denied("/admin/dashboard")],
        [
            "/dashboard/robots?status=online",
            null,
            denied(
                "/login?next=%2Fdashboard%2Frobots%3Fstatus%3Donline"
            ),
        ],
        ["/dashboard", free, denied("/dashboard/demo")],
        ["/dashboard/robots", free, denied("/dashboard/demo")],
        ["/dashboard", basic, allowed()],
        ["/dashboard/robots", premium, allowed()],
        ["/dashboard", admin, denied("/admin/dashboard")],
        [
            "/admin/users?page=2",
            null,
            denied("/login?next=%2Fadmin%2Fusers%3Fpage%3D2"),
        ],
        ["/admin/dashboard", free, denied("/dashboard/demo")],
        ["/admin/users", basic, denied("/dashboard")],
        ["/admin/companies", premium, denied("/dashboard")],
        ["/admin/dashboard", admin, allowed()],
        ["/pricing", null, allowed()],
        ["/pricing?plan=Basic", free, allowed()],
        ["/pricing", basic, allowed()],
        ["/pricing", premium, allowed()],
        ["/pricing", admin, allowed()],
        ["/login", null, allowed()],
        ["/register", null, allowed()],
        ["/login", free, denied("/dashboard/demo")],
        ["/register", basic, denied("/dashboard")],
        ["/login", premium, denied("/dashboard")],
        ["/register", admin, denied("/admin/dashboard")],
    ] as const)(
        "%s obeys the access matrix",
        (destination, identity, expected) => {
            expect(evaluateRouteAccess(destination, identity)).toEqual(
                expected
            );
        }
    );
});

describe("getPostLoginDestination", () => {
    it("preserves an eligible selected pricing plan", () => {
        expect(
            getPostLoginDestination(
                free,
                "/pricing?plan=Basic"
            )
        ).toBe("/pricing?plan=Basic");
    });

    it("preserves a strict VNPay return reference", () => {
        expect(
            getPostLoginDestination(
                basic,
                "/payment/vnpay-return?txnRef=ST-20260731_001"
            )
        ).toBe(
            "/payment/vnpay-return?txnRef=ST-20260731_001"
        );
    });

    it("preserves the complete callback shape emitted by the backend", () => {
        const callback =
            "/payment/vnpay-return?responseCode=00&signatureValid=true&status=success&transactionStatus=00&txnRef=ST-20260731_001";

        expect(
            getPostLoginDestination(basic, callback)
        ).toBe(callback);
    });

    it("rejects unsafe or ineligible destinations", () => {
        expect(
            getPostLoginDestination(
                free,
                "https://evil.example/dashboard"
            )
        ).toBe("/dashboard/demo");
        expect(
            getPostLoginDestination(
                free,
                "/dashboard/robots"
            )
        ).toBe("/dashboard/demo");
    });
});

function session(
    role: AccessSession["role"],
    subscriptionPlan: AccessSession["subscriptionPlan"]
): AccessSession {
    return { role, subscriptionPlan };
}

function allowed() {
    return { allowed: true } as const;
}

function denied(redirectTo: string) {
    return { allowed: false, redirectTo } as const;
}
