<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock" alt="GSAP" />
  
  <h1>GitHub Wrapped</h1>
  <p>A "Spotify Wrapped" inspired recap tool for GitHub profiles. Enter a GitHub username to aggregate activity data, compute statistics, and visualize them through an engaging, animated narrative.</p>
</div>

---

## Overview

GitHub Wrapped is an open-source web application designed to provide developers with a personalized, engaging summary of their GitHub activity. By leveraging both the GitHub REST and GraphQL APIs, the application extracts a rich dataset of contributions, languages, and repository metrics, presenting them in a modern, story-driven format powered by GSAP animations.

## Key Features

- **Comprehensive Analytics**: Aggregates and computes key developer metrics, including:
  - Total contributions over the preceding year.
  - Longest unbroken contribution streak.
  - Most active day of the week.
  - Primary programming languages by usage percentage.
  - Total stars accumulated and highest-starred repository.
  - Account tenure and repository count.
- **Optimized Performance via Caching**: Implements MongoDB with a Time-To-Live (TTL) index to cache user statistics for one week. This strategy minimizes redundant API calls, mitigates rate-limiting risks, and ensures rapid load times for returning users.
- **Global Leaderboard**: Features a real-time ranking system on the homepage, highlighting the most active GitHub profiles processed by the platform.
- **Exportable Snapshots**: Integrates `html-to-image` functionality, enabling users to generate and download a static, shareable PNG snapshot of their customized wrap-up.
- **Immersive Animations**: Utilizes GSAP (GreenSock Animation Platform) to orchestrate complex, story-style animation sequences that enhance user engagement.

## Architecture & Technology Stack

The application is built on a modern JavaScript ecosystem, prioritizing performance, type safety, and maintainability.

- **Frontend & Framework**: [Next.js 14+](https://nextjs.org/) (App Router paradigm, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for end-to-end type safety
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for utility-first responsive design
- **Database**: [MongoDB](https://www.mongodb.com/) utilizing [Mongoose](https://mongoosejs.com/) for schema validation and interaction
- **Animation Engine**: [GSAP](https://gsap.com/) for high-performance timeline animations
- **Supplementary Libraries**: 
  - `html-to-image`: Client-side DOM to image rendering
  - `lucide-react`: Consistent SVG iconography

## Design Philosophy

The user interface is intentionally designed to resonate with developers. It utilizes the **JetBrains Mono** typeface for all numerical data and statistics to evoke a code-editor aesthetic. The color system is derived from standard Git diff indicators (additions, deletions, modifications) paired with vibrant greens inspired by the classic GitHub contribution graph.

## Getting Started

### Prerequisites

Ensure the following dependencies are installed before proceeding:
- [Node.js](https://nodejs.org/en/) (v18.x or later recommended)
- A [MongoDB](https://www.mongodb.com/) database instance (local or Atlas cluster)
- A [GitHub Personal Access Token (PAT)](https://github.com/settings/tokens) with public read permissions.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/github-wrapped.git
   cd github-wrapped
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env.local` file in the project root directory and define the required environment variables:

```bash
# MongoDB connection URI utilized for the caching layer
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/github-wrapped?retryWrites=true&w=majority

# GitHub Personal Access Token (PAT) for API authentication
# Requires 'public_repo' or general public read access
GITHUB_TOKEN=ghp_your_personal_access_token
```

### Development Server

Initialize the local development server:

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
├── app/                  # Next.js App Router implementation
│   ├── api/wrapped/      # Serverless route handlers for GitHub API and database operations
│   └── page.tsx          # Application entry point and leaderboard interface
├── components/           # Modular React components (e.g., TerminalInput, LoadingSequence)
├── lib/                  # Core utilities, database connection logic, and API fetchers
├── models/               # Mongoose schemas representing database collections
└── public/               # Static assets (images, fonts, etc.)
```

## Contributing

We welcome contributions from the community. To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/EnhancementName`).
3. Commit your changes (`git commit -m 'feat: implement EnhancementName'`).
4. Push to the branch (`git push origin feature/EnhancementName`).
5. Open a Pull Request detailing your changes.

## License

This project is licensed under the [MIT License](LICENSE).
