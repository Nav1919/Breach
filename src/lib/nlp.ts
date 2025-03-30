import { pipeline } from '@xenova/transformers';

interface SentimentResult {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
}

interface TopicModel {
    topic: string;
    keywords: string[];
    documents: string[];
}

interface KeywordCluster {
    cluster: string;
    keywords: string[];
    sentiment: SentimentResult;
}

// Initialize sentiment analysis pipeline
const sentimentAnalyzer = pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');

// Initialize topic modeling pipeline
const topicModeler = pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');

// Initialize keyword extraction pipeline
const keywordExtractor = pipeline('token-classification', 'Xenova/bert-base-uncased-ner');

// Predefined topics for classification
const predefinedTopics = [
    'Artificial Intelligence',
    'Machine Learning',
    'Robotics',
    'Healthcare',
    'Clean Energy',
    'IoT',
    'Cybersecurity',
    'Biotechnology',
    'FinTech',
    'E-commerce'
];

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
        const result = await sentimentAnalyzer(text);
        return {
            label: result[0].label.toLowerCase() as 'positive' | 'negative' | 'neutral',
            score: result[0].score
        };
    } catch (error) {
        console.error('Error in sentiment analysis:', error);
        return { label: 'neutral', score: 0.5 };
    }
}

export async function extractTopics(text: string): Promise<TopicModel[]> {
    try {
        const result = await topicModeler(text, predefinedTopics);
        return result.labels.map((topic: string, index: number) => ({
            topic,
            keywords: extractKeywordsFromTopic(topic),
            documents: [text]
        }));
    } catch (error) {
        console.error('Error in topic modeling:', error);
        return [];
    }
}

export async function clusterKeywords(texts: string[]): Promise<KeywordCluster[]> {
    try {
        // Extract keywords from all texts
        const keywords = await Promise.all(
            texts.map(async (text) => {
                const result = await keywordExtractor(text);
                return result.map((token: any) => token.word);
            })
        );

        // Flatten and deduplicate keywords
        const uniqueKeywords = [...new Set(keywords.flat())];

        // Group keywords by similarity
        const clusters = groupKeywordsBySimilarity(uniqueKeywords);

        // Analyze sentiment for each cluster
        const clustersWithSentiment = await Promise.all(
            clusters.map(async (cluster) => {
                const sentiment = await analyzeSentiment(cluster.keywords.join(' '));
                return {
                    ...cluster,
                    sentiment
                };
            })
        );

        return clustersWithSentiment;
    } catch (error) {
        console.error('Error in keyword clustering:', error);
        return [];
    }
}

function extractKeywordsFromTopic(topic: string): string[] {
    // Simple keyword extraction based on topic
    const topicKeywords: Record<string, string[]> = {
        'Artificial Intelligence': ['neural networks', 'deep learning', 'AI', 'artificial intelligence'],
        'Machine Learning': ['ML', 'training', 'model', 'algorithm', 'data'],
        'Robotics': ['robot', 'automation', 'mechanical', 'sensors', 'actuators'],
        'Healthcare': ['medical', 'patient', 'treatment', 'diagnosis', 'health'],
        'Clean Energy': ['renewable', 'solar', 'wind', 'energy', 'sustainable'],
        'IoT': ['connected', 'sensors', 'devices', 'network', 'wireless'],
        'Cybersecurity': ['security', 'encryption', 'privacy', 'protection', 'threat'],
        'Biotechnology': ['genetic', 'DNA', 'protein', 'cell', 'molecular'],
        'FinTech': ['financial', 'payment', 'banking', 'transaction', 'blockchain'],
        'E-commerce': ['online', 'shopping', 'retail', 'marketplace', 'digital']
    };

    return topicKeywords[topic] || [];
}

function groupKeywordsBySimilarity(keywords: string[]): { cluster: string; keywords: string[] }[] {
    // Simple similarity grouping based on word overlap
    const clusters: { cluster: string; keywords: string[] }[] = [];
    const usedKeywords = new Set<string>();

    keywords.forEach(keyword => {
        if (usedKeywords.has(keyword)) return;

        const similarKeywords = keywords.filter(k => 
            k !== keyword && 
            !usedKeywords.has(k) &&
            (k.includes(keyword) || keyword.includes(k))
        );

        if (similarKeywords.length > 0) {
            clusters.push({
                cluster: keyword,
                keywords: [keyword, ...similarKeywords]
            });
            [keyword, ...similarKeywords].forEach(k => usedKeywords.add(k));
        }
    });

    // Add remaining keywords as individual clusters
    keywords.forEach(keyword => {
        if (!usedKeywords.has(keyword)) {
            clusters.push({
                cluster: keyword,
                keywords: [keyword]
            });
            usedKeywords.add(keyword);
        }
    });

    return clusters;
}

export async function analyzeMarketResearch(text: string): Promise<{
    sentiment: SentimentResult;
    topics: TopicModel[];
    keywords: KeywordCluster[];
}> {
    const [sentiment, topics, keywords] = await Promise.all([
        analyzeSentiment(text),
        extractTopics(text),
        clusterKeywords([text])
    ]);

    return {
        sentiment,
        topics,
        keywords
    };
} 