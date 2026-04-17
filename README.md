# ResumeAI 🎯

An AI-powered resume generator that tailors your resume to any job description using Claude AI.

## Features
- Paste a job description → get an ATS-optimized resume in seconds
- Tailored keywords, summary, and bullet points matched to the job
- Clean, print-ready resume layout
- Download as PDF via browser print

## Project Structure

```
resume-ai/
├── api/
│   └── generate.js          # Vercel serverless function (Anthropic API)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── FormPage.jsx
│   │   │   └── ResumePage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── vercel.json
└── .env.example
```

## Local Development

### 1. Install dependencies

```bash
# Root
npm install

# Frontend
cd frontend && npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

Get your API key at: https://console.anthropic.com

### 3. Run locally

You'll need two terminals:

**Terminal 1 — API (Node.js):**
```bash
# Simple way to test the API route with Vercel CLI
npm install -g vercel
vercel dev
```

**Or use Vite proxy (frontend only dev):**
```bash
cd frontend && npm run dev
```

> For local development without Vercel CLI, you can temporarily use the Anthropic API directly from the frontend by moving the API call logic to the frontend (not recommended for production).

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/resume-ai.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import your GitHub repository
3. Set the **Root Directory** to `/` (default)
4. Add environment variable:
   - `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com
5. Click **Deploy** ✅

### 3. Configure Build Settings (if needed)

In Vercel project settings:
- **Build Command:** `cd frontend && npm run build`
- **Output Directory:** `frontend/dist`
- **Install Command:** `cd frontend && npm install`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

## Tech Stack

- **Frontend:** React 18 + Vite + CSS Modules
- **Backend:** Vercel Serverless Functions (Node.js)
- **AI:** Anthropic Claude (claude-opus-4-5)
- **Deployment:** Vercel
