import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeData(market: string, keywords: string[], niche: string, papers: string[], patents: string[]) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro"})
        const prompt = `
        Industry: ${market}
        Niche: ${niche}
        Keywords: ${keywords.join(", ")}

        Relevant Research Papers:
        ${papers.map((p, i) => `${i + 1}. ${p}`).join("\n")}

        Existing Patents:
        ${patents.map((p, i) => `${i + 1}. ${p}`).join("\n")}

        Task:
        - Identify potential innovation gaps.
        - Suggest new invention ideas that combine insights from research and patents.
        - Explain real-world applications and why this hasn’t been done before.

        Return structured output:
        New Innovation Idea:
        How It Works:
        Potential Applications:
        Why It's Unique:
        Possible Challenges:
        `;
        const response = await model.generateContent(prompt)
        const result = await response.response
        return result.text()
    } catch (error) {
        console.error("Error processing innovation data: ", error)
        return "Failed to generate idea: Gemini could not process the prompt."
    }
}