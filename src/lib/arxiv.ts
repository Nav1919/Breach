import { parseStringPromise } from "xml2js"

export async function fetchArxivPapers(query: string, maxResults: number = 5) {
  const baseUrl = "http://export.arxiv.org/api/query";
  const searchQuery = `search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
  const url = `${baseUrl}?${searchQuery}`;

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlData = await response.text();
    const data = await parseStringPromise(xmlData);
    return (data.feed.entry || []).map((entry: any) => ({
      title: entry.title[0],
      authors: entry.author.map((a: any) => a.name[0]),
      summary: entry.summary[0],
      published: entry.published[0],
      link: entry.id[0]
    }));
  } catch (error) {
    console.error("Error fetching ArXiv data:", error);
    throw new Error("Failed to fetch ArXiv papers");
  }
}