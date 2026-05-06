const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const NewsArticle = require('./models/NewsArticle');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/news_platform';

// Helper function to carefully parse CSV, grab random subset
const parseCSV = (filePath, limit) => {
  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Random chance to include, helps randomize the slice
        if (Math.random() < 0.05 && results.length < limit) {
          results.push(data);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => reject(err));
  });
};

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    await NewsArticle.deleteMany({});
    console.log('Cleared existing articles');

    const fakePath = path.join(__dirname, '../data/Fake.csv');
    const truePath = path.join(__dirname, '../data/True.csv');

    console.log('Parsing CSVs...');
    let fakeArticles, trueArticles;
    
    try {
        fakeArticles = await parseCSV(fakePath, 30);
        trueArticles = await parseCSV(truePath, 30);
    } catch(err) {
        console.error("Failed to read CSV. Are they present at /data/Fake.csv and /data/True.csv?", err);
        process.exit(1);
    }
    
    // Combine and shuffle arrays
    let allArticles = [...fakeArticles, ...trueArticles];
    allArticles = allArticles.sort(() => Math.random() - 0.5);

    console.log(`Processing ${allArticles.length} articles with the ML service...`);
    
    for (const data of allArticles) {
      if (!data.title || !data.text) continue;
        
      const newArticleBody = {
        title: data.title,
        content: data.text,
        author: 'Syndicated Feed',
        category: data.subject || 'General',
        publicationDate: isNaN(new Date(data.date).getTime()) ? new Date() : new Date(data.date),
        sourceUrl: ''
      };

      try {
        const mlRes = await fetch('http://127.0.0.1:8000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId: "temp", title: newArticleBody.title, content: newArticleBody.content })
        });
        
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          newArticleBody.detectionResult = {
            prediction: mlData.prediction,
            score: mlData.score,
            confidence: mlData.confidence,
            explanation: mlData.explanation
          };
        } else {
           console.log("ML service error or not running");
        }
      } catch (e) {
        console.log("ML service not reachable. Please start uvicorn before seeding.");
      }
      
      await NewsArticle.create(newArticleBody);
    }
    
    console.log('Database successfully seeded with authentic datasets!');
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
