import type {
    AdminCompany,
    AdminCompanyMember,
    AdminUserDetail,
    AdminUserListItem,
} from "@/lib/api/admin";

export const adminUsers: AdminUserListItem[] = [
    {
        id: "admin-user-01",
        email: "an.tran@syntwin.test",
        fullName: "Trần An",
        role: "User",
        status: "Active",
        subscriptionPlan: "Basic",
        lastLoginAt: "2026-07-31T07:45:00.000Z",
        createdAt: "2026-01-12T08:00:00.000Z",
    },
    {
        id: "admin-user-02",
        email: "quantri@syntwin.test",
        fullName: "Quản trị hệ thống",
        role: "SuperAdmin",
        status: "Active",
        subscriptionPlan: "Premium",
        lastLoginAt: "2026-07-31T07:50:00.000Z",
        createdAt: "2025-12-01T08:00:00.000Z",
    },
];

export const adminUserDetails: AdminUserDetail[] = adminUsers.map(
    (user) => ({
        ...user,
        avatarUrl: null,
        timezone: "Asia/Ho_Chi_Minh",
        updatedAt: "2026-07-31T08:00:00.000Z",
    })
);

export const adminCompanies: AdminCompany[] = [
    {
        id: "admin-company-01",
        name: "Nhà máy Minh Phát",
        slug: "nha-may-minh-phat",
        status: "Active",
        ownerUserId: "owner-01",
        ownerEmail: "owner@minhphat.test",
        ownerFullName: "Lê Minh",
        monitorCount: 1,
        createdAt: "2026-01-10T08:00:00.000Z",
    },
    {
        id: "admin-company-02",
        name: "Xưởng cơ khí Đông Nam",
        slug: "xuong-co-khi-dong-nam",
        status: "Active",
        ownerUserId: "owner-02",
        ownerEmail: "owner@dongnam.test",
        ownerFullName: "Nguyễn Hà",
        monitorCount: 3,
        createdAt: "2026-02-10T08:00:00.000Z",
    },
];

export const adminCompanyMembers: Record<
    string,
    AdminCompanyMember[]
> = {
    "admin-company-01": [
        {
            userId: "owner-01",
            email: "owner@minhphat.test",
            fullName: "Lê Minh",
            avatarUrl: null,
            role: "Owner",
            joinedAt: "2026-01-10T08:00:00.000Z",
        },
        {
            userId: "monitor-01",
            email: "monitor@minhphat.test",
            fullName: "Phạm Lan",
            avatarUrl: null,
            role: "Monitor",
            joinedAt: "2026-01-12T08:00:00.000Z",
        },
    ],
    "admin-company-02": [
        {
            userId: "owner-02",
            email: "owner@dongnam.test",
            fullName: "Nguyễn Hà",
            avatarUrl: null,
            role: "Owner",
            joinedAt: "2026-02-10T08:00:00.000Z",
        },
    ],
};

export const adminMetricCounts = {
    totalUsers: 37,
    byStatus: {
        Active: 29,
        Locked: 7,
        Deleted: 1,
    },
    byPlan: {
        Free: 18,
        Basic: 12,
        Premium: 7,
    },
} as const;
