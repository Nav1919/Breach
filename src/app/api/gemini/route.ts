import { analyzeData } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { market, keywords, niche, papers, patents } = await req.json()
        if (!market || !keywords || !niche || !papers || !patents) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
        const analysis = await analyzeData(market, keywords, niche, papers, patents)
        return NextResponse.json({ success: true, analysis })
    } catch (error) {
        console.error("Error in Gemini API Route: ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}