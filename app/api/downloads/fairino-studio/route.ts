import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { FAIROBOT_DOWNLOAD_URL } from "@/lib/constants/downloads";

const FILENAMES = [
    "FaiRobot-Studio-1.0.1-Setup.exe",
    "FaiRobot-Studio-1.0.0-Setup.exe",
    "FaiRobot-Studio-Setup.exe"
];

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
    for (const filename of FILENAMES) {
        const filePath = path.join(process.cwd(), "public", "downloads", filename);
        if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const fileSize = fs.statSync(filePath).size;

            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                    "Content-Length": String(fileSize),
                    "Cache-Control": "private, no-cache",
                },
            });
        }
    }

    // Nếu không có file local, redirect đến Cloud Storage URL
    return NextResponse.redirect(FAIROBOT_DOWNLOAD_URL, 302);
}
