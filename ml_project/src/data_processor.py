import os
import json
import pandas as pd
from datasets import Dataset
from typing import List, Dict, Any
import arxiv
import google.generativeai as genai
from dotenv import load_dotenv

class InnovationGapDataProcessor:
    def __init__(self):
        load_dotenv()
        # Initialize Gemini API
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-pro')
        
    def fetch_research_papers(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Fetch relevant research papers from arXiv."""
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance
        )
        
        papers = []
        for paper in search.results():
            papers.append({
                "title": paper.title,
                "abstract": paper.summary,
                "authors": [author.name for author in paper.authors],
                "published": paper.published,
                "pdf_url": paper.pdf_url
            })
        return papers
    
    def generate_innovation_ideas(self, context: str) -> List[str]:
        """Generate innovation ideas using Gemini API."""
        prompt = f"""
        Based on the following context, generate 5 innovative startup ideas that address gaps in the market:
        
        Context: {context}
        
        For each idea, provide:
        1. A brief description
        2. Target market
        3. Key differentiators
        4. Potential challenges
        """
        
        response = self.model.generate_content(prompt)
        return response.text.split("\n\n")
    
    def prepare_training_data(self, input_file: str) -> Dataset:
        """Prepare training data from input file."""
        # Load input data
        with open(input_file, 'r') as f:
            data = json.load(f)
        
        processed_data = []
        for item in data:
            # Fetch relevant research papers
            papers = self.fetch_research_papers(item["industry"])
            
            # Generate innovation ideas
            context = f"Industry: {item['industry']}\nKeywords: {', '.join(item['keywords'])}\n"
            context += f"Research Papers: {json.dumps(papers, indent=2)}"
            
            ideas = self.generate_innovation_ideas(context)
            
            # Prepare training example
            processed_data.append({
                "input_text": f"<industry>{item['industry']}</industry> "
                             f"<keywords>{', '.join(item['keywords'])}</keywords> "
                             f"<research>{json.dumps(papers)}</research>",
                "target_text": f"<innovation>{json.dumps(ideas)}</innovation>"
            })
        
        # Convert to HuggingFace Dataset
        df = pd.DataFrame(processed_data)
        dataset = Dataset.from_pandas(df)
        
        # Split into train and validation
        dataset = dataset.train_test_split(test_size=0.1)
        
        return dataset
    
    def save_dataset(self, dataset: Dataset, output_dir: str):
        """Save processed dataset to disk."""
        os.makedirs(output_dir, exist_ok=True)
        dataset.save_to_disk(output_dir)

def main():
    processor = InnovationGapDataProcessor()
    
    # Process training data
    dataset = processor.prepare_training_data("data/raw/input_data.json")
    
    # Save processed dataset
    processor.save_dataset(dataset, "data/processed")

if __name__ == "__main__":
    main() 