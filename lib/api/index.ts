/**
 * @file lib/api/index.ts
 * Barrel export cho toàn bộ API layer.
 *
 * Cách dùng:
 *   import { listRobots, createCompany, adminListUsers } from "@/lib/api";
 */

// Core client & error types
export { apiRequest } from "./client";
export type { ApiRequestOptions } from "./client";
export { ApiRequestError } from "./types";
export type { ApiValidationErrors, ApiErrorResponse } from "./types";

// Auth
export * from "./auth";

// Users
export * from "./users";

// Companies
export * from "./companies";

// Robots, RobotCommands, RobotPrograms
export * from "./robots";

// Device (Heartbeat / Telemetry / Commands)
export * from "./device";

// Payments (VNPay)
export * from "./payments";

// Subscription Plans
export * from "./subscriptions";

// Admin (AdminUsers + AdminCompanies)
export * from "./admin";
