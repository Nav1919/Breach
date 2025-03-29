import { GoogleGenerativeAI } from '@google/generative-ai'
import { Patent } from '@/types/patent'

export const generateInnovationIdeas = async (patents: Patent[]) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const 
}