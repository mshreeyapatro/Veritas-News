import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
import pickle
import os

class ModelTrainer:
    def __init__(self):
        self.model_path = "fake_news_model.pkl"
        self.vectorizer_path = "vectorizer.pkl"

    def load_dataset(self):
        print("Loading real datasets...")
        fake_df = pd.read_csv('../data/Fake.csv')
        true_df = pd.read_csv('../data/True.csv')
        
        # Add labels
        fake_df['label'] = 0
        true_df['label'] = 1
        
        # Concatenate and shuffle
        df = pd.concat([fake_df, true_df], ignore_index=True)
        # We can combine title and text or just use text. Let's use text as it's the primary content
        # For better accuracy, we could combine: df['content'] = df['title'] + " " + df['text']
        # But text should be sufficient. Let's combine them for robustness.
        df['text'] = df['title'] + " " + df['text']
        
        print(f"Loaded dataset with {len(df)} total articles.")
        return df

    def train_model(self, dataset: pd.DataFrame):
        X = dataset['text'].fillna('')
        y = dataset['label']
        
        print("Splitting datasets...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        print("Vectorizing text data...")
        vectorizer = TfidfVectorizer(stop_words='english', max_df=0.7)
        tfidf_train = vectorizer.fit_transform(X_train)
        
        # Using SGDClassifier as recommended by sklearn warning
        print("Training model...")
        pac = SGDClassifier(loss='hinge', penalty=None, learning_rate='pa1', eta0=1.0)
        pac.fit(tfidf_train, y_train)
        
        print("Evaluating model...")
        tfidf_test = vectorizer.transform(X_test)
        score = pac.score(tfidf_test, y_test)
        print(f"Model trained with accuracy: {score * 100:.2f}%")
        
        with open(self.model_path, 'wb') as model_file:
            pickle.dump(pac, model_file)
            
        with open(self.vectorizer_path, 'wb') as vec_file:
            pickle.dump(vectorizer, vec_file)
            
        print("Model and vectorizer saved.")

if __name__ == "__main__":
    trainer = ModelTrainer()
    df = trainer.load_dataset()
    trainer.train_model(df)
