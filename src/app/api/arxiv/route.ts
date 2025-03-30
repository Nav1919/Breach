import { NextRequest, NextResponse } from "next/server";
import { fetchArxivPapers } from "@/lib/arxiv";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "AI patents";
    const maxResults = parseInt(searchParams.get("maxResults") || "5");

    try {
        const papers = await fetchArxivPapers(query, maxResults);
        return NextResponse.json({ success: true, data: papers });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error fetching ArXiv data: " }, { status: 500 });
    }
}