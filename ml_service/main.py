from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from engine import DetectionEngine

app = FastAPI(title="Fake News Detection API", version="1.0.0")
engine = DetectionEngine()

class ArticleRequest(BaseModel):
    articleId: str
    title: str
    content: str

class AnalysisResponse(BaseModel):
    articleId: str
    prediction: str
    score: int
    confidence: float
    explanation: str

@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze(article: ArticleRequest):
    if not engine.model:
        raise HTTPException(status_code=503, detail="Detection models are not loaded. Try restarting after training.")
        
    result = engine.analyze_article({
        "title": article.title,
        "content": article.content
    })
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return AnalysisResponse(
        articleId=article.articleId,
        prediction=result["prediction"],
        score=result["score"],
        confidence=result["confidence"],
        explanation=result["explanation"]
    )

class HistoryItem(BaseModel):
    articleId: str
    title: str
    category: str
    content: str
    
class RecommendationRequest(BaseModel):
    userId: str
    interestedTopics: list[str] = []
    history: list[HistoryItem]
    candidates: list[HistoryItem]

@app.post("/api/recommend")
def recommend(req: RecommendationRequest):
    # Retrieve explicitly chosen categories
    explicit_topics = [t.lower() for t in req.interestedTopics]
    
    # Extract implicitly preferred categories
    history_categories = [item.category.lower() for item in req.history]
    
    scored_candidates = []
    for cand in req.candidates:
        score = 0
        cand_cat = cand.category.lower()
        
        # Huge boost if matches explicit explicit user settings
        if cand_cat in explicit_topics:
            score += 20
            
        # Standard boost if matches implicit reading history
        if cand_cat in history_categories:
            score += 10
        # Check title overlap as well
        words_in_history = set()
        for item in req.history:
            words_in_history.update(item.title.lower().split())
            
        cand_words = set(cand.title.lower().split())
        score += len(words_in_history.intersection(cand_words))
        
        scored_candidates.append((score, cand.articleId))
        
    # Sort descending by score
    scored_candidates.sort(key=lambda x: x[0], reverse=True)
    top_ids = [c[1] for c in scored_candidates[:5]]
    
    return {"recommendedIds": top_ids}

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": engine.model is not None}
