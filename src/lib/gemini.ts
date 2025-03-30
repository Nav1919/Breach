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

    IMPORTANT: For each idea, you MUST explicitly state which papers and patents were used in its development and how they contributed to identifying the innovation gap.
    `;
}

function analyzePatentClaims(patent: Patent): PatentAnalysis {
    // Extract independent and dependent claims
    const independentClaims = patent.claims.filter(claim => 
        claim.toLowerCase().includes('independent claim') || 
        claim.toLowerCase().includes('primary claim')
    );
    const dependentClaims = patent.claims.filter(claim => 
        claim.toLowerCase().includes('dependent claim') || 
        claim.toLowerCase().includes('secondary claim')
    );

    // Extract key technologies from claims
    const keyTechnologies = [...new Set(
        patent.claims.flatMap(claim => 
            claim.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []
        )
    )];

    return {
        technologyCluster: determineTechnologyCluster(patent),
        claimAnalysis: {
            independentClaims,
            dependentClaims,
            keyTechnologies
        },
        marketImpact: {
            potentialMarkets: extractPotentialMarkets(patent),
            competitiveAdvantages: extractCompetitiveAdvantages(patent),
            barriersToEntry: extractBarriersToEntry(patent)
        }
    };
}

function determineTechnologyCluster(patent: Patent): string {
    // Analyze CPC codes and abstract to determine technology cluster
    const cpcPatterns = {
        'AI/ML': ['G06N', 'G06F'],
        'Robotics': ['B25J', 'B60'],
        'Healthcare': ['A61B', 'A61M'],
        'CleanTech': ['Y02E', 'Y02W'],
        'IoT': ['H04L', 'H04W'],
        'Biotech': ['C12N', 'C12Q']
    };

    for (const [cluster, codes] of Object.entries(cpcPatterns)) {
        if (patent.cpc_codes.some((cpc: string) => codes.some(code => cpc.startsWith(code)))) {
            return cluster;
        }
    }
    return 'Other';
}

function extractPotentialMarkets(patent: Patent): string[] {
    // Extract potential markets from abstract and claims
    const marketKeywords = {
        'Healthcare': ['patient', 'medical', 'healthcare', 'treatment'],
        'Manufacturing': ['manufacturing', 'production', 'industrial'],
        'Consumer': ['user', 'consumer', 'personal'],
        'Enterprise': ['business', 'enterprise', 'commercial']
    };

    const text = `${patent.abstract} ${patent.claims.join(' ')}`.toLowerCase();
    return Object.entries(marketKeywords)
        .filter(([_, keywords]) => keywords.some(keyword => text.includes(keyword)))
        .map(([market]) => market);
}

function extractCompetitiveAdvantages(patent: Patent): string[] {
    // Extract competitive advantages from claims and abstract
    const advantagePatterns = [
        /improves? (?:the|a) (?:efficiency|performance|accuracy|speed)/i,
        /reduces? (?:costs?|time|energy|waste)/i,
        /increases? (?:reliability|safety|security|quality)/i
    ];

    const text = `${patent.abstract} ${patent.claims.join(' ')}`;
    return advantagePatterns
        .map(pattern => text.match(pattern)?.[0])
        .filter(Boolean) as string[];
}

function extractBarriersToEntry(patent: Patent): string[] {
    // Extract potential barriers to entry from claims
    const barrierPatterns = [
        /requires? (?:specialized|complex|advanced) (?:equipment|technology|expertise)/i,
        /depends? on (?:proprietary|patented|exclusive) (?:technology|system|method)/i,
        /needs? (?:significant|substantial|large) (?:investment|resources|infrastructure)/i
    ];

    const text = `${patent.abstract} ${patent.claims.join(' ')}`;
    return barrierPatterns
        .map(pattern => text.match(pattern)?.[0])
        .filter(Boolean) as string[];
}

function analyzeResearchPaper(paper: ResearchPaper): ResearchAnalysis {
    // Extract methodology using common patterns
    const methodologyPatterns = [
        /(?:methodology|approach|method|technique|algorithm|framework|system) used/i,
        /(?:implemented|developed|proposed|designed) (?:a|an|the) (?:novel|new|innovative)/i
    ];

    // Extract key findings
    const findingsPatterns = [
        /(?:results? show|demonstrates?|proves?|achieves?|improves?|reduces?|increases?)/i,
        /(?:found|discovered|identified|observed|measured|achieved)/i
    ];

    // Extract limitations
    const limitationsPatterns = [
        /(?:limitations?|constraints?|restrictions?|challenges?|drawbacks?)/i,
        /(?:however|but|although|despite|while|yet)/i
    ];

    // Extract future work
    const futureWorkPatterns = [
        /(?:future work|future research|future studies|future directions)/i,
        /(?:could be improved|needs further|requires additional|should be investigated)/i
    ];

    // Extract citations
    const citationPattern = /\[\d+\]|\(\d{4}\)|\[\w+\s+et\s+al\.\]/g;

    const text = paper.abstract;
    
    return {
        methodology: extractPatterns(text, methodologyPatterns),
        keyFindings: extractPatterns(text, findingsPatterns),
        limitations: extractPatterns(text, limitationsPatterns),
        futureWork: extractPatterns(text, futureWorkPatterns),
        citations: text.match(citationPattern) || []
    };
}

function extractPatterns(text: string, patterns: RegExp[]): string[] {
    return patterns
        .flatMap(pattern => {
            const matches = text.match(pattern);
            if (!matches) return [];
            const startIndex = text.indexOf(matches[0]);
            const endIndex = startIndex + matches[0].length;
            const context = text.slice(Math.max(0, startIndex - 50), Math.min(text.length, endIndex + 50));
            return [context.trim()];
        })
        .filter(Boolean);
}

// Add new function to analyze query type
function analyzeQueryType(query: string): QueryAnalysis {
    // Patterns for different query types
    const explorationPatterns = [
        /explore (?:idea|concept|solution) (?:about|regarding|concerning) (.+)/i,
        /tell me more about (?:the )?(?:idea|concept|solution) (?:about|regarding|concerning) (.+)/i,
        /dive deeper into (?:the )?(?:idea|concept|solution) (?:about|regarding|concerning) (.+)/i,
        /elaborate on (?:the )?(?:idea|concept|solution) (?:about|regarding|concerning) (.+)/i
    ];

    const questionPatterns = [
        /how (?:does|would|will) (?:the )?(?:idea|concept|solution) (.+)/i,
        /what (?:are|is) (?:the )?(?:challenges|limitations|benefits|risks) (?:of|for) (?:the )?(?:idea|concept|solution) (.+)/i,
        /why (?:is|are) (?:the )?(?:idea|concept|solution) (.+)/i
    ];

    // Check for exploration patterns
    for (const pattern of explorationPatterns) {
        const match = query.match(pattern);
        if (match) {
            return {
                type: 'idea_exploration',
                targetIdea: match[1].trim(),
                context: query
            };
        }
    }

    // Check for question patterns
    for (const pattern of questionPatterns) {
        const match = query.match(pattern);
        if (match) {
            return {
                type: 'idea_question',
                question: match[0].trim(),
                context: query
            };
        }
    }

    // Default to idea generation if no specific patterns match
    return {
        type: 'idea_generation',
        context: query
    };
}

// Add new function to generate specialized prompts
function generateSpecializedPrompt(
    queryAnalysis: QueryAnalysis,
    context: string,
    papers: ResearchPaper[],
    patents: Patent[],
    previousIdeas?: string[]
): string {
    switch (queryAnalysis.type) {
        case 'idea_exploration':
            return generateExplorationPrompt(queryAnalysis.targetIdea!, context, papers, patents, previousIdeas);
        case 'idea_question':
            return generateQuestionPrompt(queryAnalysis.question!, context, papers, patents, previousIdeas);
        default:
            return generateOptimizedPrompt(context, analyzeContext(context));
    }
}

function generateExplorationPrompt(
    targetIdea: string,
    context: string,
    papers: ResearchPaper[],
    patents: Patent[],
    previousIdeas?: string[]
): string {
    return `
    Deep dive analysis of the following innovation idea: "${targetIdea}"

    CONTEXT:
    ${context}

    Please provide a comprehensive analysis including:

    1. TECHNICAL DETAILS:
       - Detailed technical architecture
       - Required technologies and infrastructure
       - Implementation challenges and solutions
       - Integration points with existing systems

    2. MARKET ANALYSIS:
       - Detailed market segmentation
       - Target customer personas
       - Competitive landscape analysis
       - Market entry strategies
       - Growth potential and scalability

    3. BUSINESS MODEL:
       - Revenue streams
       - Cost structure
       - Key partnerships
       - Resource requirements
       - Timeline for development and launch

    4. RISK ANALYSIS:
       - Technical risks and mitigation strategies
       - Market risks and contingency plans
       - Regulatory considerations
       - Intellectual property strategy

    5. IMPLEMENTATION ROADMAP:
       - Phase 1: Initial development and MVP
       - Phase 2: Market testing and refinement
       - Phase 3: Scaling and expansion
       - Resource allocation and milestones

    6. SUPPORTING RESEARCH:
       - Relevant research papers and their implications
       - Related patents and their impact
       - Market trends and opportunities
       - Industry best practices

    Please provide specific, actionable insights and concrete next steps for implementation.
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
        6. Sources used

        In your response, include the research papers as a footnote citation. Provide the sources for papers used.

        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error analyzing data:", error);
        throw new Error("Failed to analyze data");
    }
}