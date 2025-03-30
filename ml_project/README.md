# Innovation Gap T5 Transformer

This project implements a fine-tuned T5 transformer model for identifying innovation gaps between academic research papers and patents, providing enriched context for generating startup ideas.

## Project Structure

```
ml_project/
├── configs/
│   └── config.yaml         # Configuration parameters
├── data/
│   ├── raw/               # Raw input data
│   └── processed/         # Processed training data
├── models/                # Saved model checkpoints
├── src/
│   ├── train.py          # Main training script
│   └── data_processor.py # Data processing utilities
└── requirements.txt      # Project dependencies
```

## Features

- Fine-tuned T5 transformer for understanding industry-specific context
- Integration with arXiv API for research paper retrieval
- Integration with Gemini API for innovation idea generation
- Special token handling for structured input/output
- Comprehensive training pipeline with evaluation metrics

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file with:
```
GEMINI_API_KEY=your_gemini_api_key
```

## Data Preparation

1. Place your input data in `data/raw/input_data.json` with the following format:
```json
[
    {
        "industry": "AI/ML",
        "keywords": ["deep learning", "computer vision", "robotics"]
    },
    ...
]
```

2. Run the data processing script:
```bash
python src/data_processor.py
```

## Training

To train the model:

```bash
python src/train.py
```

The training process will:
- Load and preprocess the data
- Initialize the T5 model with special tokens
- Train the model with the specified configuration
- Save checkpoints and the final model

## Model Architecture

The model uses a T5 transformer architecture with the following modifications:
- Special tokens for structured input/output
- Custom preprocessing for industry-specific context
- Integration with external APIs for enriched context

## Configuration

Model and training parameters can be modified in `configs/config.yaml`:
- Model architecture settings
- Training hyperparameters
- Data processing parameters
- API configurations

## Usage

After training, the model can be used to:
1. Process user prompts about specific industries/niches
2. Extract relevant research papers and patents
3. Generate context-aware innovation ideas
4. Identify gaps in the market

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 