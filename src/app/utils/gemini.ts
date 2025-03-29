import { GoogleGenerativeAI, GenerativeModel, EnhancedGenerateContentResponse } from '@google/generative-ai'
import { Patent } from '../types/patent';
import { InnovationGap } from '../types/innovation';

export const initializeGemini = () : GoogleGenerativeAI => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key environment variable is not set.")
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

export const getEmbeddingModel = (): GenerativeModel => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    return genAI.getGenerativeModel({model: "embedding-001"})
}

export const getGenerationModel = (): GenerativeModel => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    return genAI.getGenerativeModel({model: "gemini-1.5-pro"})
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const embeddingModel = getEmbeddingModel()
    const result = await embeddingModel.embedContent(text)
    return result.embedding.values
}

export async function generatePatentEmbedding(patent: Patent): Promise<number[]> {
    const text = `Title: ${patent.title}\nAbstract: ${patent.abstract}\nCategories: ${patent.cpc_codes.join(', ')}`
    return generateEmbedding(text)
}

// Fix the return type - should return a single innovation, not an array
export async function generateInnovationIdea(patent1: Patent, patent2: Patent): Promise<InnovationGap | null> {
    // Rest of the function remains the same
    
    try {
        const result = await model.generateContent(prompt)
        const res = result.response
        const resText = res.text()
        const jsonMatch = resText.match(/({[\s\S]*})/) // Fix the regex pattern
        const jsonStr = jsonMatch ? jsonMatch[0] : resText
        const innovationData = JSON.parse(jsonStr)
        
        // Return a single InnovationGap object, not an array
        return {
            title: innovationData.innovationTitle,
            description: innovationData.description,
            potentialUseCase: innovationData.potentialUseCase,
            technicalChallenges: innovationData.technicalChallenges,
            marketPotential: innovationData.marketPotential,
            patentabilityScore: innovationData.patentabilityScore,
            sourcePatents: [patent1, patent2],
            score: calculateInnovationScore(innovationData) // Use the calculation function
        }
    } catch (error) {
        console.error("Error getting innovation idea: ", error)
        return null
    }
}

// Fix the return type - now returns an array or null
export async function getMultipleIdeas(patentCombinations: [Patent, Patent][]): Promise<InnovationGap[]> {
    const innovations: InnovationGap[] = [];
    
    for (const [patent1, patent2] of patentCombinations) {
        try {
            const innovation = await generateInnovationIdea(patent1, patent2)
            if (innovation) {
                innovations.push(innovation) // Now correctly pushing a single object
            }
        } catch (error) {
            console.error("Error getting innovation for patent pair: ", error)
        }
    }
    
    return innovations // Always return the array, even if empty
}

function calculateInnovationScore(innovationData: any): number {
    const marketScore = typeof innovationData.marketPotential === "number" ? innovationData.marketPotential : parseInt(innovationData.patentabilityScore) || 5
    const patentScore = typeof innovationData.patentabilityScore === "number" ? innovationData.marketPotential : parseInt(innovationData.patentabilityScore) || 5
    return Math.round((marketScore * 0.6 + patentScore * 0.4) * 10)
}

export async function findTrendBasedInnovations(techTrend: string, patents: Patent[]): Promise<InnovationGap[]> {
    const model = getGenerationModel();

    // Format patent data
    const patentDescriptions = patents.slice(0, 5).map(p => 
        `Patent: ${p.title}\nAbstract: ${p.abstract}\nCategories: ${p.cpc_codes.join(', ')}`
    ).join('\n\n');

    const prompt = `You are an expert innovation consultant who specializes in identifying potential new inventions.

    I'm interested in innovations related to the trend: "${techTrend}"

    Here are some recent patents in related areas:

    ${patentDescriptions}

    Based on these patents and the trend, identify 2-3 potential innovation opportunities that:
    1. Fill gaps in the current patent landscape
    2. Align with the specified technology trend
    3. Have commercial potential
    4. Could be patentable

    For each innovation, provide:
    - innovationTitle: A concise name (max 10 words)
    - description: A detailed description (100-150 words)
    - potentialUseCase: Primary use case and target market
    - technicalChallenges: Key technical hurdles
    - marketPotential: Commercial viability score 1-10 with reasoning
    - patentabilityScore: How likely this could be patented (1-10)
    - relevantPatents: Array of indexes (0-based) of patents from the list that relate to this innovation

    Format your response as a JSON array of innovations.
    `;
  
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        // Extract the JSON array from the response
        const jsonMatch = responseText.match(/(\[[\s\S]*\])/);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
        // Parse the JSON response
        const innovationsData = JSON.parse(jsonStr);
        // Map to our InnovationGap type
        return innovationsData.map((item: any) => {
            const relevantPatents = (item.relevantPatents || []).map((idx: number) => patents[idx]).filter(Boolean);
            return {
                title: item.innovationTitle,
                description: item.description,
                sourcePatents: relevantPatents,
                potentialUseCase: item.potentialUseCase,
                technicalChallenges: item.technicalChallenges,
                marketPotential: item.marketPotential,
                patentabilityScore: item.patentabilityScore,
                score: calculateInnovationScore(item)
            };
        });
    } catch (error) {
        console.error('Error finding trend-based innovations:', error);
        return [];
    }
  }