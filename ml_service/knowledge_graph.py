import sqlite3
import os

class KnowledgeGraph:
    def __init__(self):
        self.db_path = "kg.db"
        self._initialize_db()

    def _initialize_db(self):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS facts (
                id INTEGER PRIMARY KEY,
                entity TEXT,
                claim TEXT,
                is_true BOOLEAN
            )
        ''')
        
        # Check if empty, then seed
        cur.execute("SELECT COUNT(*) FROM facts")
        if cur.fetchone()[0] == 0:
            seed_data = [
                ("vaccine", "vaccines are generally safe and effective", True),
                ("vaccine", "microchips in vaccines", False),
                ("climate change", "climate change is driven by human activities", True),
                ("5g", "5g networks cause viral infections", False),
                ("bleach", "drinking bleach cures illnesses", False),
                ("earth", "the earth is round", True),
                ("earth", "the earth is flat", False)
            ]
            cur.executemany("INSERT INTO facts (entity, claim, is_true) VALUES (?, ?, ?)", seed_data)
            conn.commit()
        conn.close()

    def verify_entities(self, entities: list) -> dict:
        """
        Takes a list of named entities extracted by Spacy.
        Returns a dict with 'modifier' score and an 'explanation' string.
        """
        if not entities:
            return {"modifier": 0.0, "explanation": ""}

        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        
        mismatch_found = []
        match_found = []
        
        for ent in entities:
            ent_lower = ent.lower()
            cur.execute("SELECT claim, is_true FROM facts WHERE entity = ?", (ent_lower,))
            results = cur.fetchall()
            
            # Simple simulation: if the entity exists in our DB, we check if the context implies a false claim.
            # In a real air-gapped system, we'd do semantic similarity of the full text against the claim.
            # Here, we just return that the entity has known disputes.
            for claim, is_true in results:
                if not is_true:
                    mismatch_found.append(claim)
                else:
                    match_found.append(claim)
                    
        conn.close()

        modifier = 0.0
        explanation_parts = []
        
        if mismatch_found:
            modifier -= 0.2
            explanation_parts.append(f"Contains entities associated with known false narratives (e.g., '{mismatch_found[0]}').")
            
        if match_found:
            modifier += 0.1
            explanation_parts.append(f"Mentioned entities align with verified facts.")
            
        return {
            "modifier": modifier,
            "explanation": " ".join(explanation_parts)
        }
