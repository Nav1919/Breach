import os
import torch
from transformers import (
    T5ForConditionalGeneration,
    T5Tokenizer,
    DataCollatorForSeq2Seq,
    Seq2SeqTrainingArguments,
    Seq2SeqTrainer,
)
from datasets import load_dataset
from dotenv import load_dotenv
import wandb
from accelerate import Accelerator

# Load environment variables
load_dotenv()

class InnovationGapT5Trainer:
    def __init__(self, model_name="t5-base"):
        self.model_name = model_name
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        self.model = T5ForConditionalGeneration.from_pretrained(model_name)
        
        # Set special tokens for our task
        self.tokenizer.add_special_tokens({
            "additional_special_tokens": [
                "<industry>", "</industry>",
                "<keywords>", "</keywords>",
                "<research>", "</research>",
                "<patent>", "</patent>",
                "<innovation>", "</innovation>"
            ]
        })
        self.model.resize_token_embeddings(len(self.tokenizer))
        
        # Training arguments
        self.training_args = Seq2SeqTrainingArguments(
            output_dir="./models",
            num_train_epochs=3,
            per_device_train_batch_size=4,
            per_device_eval_batch_size=4,
            warmup_steps=500,
            weight_decay=0.01,
            logging_dir="./logs",
            logging_steps=100,
            save_strategy="epoch",
            evaluation_strategy="epoch",
            load_best_model_at_end=True,
            report_to="wandb",
            push_to_hub=False,
        )
        
        # Initialize accelerator
        self.accelerator = Accelerator()
        
    def preprocess_function(self, examples):
        inputs = examples["input_text"]
        targets = examples["target_text"]
        
        model_inputs = self.tokenizer(
            inputs,
            max_length=512,
            truncation=True,
            padding="max_length"
        )
        
        labels = self.tokenizer(
            targets,
            max_length=256,
            truncation=True,
            padding="max_length"
        )
        
        model_inputs["labels"] = labels["input_ids"]
        return model_inputs
    
    def train(self, train_dataset, eval_dataset):
        # Initialize data collator
        data_collator = DataCollatorForSeq2Seq(
            tokenizer=self.tokenizer,
            model=self.model,
            padding=True
        )
        
        # Initialize trainer
        trainer = Seq2SeqTrainer(
            model=self.model,
            args=self.training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            data_collator=data_collator,
            compute_metrics=self.compute_metrics
        )
        
        # Train the model
        trainer.train()
        
        # Save the model
        trainer.save_model("./models/final_model")
        self.tokenizer.save_pretrained("./models/final_model")
    
    def compute_metrics(self, eval_pred):
        predictions, labels = eval_pred
        decoded_preds = self.tokenizer.batch_decode(predictions, skip_special_tokens=True)
        decoded_labels = self.tokenizer.batch_decode(labels, skip_special_tokens=True)
        
        # Add your custom metrics here
        # For example: ROUGE, BLEU, etc.
        return {}

def main():
    # Initialize wandb
    wandb.init(project="innovation-gap-t5")
    
    # Initialize trainer
    trainer = InnovationGapT5Trainer()
    
    # Load your dataset
    # This is a placeholder - you'll need to implement your own dataset loading
    dataset = load_dataset("your_dataset_path")
    
    # Preprocess the dataset
    tokenized_datasets = dataset.map(
        trainer.preprocess_function,
        batched=True,
        remove_columns=dataset["train"].column_names
    )
    
    # Train the model
    trainer.train(
        train_dataset=tokenized_datasets["train"],
        eval_dataset=tokenized_datasets["validation"]
    )
    
    # Close wandb
    wandb.finish()

if __name__ == "__main__":
    main() 