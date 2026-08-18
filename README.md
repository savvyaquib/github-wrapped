<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock" alt="GSAP" />
  
  <h1>GitHub Wrapped</h1>
  <p>A "Spotify Wrapped"-style recap tool for GitHub profiles. Paste a GitHub username or profile URL to fetch public GitHub activity, compute stats, and reveal them in an animated, story-style sequence.</p>
</div>

---

## Features

- **Deep GitHub Analytics**: Aggregates data across both GitHub REST and GraphQL APIs to calculate:
  - Total contributions over the last year
  - Longest contribution streak (in days)
  - Most active day of the week
  - Top 5 programming languages by percentage
  - Total stars across all owned repositories and the most starred repo
  - Account age and total public repositories
- **Smart Caching**: Utilizes MongoDB with a 1-week Time-To-Live (TTL) index to cache user stats. This guarantees lightning-fast load times for repeat visitors and prevents GitHub API rate-limiting.
- **Top Contributors Leaderboard**: Real-time ranking on the homepage showcasing the top 10 most active GitHub profiles previously wrapped by the app.
- **Shareable Assets**: Integrated with `html-to-image` allowing users to generate and download a shareable snapshot of their GitHub Wrapped to post on social media.
- **Story-Style Animations**: Immersive user experience powered by GSAP, mimicking the engaging flow of modern "wrapped" style applications.

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Animations**: [GSAP (GreenSock Animation Platform)](https://gsap.com/)
- **Utilities**: 
  - `html-to-image` for PNG generation
  - `lucide-react` for iconography

## Design Identity

The visual identity of this project relies heavily on the **JetBrains Mono** typeface for all stats and numbers to evoke a code-native feel. The color palette focuses on diff-based accent colors (additions, deletions, modifications) combined with vibrant greens to match the iconic GitHub contribution graph.

## Setup & Local Development

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- A [MongoDB](https://www.mongodb.com/) cluster (Atlas or local)
- A [GitHub Personal Access Token (PAT)](https://github.com/settings/tokens) (Classic or Fine-grained) with public read access.

### 2. Clone and Install

```bash
git clone https://github.com/yourusername/github-wrapped.git
cd github-wrapped
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and populate it with the following:

```bash
# Your MongoDB connection string (used for caching)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/github-wrapped?retryWrites=true&w=majority

# Your GitHub Personal Access Token (Classic or Fine-grained)
# Note: It only needs public read access.
GITHUB_TOKEN=ghp_your_token_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```text
├── app/                  # Next.js App Router pages and API routes
│   ├── api/wrapped/      # Backend endpoint handling GitHub API & DB caching
│   └── page.tsx          # Homepage with Top Contributors leaderboard
├── components/           # Reusable UI components (TerminalInput, etc.)
├── lib/                  # Core utilities (MongoDB connection, GitHub fetcher)
├── models/               # Mongoose schema definitions (Wrapped.ts)
└── public/               # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request if you'd like to improve the animations, add new stats, or fix any bugs.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open-source and available under the [MIT License](LICENSE).
