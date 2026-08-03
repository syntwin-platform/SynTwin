import { expect, test } from "@playwright/test";
import { installApiMocks } from "./helpers/api-mocks";
import { installSession } from "./helpers/sessions";

test.describe("FaiRobot Studio Download & Information Workflows", () => {
    test("Dành riêng trang tải /download/fairobot với thông số, SmartScreen và hướng dẫn cài đặt", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, { session: "basic" });

        await page.goto("/download/fairobot");

        // Heading & version
        await expect(
            page.getByRole("heading", { name: "FaiRobot Studio", level: 1 })
        ).toBeVisible();
        await expect(page.getByText("v1.0.2").first()).toBeVisible();

        // Direct Cloud Storage download link
        const downloadBtn = page.locator("#btn-download-fairobot-direct");
        await expect(downloadBtn).toBeVisible();
        await expect(downloadBtn).toHaveAttribute(
            "href",
            /storage\.googleapis\.com\/.*FaiRobot-Studio.*Setup\.exe/
        );
        await expect(downloadBtn).toHaveAttribute("target", "_blank");

        // OS Specs & File size
        await expect(
            page.getByText(/Windows 10 \/ 11 \(64-bit\)/i).first()
        ).toBeVisible();
        await expect(page.getByText(/~85 MB/i).first()).toBeVisible();

        // SmartScreen notice
        await expect(
            page.getByText(/Lưu ý về Windows SmartScreen/i)
        ).toBeVisible();
        await expect(page.getByText(/More info/i).first()).toBeVisible();
        await expect(page.getByText(/Run anyway/i).first()).toBeVisible();

        // 4-step installation guide
        await expect(
            page.getByRole("heading", {
                name: "Hướng dẫn cài đặt FaiRobot Studio",
            })
        ).toBeVisible();
        await expect(page.getByText("Tải file bộ cài đặt")).toBeVisible();
        await expect(page.getByText("Khởi chạy Installer")).toBeVisible();
        await expect(page.getByText("Bỏ qua cảnh báo SmartScreen")).toBeVisible();
        await expect(page.getByText("Đăng nhập tài khoản SynTwin")).toBeVisible();
    });

    test("Trang /dashboard/downloads chứa nút tải trực tiếp và link tới /download/fairobot", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, { session: "basic" });

        await page.goto("/dashboard/downloads");

        await expect(
            page.getByRole("heading", {
                name: "Tải phần mềm FaiRobot Studio",
            })
        ).toBeVisible();

        const downloadLink = page.locator("#btn-download-fairino-cloud");
        await expect(downloadLink).toBeVisible();
        await expect(downloadLink).toHaveAttribute(
            "href",
            /storage\.googleapis\.com\/.*FaiRobot-Studio.*Setup\.exe/
        );

        // SmartScreen notice card
        await expect(
            page.getByText(/Lưu ý khi mở bộ cài trên Windows/i)
        ).toBeVisible();

        // Link to /download/fairobot guide page
        const guideLink = page.getByRole("link", {
            name: /trang hướng dẫn cài đặt & SmartScreen/i,
        });
        await expect(guideLink).toBeVisible();
        await expect(guideLink).toHaveAttribute("href", "/download/fairobot");
    });

    test("Trang thanh toán thành công chứa nút tải FaiRobot Studio trực tiếp", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, {
            session: "basic",
            paymentStatus: "Paid",
        });

        await page.goto("/payment/vnpay-return?txnRef=ST-20260731_001");

        await expect(
            page.getByRole("heading", { name: "Thanh toán thành công" })
        ).toBeVisible();

        const downloadBtn = page.locator("#btn-download-after-payment-direct");
        await expect(downloadBtn).toBeVisible();
        await expect(downloadBtn).toHaveAttribute(
            "href",
            /storage\.googleapis\.com\/.*FaiRobot-Studio.*Setup\.exe/
        );

        const dashboardBtn = page.getByRole("link", { name: "Vào Dashboard" });
        await expect(dashboardBtn).toBeVisible();
        await expect(dashboardBtn).toHaveAttribute("href", "/dashboard");
    });

    test("Trang hồ sơ tài khoản /dashboard/user chứa thẻ tải phần mềm FaiRobot Studio", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, { session: "basic" });

        await page.goto("/dashboard/user");

        await expect(
            page.getByRole("heading", { name: "Phần mềm FaiRobot Studio" })
        ).toBeVisible();
        const downloadBtn = page.getByRole("link", {
            name: /Tải FaiRobot Studio \(Windows\)/i,
        });
        await expect(downloadBtn).toBeVisible();
        await expect(downloadBtn).toHaveAttribute(
            "href",
            /storage\.googleapis\.com\/.*FaiRobot-Studio.*Setup\.exe/
        );
    });
});
