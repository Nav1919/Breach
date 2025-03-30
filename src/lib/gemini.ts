// lib/gemini.ts - Updated version

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeData(market: string, keywords: string[], niche: string, papers: string[], patents: string[]) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"})
        const prompt = `
        You are an innovation expert specializing in identifying groundbreaking new inventions that bridge technology gaps.
        
        Industry: ${market}
        Niche: ${niche}
        Keywords: ${keywords.join(", ")}

        Relevant Research Papers:
        ${papers.map((p, i) => `${i + 1}. ${p}`).join("\n")}

        Existing Patents from Different Domains:
        ${patents.map((p, i) => `${i + 1}. ${p}`).join("\n")}

        Task:
        Generate a COMPLETELY NEW invention idea that has never been patented before. This should be:
        1. A genuine innovation that combines insights from the different domains in unexpected ways
        2. Technically feasible with current or near-future technology
        3. Potentially valuable in solving real-world problems
        4. NOT simply an incremental improvement on existing patents
        
        Think step by step:
        1. Identify key technologies and principles from each domain
        2. Find unexpected connections between these technologies
        3. Imagine a novel application that nobody has created yet
        4. Consider why this hasn't been invented before (technical challenges, market barriers)
        5. Describe how your invention overcomes these challenges

        Return structured output:
        NEW INVENTION CONCEPT: [Catchy name for your invention]
        
        DESCRIPTION: [2-3 sentence overview of what it is]
        
        HOW IT WORKS: [Technical explanation of how the invention functions, including specific mechanisms]
        
        KEY INNOVATION: [What makes this truly novel and not obvious from existing patents]
        
        REAL-WORLD APPLICATIONS: [3-5 specific use cases]
        
        TECHNICAL CHALLENGES: [What engineering hurdles would need to be overcome]
        
        MARKET POTENTIAL: [Who would benefit from this invention and why]
        `;
        const response = await model.generateContent(prompt)
        const result = await response.response
        return result.text()
    } catch (error) {
        console.error("Error processing innovation data: ", error)
        return "Failed to generate idea: Gemini could not process the prompt."
    }
}