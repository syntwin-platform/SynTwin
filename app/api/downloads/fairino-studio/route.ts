import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { FAIROBOT_DOWNLOAD_URL } from "@/lib/constants/downloads";

const FILENAME = "FaiRobot-Studio-1.0.0-Setup.exe";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return NextResponse.json(
            { error: "Cần đăng nhập để tải phần mềm." },
            { status: 401 }
        );
    }

    // Kiểm tra nếu có file local thì stream file local
    const filePath = path.join(process.cwd(), "public", "downloads", FILENAME);
    if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const fileSize = fs.statSync(filePath).size;

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${FILENAME}"`,
                "Content-Length": String(fileSize),
                "Cache-Control": "private, no-cache",
            },
        });
    }

    // Nếu không có file local, redirect đến Cloud Storage URL
    return NextResponse.redirect(FAIROBOT_DOWNLOAD_URL, 302);
}
