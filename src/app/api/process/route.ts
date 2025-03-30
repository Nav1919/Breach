// /app/api/gap-finder/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateInnovationIdeas } from "@/lib/gemini";
import { BigQuery } from '@google-cloud/bigquery';

// Map of common industries to their CPC codes
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
  'food': ['A23L', 'A23B'],
  'construction': ['E04B', 'E04C'],
  'textiles': ['D01', 'D02', 'D03'],
  'pharmaceuticals': ['A61K', 'A61P'],
};

export async function POST(request: NextRequest) {
    try {
        const { userMessage } = await request.json();
        
        if (!userMessage) {
            return NextResponse.json({ error: "No user message provided" }, { status: 400 });
        }

        // Step 1: Directly use the userMessage to generate innovation ideas
        const innovationIdeas = await generateInnovationIdeas(userMessage);
        
        // For better results, let's also fetch relevant patent data
        // First, extract keywords from the user's message
        const keywords = userMessage.toLowerCase()
            .split(/\s+/)
            .filter((word: string) => word.length > 4 && !['about', 'these', 'those', 'their', 'would', 'could'].includes(word))
            .slice(0, 5);
        
        // Identify potential industries mentioned in the message
        const detectedIndustries: string[] = [];
        Object.keys(industryToCpcMap).forEach(industry => {
            if (userMessage.toLowerCase().includes(industry)) {
                detectedIndustries.push(industry);
            }
        });
        
        // Default to a generic industry if none detected
        const primaryIndustry = detectedIndustries.length > 0 ? detectedIndustries[0] : 'technology';
        
        // Get CPC codes for the detected industry
        let industryCpcCodes: string[] = [];
        if (detectedIndustries.length > 0) {
            detectedIndustries.forEach(industry => {
                if (industryToCpcMap[industry]) {
                    industryCpcCodes.push(...industryToCpcMap[industry]);
                }
            });
        }
        
        if (industryCpcCodes.length === 0) {
            industryCpcCodes = ['A', 'B', 'G']; // Default to broad categories
        }
        
        // Step 2: Fetch relevant patents to provide context
        let patents = [];
        try {
            const keywordQuery = encodeURIComponent(keywords.join(" "));
            const patentsResponse = await fetch(
                `${request.nextUrl.origin}/api/patents?query=${keywordQuery}&cpcCodes=${industryCpcCodes.join(',')}&limit=5`
            );
            
            if (patentsResponse.ok) {
                const patentsData = await patentsResponse.json();
                patents = patentsData.data || [];
            }
        } catch (error) {
            console.error("Error fetching patents:", error);
            // Continue even without patents
        }
        
        // Step 3: Fetch relevant research papers
        let papers = [];
        try {
            const arxivResponse = await fetch(
                `${request.nextUrl.origin}/api/arxiv?query=${encodeURIComponent(keywords.join(" "))}&maxResults=5`
            );
            
            if (arxivResponse.ok) {
                const arxivData = await arxivResponse.json();
                papers = arxivData.data || [];
            }
        } catch (error) {
            console.error("Error fetching research papers:", error);
            // Continue even without papers
        }

        // Return the combined results
        return NextResponse.json({ 
            success: true, 
            innovations: innovationIdeas,
            userMessage,
            context: {
                detectedIndustries,
                keywords,
                patents,
                papers
            }
        });
    } catch (error) {
        console.error("Error in Gap Finder API:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to generate innovation ideas"
        }, { status: 500 });
    }
}