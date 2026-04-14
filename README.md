# CodeSense

CodeSense is an AI-powered code review web app that analyzes source code, flags likely bugs, suggests optimizations, and returns an improved code version.

The project is split into:
- `Frontend/`: React + Vite UI with Monaco Editor and diff view
- `Backend/`: Node.js + Express API that calls Google Gemini

## Features

- Multi-language code input (TypeScript, JavaScript, Python, Java, C++, C#, Go, Rust)
- AI-generated review insights:
	- Bug types and severity
	- Functions/locations where issues occur
	- Optimization opportunities
- Optimized code output
- Side-by-side original vs optimized comparison
- One-click apply suggestion in editor

## Tech Stack

- Frontend: React, Vite, Monaco Editor, Axios, Tailwind CSS
- Backend: Node.js, Express, CORS, dotenv, `@google/genai`
- AI Model: Gemini via Google GenAI SDK

## Project Structure

```text
CodeSense/
	Backend/
		server.js
		package.json
		src/
			app.js
			Controllers/
			Routes/
			Services/
	Frontend/
		package.json
		src/
			Features/CodeReview/
```

## Prerequisites

- Node.js 18+ (recommended)
- npm
- A valid Google GenAI API key

## Environment Variables

### Backend (`Backend/.env`)

```env
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (`Frontend/.env`, optional)

```env
VITE_API_URL=http://localhost:3000
```

If `VITE_API_URL` is not set, frontend defaults to `http://localhost:3000`.

## Local Setup

1. Clone the repository.
2. Install backend dependencies.
3. Install frontend dependencies.
4. Start backend and frontend in separate terminals.

### 1) Backend

```bash
cd Backend
npm install
npm start
```

Backend runs on `http://localhost:3000` by default.

### 2) Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## API

### POST `/api/review`

Request body:

```json
{
	"code": "function add(a,b){return a+b}",
	"language": "JavaScript"
}
```

Success response (shape):

```json
{
	"review": {
		"bugs": {
			"Severity_of_Bugs": "low|medium|high",
			"Types_of_Bugs": ["..."],
			"Where_Bugs_Occurred": ["..."]
		},
		"Optimizations": {
			"Number_of_Optimizations": 0,
			"Types_of_Optimizations": ["..."],
			"Where_Optimizations_Are_Required": ["..."]
		},
		"OptmizedCode": "..."
	}
}
```

## Available Scripts

### Backend

- `npm start`: Start Express server (`server.js`)

### Frontend

- `npm run dev`: Start Vite dev server
- `npm run build`: Build production bundle
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint

## Troubleshooting

- `Failed to generate review`:
	- Check `GOOGLE_GENAI_API_KEY` in `Backend/.env`
	- Confirm backend is running and reachable
- CORS issues:
	- Ensure `FRONTEND_URL` matches your frontend dev URL
- Frontend cannot reach API:
	- Verify `VITE_API_URL` or backend default URL (`http://localhost:3000`)

## Author

Shourya Saran
