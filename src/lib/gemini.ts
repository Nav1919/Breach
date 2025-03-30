import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
interface ResearchPaper {
    title: string;
    abstract: string;
    authors: string[];
    published: string;
    pdf_url: string;
}
interface PromptAnalysis {
    keyTerms: string[];
    industryFocus: string[];
    constraints: string[];
    innovationLevel: 'incremental' | 'radical' | 'disruptive';
    marketMaturity: 'emerging' | 'growing' | 'mature';
}

function analyzeContext(context: string): PromptAnalysis {
    const tokens = context.toLowerCase().split(/\s+/);
    const keyTerms = [...new Set(tokens.filter(token => token.length > 4))].slice(0, 10);

    const industryPatterns = /(industry|market|sector|field):\s*([^,\n]+)/gi;
    const industryFocus = [];
    let match;
    while ((match = industryPatterns.exec(context)) !== null) {
        industryFocus.push(match[2].trim());
    }

    // Extract constraints and requirements
    const constraintPatterns = /(constraint|requirement|focus|must|should|need):\s*([^,\n]+)/gi;
    const constraints = [];
    while ((match = constraintPatterns.exec(context)) !== null) {
        constraints.push(match[2].trim());
    }

    // Analyze innovation level based on keywords
    const innovationKeywords = {
        incremental: ['improve', 'enhance', 'optimize', 'better'],
        radical: ['revolutionary', 'breakthrough', 'novel', 'innovative'],
        disruptive: ['transform', 'revolutionize', 'disrupt', 'game-changing']
    };
    const innovationLevel = determineInnovationLevel(tokens, innovationKeywords);

    // Analyze market maturity
    const maturityKeywords = {
        emerging: ['new', 'emerging', 'upcoming', 'future'],
        growing: ['growing', 'expanding', 'developing', 'rising'],
        mature: ['established', 'mature', 'stable', 'traditional']
    };
    const marketMaturity = determineMarketMaturity(tokens, maturityKeywords);

    return {
        keyTerms,
        industryFocus,
        constraints,
        innovationLevel,
        marketMaturity
    };
}

function determineInnovationLevel(tokens: string[], keywords: Record<string, string[]>): 'incremental' | 'radical' | 'disruptive' {
    const scores = {
        incremental: 0,
        radical: 0,
        disruptive: 0
    };

    tokens.forEach(token => {
        Object.entries(keywords).forEach(([level, words]) => {
            if (words.includes(token)) {
                scores[level as keyof typeof scores]++;
            }
        });
    });

    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as 'incremental' | 'radical' | 'disruptive';
}

function determineMarketMaturity(tokens: string[], keywords: Record<string, string[]>): 'emerging' | 'growing' | 'mature' {
    const scores = {
        emerging: 0,
        growing: 0,
        mature: 0
    };

    tokens.forEach(token => {
        Object.entries(keywords).forEach(([level, words]) => {
            if (words.includes(token)) {
                scores[level as keyof typeof scores]++;
            }
        });
    });

    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as 'emerging' | 'growing' | 'mature';
}

function generateOptimizedPrompt(context: string, analysis: PromptAnalysis): string {
    const { keyTerms, industryFocus, constraints, innovationLevel, marketMaturity } = analysis;

    return `
    Generate ${innovationLevel === 'disruptive' ? 'groundbreaking' : innovationLevel === 'radical' ? 'innovative' : 'practical'} startup ideas for the following context:

    INDUSTRY FOCUS:
    ${industryFocus.join(', ')}

    KEY TERMS:
    ${keyTerms.join(', ')}

    MARKET MATURITY:
    ${marketMaturity.charAt(0).toUpperCase() + marketMaturity.slice(1)} market

    SPECIFIC REQUIREMENTS:
    ${constraints.map(c => `- ${c}`).join('\n')}

    CONTEXT:
    ${context}

    For each idea, provide:
    1. A compelling description that emphasizes ${innovationLevel} innovation
    2. Target market segments and their specific needs
    3. Key differentiators and competitive advantages
    4. Technical and market challenges
    5. Implementation timeline and resource requirements
    6. Potential impact and scalability factors

    Focus on ideas that:
    - Address clear market gaps
    - Have strong technical feasibility
    - Show clear differentiation from existing solutions
    - Have potential for significant market impact
    - Can be implemented within reasonable timeframes

    Include all resources that helped you form each idea, including the ArXiv papers and patents from the Google BigQuery calls. If it is an ArXiv paper, explicitly state that it is from ArXiv and state the paper name.
    `;
}

export async function generateInnovationIdeas(context: string): Promise<string[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Analyze context using NLP
        const analysis = analyzeContext(context);
        
        // Generate optimized prompt
        const optimizedPrompt = generateOptimizedPrompt(context, analysis);

        // Generate content with optimized prompt
        const result = await model.generateContent(optimizedPrompt);
        const response = await result.response;
        const text = response.text();

        // Split and clean the response
        return text.split("\n\n")
            .filter((idea: string) => idea.trim().length > 0)
            .map(idea => idea.trim());
    } catch (error) {
        console.error("Error generating innovation ideas:", error);
        throw new Error("Failed to generate innovation ideas");
    }
}

export async function analyzeData(
    market: string,
    keywords: string[],
    niche: string,
    papers: string[],
    patents: string[]
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Analyze the following information for the ${market} industry, specifically in the ${niche} niche:

        KEYWORDS:
        ${keywords.join(', ')}

        RESEARCH PAPERS:
        ${papers.join('\n')}

        PATENTS:
        ${patents.join('\n')}

        Please provide:
        1. Key research trends and current state of technology
        2. Identified gaps between research and patents
        3. Potential commercialization opportunities
        4. Market needs not addressed by current solutions
        5. Innovation possibilities in this space
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error analyzing data:", error);
        throw new Error("Failed to analyze data");
    }
}