# GitHub Wrapped

A "Spotify Wrapped"-style recap tool for GitHub profiles. Paste a GitHub username or profile URL to fetch public GitHub activity, compute stats, and reveal them in an animated, story-style sequence.

## Tech Stack
- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS (v4)
- GSAP (Animations)
- MongoDB + Mongoose (Caching)
- `html-to-image` (Shareable PNG Generation)

## Setup and Local Development

### 1. Environment Variables

Create a `.env.local` file in the root of the project and add the following keys:

```bash
# Your MongoDB connection string (used for caching)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/github-wrapped?retryWrites=true&w=majority

# A GitHub Personal Access Token (classic or fine-grained)
# It only needs public read access.
GITHUB_TOKEN=ghp_your_token_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Design Identity
The visual identity of this project relies heavily on the `JetBrains Mono` typeface for all stats/numbers to evoke a code-native feel, and specific diff-based accent colors (additions, deletions, modifications).
