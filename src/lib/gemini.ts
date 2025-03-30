import { GoogleGenerativeAI } from "@google/generative-ai"
import { analyzeMarketResearch } from './nlp';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
interface ResearchPaper {
    title: string;
    abstract: string;
    authors: string[];
    published: string;
    pdf_url: string;
}

interface Patent {
    title: string;
    abstract: string;
    inventors: string[];
    filing_date: string;
    patent_number: string;
    claims: string[];
    cpc_codes: string[];
}

interface PromptAnalysis {
    keyTerms: string[];
    industryFocus: string[];
    constraints: string[];
    innovationLevel: 'incremental' | 'radical' | 'disruptive';
    marketMaturity: 'emerging' | 'growing' | 'mature';
}

interface PatentAnalysis {
    technologyCluster: string;
    claimAnalysis: {
        independentClaims: string[];
        dependentClaims: string[];
        keyTechnologies: string[];
    };
    marketImpact: {
        potentialMarkets: string[];
        competitiveAdvantages: string[];
        barriersToEntry: string[];
    };
}

interface ResearchAnalysis {
    methodology: string[];
    keyFindings: string[];
    limitations: string[];
    futureWork: string[];
    citations: string[];
}

// Add new interfaces for query types
interface QueryAnalysis {
    type: 'idea_generation' | 'idea_exploration' | 'idea_question' | 'general';
    targetIdea?: string;
    question?: string;
    context?: string;
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

function generateExplorationPrompt(targetIdea: string, analysis: PromptAnalysis): string {
    const { keyTerms, industryFocus, constraints, innovationLevel, marketMaturity } = analysis;
    
    return `
    Provide a detailed exploration of the idea: "${targetIdea}"

    INDUSTRY CONTEXT:
    ${industryFocus.join(', ')}

    MARKET MATURITY:
    ${marketMaturity.charAt(0).toUpperCase() + marketMaturity.slice(1)} market

    Please provide:
    1. Technical Architecture and Implementation Details
    2. Market Analysis and Target Segments
    3. Business Model and Revenue Streams
    4. Risk Analysis and Mitigation Strategies
    5. Implementation Timeline and Resource Requirements
    6. Competitive Analysis and Differentiation
    7. Potential Impact and Scalability
    8. Supporting Research and Patents

    Focus on practical implementation details and market viability.
    `;
}

function generateOptimizedPrompt(context: string, analysis: PromptAnalysis): string {
    const { keyTerms, industryFocus, constraints, innovationLevel, marketMaturity } = analysis;

    return `
    Generate ${innovationLevel === 'disruptive' ? 'groundbreaking' : innovationLevel === 'radical' ? 'innovative' : 'practical'} startup ideas by analyzing research papers and patents to identify innovation gaps.

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

    For each idea, you MUST:
    1. Start with "INNOVATION GAP IDENTIFIED:" followed by a clear description of the gap between existing research and patents
    2. List the specific papers and patents that helped identify this gap:
       - For arXiv papers: "Based on arXiv paper: [Title] by [Authors]"
       - For patents: "Related to Patent: [Title] (Patent #: [Number])"
    3. Provide a compelling description that emphasizes ${innovationLevel} innovation
    4. Explain how this idea bridges the identified gap
    5. Detail target market segments and their specific needs
    6. Outline key differentiators from existing solutions
    7. Address technical and market challenges
    8. Suggest implementation timeline and resource requirements
    9. Evaluate potential impact and scalability

    Focus on ideas that:
    - Address clear gaps between research and existing patents
    - Have strong technical feasibility based on current research
    - Show clear differentiation from existing solutions
    - Have potential for significant market impact
    - Can be implemented within reasonable timeframes

    Include all resources that helped you form each idea, including the ArXiv papers and patents from the Google BigQuery calls. If it is an ArXiv paper, explicitly state that it is from ArXiv and state the paper name.
    `;
}

function generateQuestionPrompt(
    question: string,
    context: string,
    papers: ResearchPaper[],
    patents: Patent[],
    previousIdeas?: string[]
): string {
    return `
    Answer the following question about the innovation context: "${question}"

    CONTEXT:
    ${context}

    Please provide a detailed answer that:
    1. Directly addresses the specific question
    2. Draws from relevant research papers and patents
    3. Provides concrete examples and evidence
    4. Includes practical implications and considerations
    5. References specific sources when applicable

    Focus on providing actionable insights and practical information.
    `;
}

function analyzeQueryType(context: string): QueryAnalysis {
    const lowerContext = context.toLowerCase();
    
    // Check for idea exploration
    if (lowerContext.includes('explore idea') || lowerContext.includes('tell me more about')) {
        const targetIdea = context.match(/about (.*?)(?:\s*$|\s+in|\s+for)/i)?.[1] || '';
        return {
            type: 'idea_exploration',
            targetIdea,
            context
        };
    }
    
    // Check for specific questions about ideas
    if (lowerContext.includes('how does') || lowerContext.includes('what are') || 
        lowerContext.includes('why is') || lowerContext.includes('can you explain')) {
        return {
            type: 'idea_question',
            question: context,
            context
        };
    }
    
    // Default to idea generation
    return {
        type: 'idea_generation',
        context
    };
}

function generateSpecializedPrompt(
    queryAnalysis: QueryAnalysis,
    context: string,
    papers: ResearchPaper[],
    patents: Patent[],
    previousIdeas?: string[]
): string {
    const analysis = analyzeContext(context);
    
    switch (queryAnalysis.type) {
        case 'idea_exploration':
            return generateExplorationPrompt(queryAnalysis.targetIdea || '', analysis);
        case 'idea_question':
            return generateQuestionPrompt(queryAnalysis.question || '', context, papers, patents, previousIdeas);
        default:
            return generateOptimizedPrompt(context, analysis);
    }
}

function analyzeResearchPaper(paper: ResearchPaper): ResearchAnalysis {
    const abstract = paper.abstract.toLowerCase();
    
    // Extract methodology using common patterns
    const methodology = abstract.match(/(methodology|approach|technique|method|using|developed|proposed|implemented):\s*([^.,]+)/gi) || [];
    
    // Extract key findings
    const keyFindings = abstract.match(/(found|discovered|demonstrated|showed|proved|achieved|results|conclusion):\s*([^.,]+)/gi) || [];
    
    // Extract limitations
    const limitations = abstract.match(/(limitation|constraint|challenge|restriction|drawback|issue):\s*([^.,]+)/gi) || [];
    
    // Extract future work
    const futureWork = abstract.match(/(future|next steps|further|proposed|suggested|recommended):\s*([^.,]+)/gi) || [];
    
    // Extract citations (simple pattern for now)
    const citations = abstract.match(/\b\d{4}\b/g) || [];

    return {
        methodology: methodology.map(m => m.split(':')[1].trim()),
        keyFindings: keyFindings.map(f => f.split(':')[1].trim()),
        limitations: limitations.map(l => l.split(':')[1].trim()),
        futureWork: futureWork.map(f => f.split(':')[1].trim()),
        citations: citations
    };
}

function analyzePatentClaims(patent: Patent): PatentAnalysis {
    const abstract = patent.abstract.toLowerCase();
    
    // Extract technology cluster from CPC codes
    const technologyCluster = patent.cpc_codes[0]?.split('/')[0] || 'Unknown';
    
    // Analyze claims
    const independentClaims = patent.claims.filter(claim => !claim.includes('according to'));
    const dependentClaims = patent.claims.filter(claim => claim.includes('according to'));
    
    // Extract key technologies
    const keyTechnologies = abstract.match(/(technology|system|device|method|apparatus|process):\s*([^.,]+)/gi) || [];
    
    // Extract market impact
    const potentialMarkets = abstract.match(/(market|application|use|industry|sector):\s*([^.,]+)/gi) || [];
    const competitiveAdvantages = abstract.match(/(advantage|benefit|improvement|enhancement):\s*([^.,]+)/gi) || [];
    const barriersToEntry = abstract.match(/(challenge|limitation|barrier|constraint):\s*([^.,]+)/gi) || [];

    return {
        technologyCluster,
        claimAnalysis: {
            independentClaims,
            dependentClaims,
            keyTechnologies: keyTechnologies.map(t => t.split(':')[1].trim())
        },
        marketImpact: {
            potentialMarkets: potentialMarkets.map(m => m.split(':')[1].trim()),
            competitiveAdvantages: competitiveAdvantages.map(a => a.split(':')[1].trim()),
            barriersToEntry: barriersToEntry.map(b => b.split(':')[1].trim())
        }
    };
}

// Update the main generateInnovationIdeas function
export async function generateInnovationIdeas(
    context: string,
    papers: ResearchPaper[],
    patents: Patent[],
    previousIdeas?: string[]
): Promise<string[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Analyze query type
        const queryAnalysis = analyzeQueryType(context);
        
        // Generate specialized prompt based on query type
        const specializedPrompt = generateSpecializedPrompt(
            queryAnalysis,
            context,
            papers,
            patents,
            previousIdeas
        );

        // Add papers and patents context
        const papersContext = papers.map((p, i) => {
            const analysis = analyzeResearchPaper(p);
            return `Paper: ${p.title}
Abstract: ${p.abstract}
Authors: ${p.authors.join(', ')}
Methodology: ${analysis.methodology.join(', ')}
Key Findings: ${analysis.keyFindings.join(', ')}
Limitations: ${analysis.limitations.join(', ')}
Future Work: ${analysis.futureWork.join(', ')}
Citations: ${analysis.citations.join(', ')}\n`;
        }).join('\n');

        const patentsContext = patents.map((p, i) => {
            const analysis = analyzePatentClaims(p);
            return `Patent: ${p.title}
Abstract: ${p.abstract}
Inventors: ${p.inventors.join(', ')}
Technology Cluster: ${analysis.technologyCluster}
Key Technologies: ${analysis.claimAnalysis.keyTechnologies.join(', ')}
Potential Markets: ${analysis.marketImpact.potentialMarkets.join(', ')}
Competitive Advantages: ${analysis.marketImpact.competitiveAdvantages.join(', ')}
Barriers to Entry: ${analysis.marketImpact.barriersToEntry.join(', ')}\n`;
        }).join('\n');

        // Add previous ideas if available
        const previousIdeasContext = previousIdeas ? `
PREVIOUS IDEAS:
${previousIdeas.join('\n\n')}
` : '';

        const fullPrompt = `${specializedPrompt}\n\n${previousIdeasContext}\n\nRELEVANT RESEARCH PAPERS WITH ANALYSIS:\n${papersContext}\n\nRELEVANT PATENTS WITH ANALYSIS:\n${patentsContext}`;

        // Generate content with optimized prompt
        const result = await model.generateContent(fullPrompt);
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