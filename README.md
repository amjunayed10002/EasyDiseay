# EasyDiseay

AI-powered crop disease detection and treatment suggestion app.

Built with Next.js, Firebase, and Genkit AI.

## 🚀 Deployment to Vercel

### Prerequisites
- Vercel account
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Deployment Steps

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables in Vercel**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `GEMINI_API_KEY` with your actual Gemini API key
   - Set environment to `Production` (and optionally `Preview`/`Development`)

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Local Development

1. **Clone and install**:
   ```bash
   git clone <your-repo>
   cd easydiseay
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.local.example .env.local
   # Add your GEMINI_API_KEY to .env.local
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```

## 🔧 Features

- AI-powered crop disease detection
- Treatment suggestions
- Multi-language support
- Admin dashboard for content management
- Firebase integration for data storage