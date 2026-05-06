import pickle
import os
import re
import spacy
from knowledge_graph import KnowledgeGraph

class NLPProcessor:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Warning: en_core_web_sm not found. Ensure spacy model is downloaded.")
            self.nlp = None

    def preprocess_text(self, text: str) -> str:
        text = str(text).lower()
        text = re.sub(r'[^\w\s]', '', text)
        return text

    def extract_entities(self, text: str) -> list:
        if not self.nlp:
            return []
        doc = self.nlp(text)
        # Extract ORG, PERSON, GPE, LOC to check against Knowledge Graph
        entities = [ent.text for ent in doc.ents if ent.label_ in ['ORG', 'PERSON', 'GPE', 'LOC', 'PRODUCT']]
        # fallback: just pick random n-grams if NER is weak? For our mock DB we want known strings like 'vaccine'.
        # Since spacy might not label "vaccine" as a specific entity, we'll augment entities with direct nouns:
        nouns = [token.text for token in doc if token.pos_ == 'NOUN']
        return list(set(entities + nouns))

class FeatureExtractor:
    def extract_features(self, article: dict) -> str:
        title = article.get('title', '')
        content = article.get('content', '')
        return f"{title} {content}"

class DetectionEngine:
    def __init__(self):
        self.model_path = "fake_news_model.pkl"
        self.vectorizer_path = "vectorizer.pkl"
        self.model = None
        self.vectorizer = None
        self.nlp = NLPProcessor()
        self.extractor = FeatureExtractor()
        self.kg = KnowledgeGraph()
        self.load_models()

    def load_models(self):
        if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
            with open(self.model_path, 'rb') as model_file:
                self.model = pickle.load(model_file)
            with open(self.vectorizer_path, 'rb') as vec_file:
                self.vectorizer = pickle.load(vec_file)
        else:
            print("Models not found. Please run trainer.py first.")

    def analyze_article(self, article: dict) -> dict:
        if not self.model or not self.vectorizer:
            return {"error": "Model not trained yet."}

        raw_text = self.extractor.extract_features(article)
        processed_text = self.nlp.preprocess_text(raw_text)
        
        tfidf_text = self.vectorizer.transform([processed_text])
        prediction = self.model.predict(tfidf_text)[0]
        
        decision = self.model.decision_function(tfidf_text)[0]
        confidence = abs(decision)
        scaled_confidence = min(max(confidence, 0.0), 2.0) / 2.0
        
        # 1. Base ML scoring
        is_fake = (prediction == 0)
        final_score = (0.2 if is_fake else 0.8)

        base_explanation = f"ML Core analysis suggests this is {'fake' if is_fake else 'authentic'} (Confidence: {round(scaled_confidence * 100)}%)."
        
        # 2. Extract Entities using Spacy
        entities = self.nlp.extract_entities(raw_text)
        
        # 3. Knowledge Graph Cross-referencing
        kg_result = self.kg.verify_entities(entities)
        
        final_score += kg_result["modifier"]
        final_score = max(0.0, min(1.0, final_score))
        
        final_prediction = "fake" if final_score < 0.5 else "real"
        confidence_pct = max(final_score, 1 - final_score)
        
        # Construct dynamic explanation combining ML and Knowledge Graph outputs
        explanation = base_explanation
        if kg_result["explanation"]:
             explanation += f" Knowledge Graph Alert: {kg_result['explanation']}"
        
        return {
            "prediction": final_prediction,
            "score": round(final_score * 100),
            "confidence": round(confidence_pct * 100, 1),
            "explanation": explanation
        }
