import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { analyzeData } from "@/lib/gemini";

const industryToCpcMap: Record<string, string[]> = {
  'healthcare': ['A61B', 'A61F', 'A61M'],
  'transportation': ['B60', 'B61', 'B62'],
  'agriculture': ['A01', 'A01B', 'C05'],
  'energy': ['F03', 'H01M', 'Y02E'],
  'manufacturing': ['B23', 'B29', 'G05B'],
  'communications': ['H04L', 'H04W', 'G06F'],
  'finance': ['G06Q', 'G07F', 'G07G'],
  'ai': ['G06N'],
  'robotics': ['B25J'],
  'materials': ['C01', 'C08', 'D01'],
  'electronics': ['H01L', 'H05K'],
  'environmental': ['Y02W', 'B09B'],
};

export async function POST(req: NextRequest) {
    try {
        const { userMessage } = await req.json();
        if (!userMessage) {
            return NextResponse.json({ error: "No user message provided" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const extractionPrompt = `
            Extract key information from this user's invention idea message.

            User message: "${userMessage}"

            Return a JSON object with these fields:
            - market: The industry or market they're targeting
            - niche: Any specific niche within that industry
            - keywords: Array of important keywords or concepts (3-5 words)

            IMPORTANT: Return ONLY the raw JSON object with no formatting, markdown, code blocks, or explanations.
            For example: {"market":"healthcare","niche":"remote monitoring","keywords":["wearable","sensor","elderly"]}
        `;

        let extractedInfo;
        try {
            const extractionResponse = await model.generateContent(extractionPrompt);
            const extractionText = extractionResponse.response.text();
            let cleanedJson = extractionText;
            if (extractionText.includes('```')) {
                cleanedJson = extractionText.replace(/```(json)?/g, '').trim();
            }
            extractedInfo = JSON.parse(cleanedJson);
            if (!extractedInfo.market || !extractedInfo.niche || !Array.isArray(extractedInfo.keywords)) {
                throw new Error("Missing required fields in extracted data");
            }
        } catch (error) {
            console.error("Error parsing extracted information:", error);
            extractedInfo = {
                market: userMessage.split(' ').slice(0, 2).join(' '),
                niche: "general",
                keywords: userMessage.split(' ')
                    .filter((word: string) => word.length > 4)
                    .slice(0, 5)
            };
        }
        const { market, niche, keywords } = extractedInfo;

        let marketCpcCodes: string[] = [];
        const marketLower = market.toLowerCase();
        Object.keys(industryToCpcMap).forEach(industry => {
            if (marketLower.includes(industry)) {
                marketCpcCodes.push(...industryToCpcMap[industry]);
            }
        });
        if (marketCpcCodes.length === 0) {
            marketCpcCodes = ['A', 'B', 'G'];
        }

        const queryTerms = [...keywords, market, niche].join(" ");
        const arxivResponse = await fetch(
            `${req.nextUrl.origin}/api/arxiv?query=${encodeURIComponent(queryTerms)}&maxResults=5`
        );
        if (!arxivResponse.ok) throw new Error("Failed to fetch arXiv papers");
        const { data: arxivPapers } = await arxivResponse.json();

        const marketQuery = encodeURIComponent([market, niche, ...keywords.slice(0, 3)].join(" "));
        const marketPatentsResponse = await fetch(
            `${req.nextUrl.origin}/api/patents?query=${marketQuery}&cpcCodes=${marketCpcCodes.join(',')}&limit=5`
        );
        if (!marketPatentsResponse.ok) throw new Error("Failed to fetch market patents");
        const { data: marketPatents } = await marketPatentsResponse.json();
        
        const otherDomains = Object.keys(industryToCpcMap).filter(domain => !marketLower.includes(domain)).sort(() => 0.5 - Math.random()).slice(0, 2);
        const diverseCpcCodes = otherDomains.flatMap(domain => industryToCpcMap[domain]);
        const diverseQuery = encodeURIComponent(keywords[0] || "");
        const diversePatentsResponse = await fetch(`${req.nextUrl.origin}/api/patents?query=${diverseQuery}&cpcCodes=${diverseCpcCodes.join(',')}&limit=5`);
        
        let diversePatents = [];
        if (diversePatentsResponse.ok) {
            const { data } = await diversePatentsResponse.json();
            diversePatents = data || [];
        }

        const paperSummaries = arxivPapers.map((p: any) => `${p.title} - ${p.summary.substring(0, 200)}...`);
        const patentSummaries = [
            ...marketPatents.map((p: any) => 
                `[${market.toUpperCase()}] ${p.title} - ${p.abstract.substring(0, 200)}...`
            ),
            ...diversePatents.map((p: any, i: number) => 
                `[${otherDomains[i % otherDomains.length].toUpperCase()}] ${p.title} - ${p.abstract.substring(0, 200)}...`
            )
        ];

        const analysis = await analyzeData(market, keywords, niche, paperSummaries, patentSummaries);
        return NextResponse.json({ 
            success: true, 
            analysis,
            extractedInfo,
            papers: arxivPapers,
            patents: {
                market: marketPatents,
                diverse: diversePatents
            }
        });
    } catch (error) {
        console.error("Error in Gap Finder API: ", error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to process your invention idea. Please try again."
        }, { status: 500 });
    }
}