import { describe, expect, it } from "vitest";
import {
    formatCollisionWarning,
    formatCommandStatus,
    formatRobotLimit,
    formatRobotStatus,
} from "./display-labels";

describe("Vietnamese display labels", () => {
    it.each([
        ["Running", "Đang chạy"],
        ["Idle", "Sẵn sàng"],
        ["Error", "Lỗi"],
        ["Fault", "Lỗi"],
        ["Warning", "Cảnh báo"],
        ["Offline", "Ngoại tuyến"],
    ])("translates robot status %s", (input, expected) => {
        expect(formatRobotStatus(input)).toBe(expected);
    });

    it.each([
        ["Completed", "Hoàn tất"],
        ["Failed", "Thất bại"],
        ["Pending", "Đang chờ"],
    ])("translates command status %s", (input, expected) => {
        expect(formatCommandStatus(input)).toBe(expected);
    });

    it("keeps an unavailable collision flag unknown", () => {
        expect(formatCollisionWarning(null)).toEqual({
            label: "Chưa xác định",
            tone: "default",
        });
        expect(formatCollisionWarning(undefined)).toEqual({
            label: "Chưa xác định",
            tone: "default",
        });
    });

    it.each([
        [-1, "Không giới hạn robot"],
        [0, "Không bao gồm robot"],
        [1, "Tối đa 1 robot"],
        [2, "Tối đa 2 robot"],
        [30, "Tối đa 30 robot"],
    ])("formats maxRobots=%s", (input, expected) => {
        expect(formatRobotLimit(input)).toBe(expected);
    });
});
