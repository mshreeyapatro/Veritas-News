# Unified News Reading Platform with Fake News Detection

This is a comprehensive, full-stack web application designed to serve news articles while computationally verifying their authenticity. The architecture features a React frontend, a Node.js/Express backend API mapping role-based access, and a powerful Python FastAPI microservice that utilizes Machine Learning (`SGDClassifier`) and Named Entity Recognition (`Spacy`) backed by an air-gapped SQLite Knowledge Graph to detect fake news.

## 🚀 Prerequisites

To run this platform manually on your local system, ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **Python** (v3.10+ recommended)
- **MongoDB** (Local instance running on default port `27017` or a MongoDB Atlas URI)

## 📦 1. Starting the Machine Learning Service (Port 8000)

The Python ML service governs Fake News predictions. It must be running for articles to be successfully published or validated.

1. Open your terminal and navigate to the ML service folder:
   ```bash
   cd ml_service
   ```
2. Create and activate a virtual environment (Windows):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
   *(For macOS/Linux, run `source venv/bin/activate` instead)*
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Download the necessary SpaCy NLP model:
   ```bash
   python -m spacy download en_core_web_sm
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```

## 🗄️ 2. Starting the Node.js Backend (Port 5000)

The Backend handles User Authentication, routing, and saving references to the MongoDB.

1. Open a **new terminal tab** and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file inside the `backend` folder and add these variables (defaults will be used if omitted):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/news_platform
   JWT_SECRET=supersecret123
   ```
4. Start the backend Node server:
   ```bash
   npm start
   ```

### 💽 Seeding the Database (Optional but Recommended)
If you just cloned the project and want to pre-fill your News Feed with Authentic Data (and compute their fake-news algorithms automatically):
Ensure *both* MongoDB and the ML Service are running, then run:
```bash
node seed.js
```

## 💻 3. Starting the React Frontend (Port 5173)

The Vite+React frontend is the user-facing application for reading articles and accessing dashboards.

1. Open a **third terminal tab** and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite development server:
   ```bash
   npm run dev
   ```

## 🎉 4. Using the App

- Head to **`http://localhost:5173`** in your browser.
- Create an account by clicking **"Sign In" -> "Sign Up"**.
- View your personalized recommendations on the Home Feed.
- To access the **Publish** button and the **Admin Dashboard**, manually change your user document's `role` to `'admin'` or `'author'` locally inside your MongoDB Compass viewer.

Enjoy exploring the application!
