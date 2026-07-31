export const FIXTURE_NOW = "2026-07-31T08:00:00.000Z";

export const fixtureCompany = {
    id: "fixture-company-01",
    name: "Nhà máy SynTwin mẫu",
    slug: "nha-may-syntwin-mau",
    industry: "Sản xuất linh kiện",
    address: "Khu công nghiệp mẫu",
    timezone: "Asia/Ho_Chi_Minh",
    logoUrl: null,
    status: "Active",
    currentUserRole: "Owner",
    memberCount: 4,
    subscriptionPlan: "Basic",
    maxRobots: 3,
    canView3D: true,
    canSendCommand: true,
    createdAt: "2026-01-01T00:00:00.000Z",
};

export const fixtureRobot = {
    id: "fixture-robot-ra-001",
    userId: "fixture-basic-user",
    companyId: fixtureCompany.id,
    currentUserRole: "Owner",
    robotName: "RA-001",
    model: "SynArm A6",
    connectionType: "MQTT",
    status: "Online",
    lastSeenAt: FIXTURE_NOW,
    ipAddress: "192.0.2.10",
    port: 8883,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: FIXTURE_NOW,
};

export const fixtureLatestState = {
    robotId: fixtureRobot.id,
    isOnline: true,
    status: "Running",
    tcpPose: {
        x: 420.5,
        y: 112.3,
        z: 680.1,
        rx: 0,
        ry: 90,
        rz: 180,
    },
    jointAngles: [12.4, -28.1, 44.6, 8.2, 71.3, -3.5],
    temperature: 61.8,
    collisionWarning: false,
    lastSeenAt: FIXTURE_NOW,
    timestamp: FIXTURE_NOW,
    receivedAt: FIXTURE_NOW,
    latencyMilliseconds: 18,
    sequenceNumber: 2048,
    io: null,
    execution: null,
    source: "fixture",
};

export const fixtureRobotCommands = [
    {
        id: "fixture-command-01",
        robotId: fixtureRobot.id,
        commandType: "Start",
        payload: null,
        status: "Completed",
        createdAt: "2026-07-31T07:55:00.000Z",
        completedAt: "2026-07-31T07:55:02.000Z",
        failureReason: null,
        result: null,
    },
];

export const fixtureTelemetryHistory = [
    {
        timestamp: "2026-07-31T07:50:00.000Z",
        jointAngles: [10, -25, 40, 6, 68, -2],
        tcpPose: { x: 410, y: 108, z: 670, rx: 0, ry: 90, rz: 180 },
        sequenceNumber: 2040,
        latencyMilliseconds: 20,
        temperature: 60.9,
        collisionWarning: false,
        status: "Running",
        source: "fixture",
    },
    {
        timestamp: FIXTURE_NOW,
        jointAngles: fixtureLatestState.jointAngles,
        tcpPose: fixtureLatestState.tcpPose,
        sequenceNumber: fixtureLatestState.sequenceNumber,
        latencyMilliseconds: fixtureLatestState.latencyMilliseconds,
        temperature: fixtureLatestState.temperature,
        collisionWarning: false,
        status: "Running",
        source: "fixture",
    },
];

export const fixtureSubscriptionPlans = [
    {
        id: 1,
        code: "Free",
        name: "Free",
        monthlyPrice: 0,
        maxRobots: 1,
        canView3D: false,
        canSendCommand: false,
        auditRetentionDays: 7,
    },
    {
        id: 2,
        code: "Basic",
        name: "Basic",
        monthlyPrice: 99000,
        maxRobots: 3,
        canView3D: true,
        canSendCommand: false,
        auditRetentionDays: 30,
    },
    {
        id: 3,
        code: "Premium",
        name: "Premium",
        monthlyPrice: 299000,
        maxRobots: 30,
        canView3D: true,
        canSendCommand: true,
        auditRetentionDays: 365,
    },
];

export const fixtureAdminCompanies = [
    {
        id: fixtureCompany.id,
        name: fixtureCompany.name,
        slug: fixtureCompany.slug,
        status: "Active",
        ownerUserId: "fixture-basic-user",
        ownerEmail: "basic.fixture@syntwin.test",
        ownerFullName: "Quản lý Basic",
        monitorCount: 1,
        createdAt: fixtureCompany.createdAt,
    },
];

export const fixtureAdminUser = {
    id: "fixture-customer-user",
    email: "customer.fixture@syntwin.test",
    fullName: "Quản lý nhà máy mẫu",
    avatarUrl: null,
    timezone: "Asia/Ho_Chi_Minh",
    role: "User",
    status: "Active",
    subscriptionPlan: "Basic",
    lastLoginAt: FIXTURE_NOW,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: FIXTURE_NOW,
};

export const fixtureAdminCompanyMembers = [
    {
        userId: "fixture-basic-user",
        email: "basic.fixture@syntwin.test",
        fullName: "Quản lý Basic",
        avatarUrl: null,
        role: "Owner",
        joinedAt: "2026-01-01T00:00:00.000Z",
    },
    {
        userId: "fixture-monitor-user",
        email: "monitor.fixture@syntwin.test",
        fullName: "Giám sát mẫu",
        avatarUrl: null,
        role: "Monitor",
        joinedAt: "2026-02-01T00:00:00.000Z",
    },
];
