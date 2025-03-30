import { NextRequest, NextResponse } from 'next/server';
import { generateInnovationIdeas } from "@/lib/gemini";
import { BigQuery } from '@google-cloud/bigquery';
import { fetchArxivPapers } from '@/lib/arxiv'

// map of industries to cpc codes
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

interface Patent {
    id: string;
    title: string;
    abstract: string;
    date: string;
    cpc_codes: string[];
}

export async function POST(request: NextRequest) {
    try {
        const { userMessage, previousIdeas } = await request.json();
        
        if (!userMessage) {
            return NextResponse.json({ error: "No user message provided" }, { status: 400 });
        }
        
        const keywords = userMessage.toLowerCase()
            .split(/\s+/)
            .filter((word: string) => word.length > 4 && !['about', 'these', 'those', 'their', 'would', 'could'].includes(word))
            .slice(0, 5);
        
        const detectedIndustries: string[] = [];
        Object.keys(industryToCpcMap).forEach(industry => {
            if (userMessage.toLowerCase().includes(industry)) {
                detectedIndustries.push(industry);
            }
        });
        
        const primaryIndustry = detectedIndustries.length > 0 ? detectedIndustries[0] : 'technology';
        
        let industryCpcCodes: string[] = [];
        if (detectedIndustries.length > 0) {
            detectedIndustries.forEach(industry => {
                if (industryToCpcMap[industry]) {
                    industryCpcCodes.push(...industryToCpcMap[industry]);
                }
            });
        }
        
        if (industryCpcCodes.length === 0) {
            industryCpcCodes = ['A', 'B', 'G'];
        }
        const searchQuery = keywords.join(" ") + " " + primaryIndustry;
        const papers = await fetchArxivPapers(searchQuery, 50);
        const bigQuery = new BigQuery({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });
        
        let cpcFilter = '';
        if (industryCpcCodes.length > 0) {
            const cpcPatterns = industryCpcCodes.map(code => `code LIKE '${code}%'`);
            cpcFilter = `AND EXISTS(SELECT 1 FROM UNNEST(cpc) WHERE ${cpcPatterns.join(' OR ')})`;
        }
        let textFilter = '';
        if (keywords.length > 0) {
            const sanitizedQuery = keywords.join(" ").replace(/['"`\\]/g, " ").trim();
            
            if (sanitizedQuery) {
                textFilter = `AND (
                    (SELECT text FROM UNNEST(title_localized) WHERE language = 'en' LIMIT 1) LIKE '%${sanitizedQuery}%'
                    OR (SELECT text FROM UNNEST(abstract_localized) WHERE language = 'en' LIMIT 1) LIKE '%${sanitizedQuery}%'
                )`;
            }
        }
        const sqlQuery = `
            SELECT
                publication_number,
                publication_date,
                country_code,
                (SELECT text FROM UNNEST(title_localized) WHERE language = 'en' LIMIT 1) as title,
                (SELECT text FROM UNNEST(abstract_localized) WHERE language = 'en' LIMIT 1) as abstract,
                ARRAY(SELECT code FROM UNNEST(cpc)) as cpc_codes
            FROM
                \`patents-public-data.patents.publications\`
            WHERE
                publication_date >= 20180101
                AND country_code = 'US'
                ${textFilter}
                ${cpcFilter}
            LIMIT 5;
        `;
        let patents: Patent[] = [];
        try {
            const [rows] = await bigQuery.query(sqlQuery);
            patents = rows.map((row: any) => ({
                id: row.publication_number,
                title: row.title || '',
                abstract: row.abstract || '',
                date: row.publication_date,
                cpc_codes: row.cpc_codes || []
            }));
        } catch (error) {
            console.error('Error querying BigQuery:', error);
        }
        const paperSummaries = papers.map((p: any) => 
            `${p.title} - ${p.summary?.substring(0, 200) || 'No summary available'}...`
        );
        
        const patentSummaries = patents.map((p: any) =>
            `${p.title} - ${p.abstract?.substring(0, 200) || 'No abstract available'}...`
        );
        
        const innovationIdeas = await generateInnovationIdeas(
            userMessage,
            papers.map((p: { title: string; summary?: string; authors?: string[]; published?: string; pdf_url?: string }) => ({
                title: p.title,
                abstract: p.summary || '',
                authors: p.authors || [],
                published: p.published || '',
                pdf_url: p.pdf_url || ''
            })),
            patents.map(p => ({
                title: p.title,
                abstract: p.abstract,
                inventors: [], // Add inventors if available in your data
                filing_date: p.date,
                patent_number: p.id,
                claims: [], // Add claims if available in your data
                cpc_codes: p.cpc_codes // Add CPC codes from BigQuery
            })),
            previousIdeas // Pass previous ideas to the function
        );
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