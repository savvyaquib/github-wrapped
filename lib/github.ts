/**
 * GitHub API Interaction Layer
 * 
 * This module handles fetching and aggregating data from both the GitHub REST API 
 * and the GraphQL API. The GraphQL API is specifically required to fetch the 
 * user's contribution calendar, which is not exposed via REST.
 * 
 * We use a server-side Personal Access Token (GITHUB_TOKEN) so the visitor 
 * doesn't have to authenticate.
 */

import { IWrapped } from '../models/Wrapped';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface GitHubUserProfile {
  login: string;
  public_repos: number;
  avatar_url: string;
  created_at: string;
}

interface GitHubRepo {
  fork: boolean;
  stargazers_count: number;
  name: string;
  language: string | null;
}

interface ContributionDay {
  contributionCount: number;
  weekday: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface GraphQLContributionResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendar;
      };
    } | null;
  };
  errors?: { message: string }[];
}

// ─── Custom Errors ──────────────────────────────────────────────────────────────

export class GitHubUserNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user "${username}" not found.`);
    this.name = 'GitHubUserNotFoundError';
  }
}

export class GitHubRateLimitError extends Error {
  constructor() {
    super('GitHub API rate limit exceeded. Please try again later.');
    this.name = 'GitHubRateLimitError';
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Builds authorization headers lazily to avoid reading env vars at module-load 
 * time, which can fail in edge runtimes or test environments.
 */
function getHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not defined in environment variables.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/** Helper for GraphQL API with typed response. */
async function fetchGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ query, variables }),
    // Ensure we get fresh data from GitHub, not a cached Next.js response
    cache: 'no-store', 
  });

  if (!res.ok) {
    if (res.status === 403) throw new GitHubRateLimitError();
    throw new Error(`GraphQL Error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/** Helper for REST API with typed response. */
async function fetchREST<T>(endpoint: string): Promise<T> {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) throw new GitHubUserNotFoundError(endpoint);
    if (res.status === 403 || res.status === 429) throw new GitHubRateLimitError();
    throw new Error(`REST Error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Fetches ALL repos for a user by paginating through the REST API.
 * GitHub caps `per_page` at 100, so we loop until a page returns fewer results.
 */
async function fetchAllRepos(username: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const batch = await fetchREST<GitHubRepo[]>(
      `/users/${username}/repos?per_page=${perPage}&type=owner&page=${page}`
    );
    allRepos.push(...batch);

    // If we got fewer than a full page, we've exhausted all repos
    if (batch.length < perPage) break;
    page++;
  }

  return allRepos;
}

// ─── Computation ────────────────────────────────────────────────────────────────

/**
 * Calculates the longest streak of consecutive days with contributions.
 */
function calculateLongestStreak(weeks: ContributionWeek[]): number {
  let currentStreak = 0;
  let longestStreak = 0;

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
  }

  return longestStreak;
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * Determines the weekday with the most contributions.
 */
function calculateMostActiveWeekday(weeks: ContributionWeek[]): string {
  const dayCounts = new Uint32Array(7);

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      dayCounts[day.weekday] += day.contributionCount;
    }
  }

  let maxIndex = 0;
  for (let i = 1; i < 7; i++) {
    if (dayCounts[i] > dayCounts[maxIndex]) maxIndex = i;
  }

  return WEEKDAY_NAMES[maxIndex];
}

/**
 * Calculates account age in whole years using proper calendar math.
 */
function calculateAccountAge(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();

  let years = now.getFullYear() - created.getFullYear();

  // Adjust if we haven't reached the anniversary month/day yet this year
  const monthDiff = now.getMonth() - created.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < created.getDate())) {
    years--;
  }

  return Math.max(0, years);
}

// ─── Main Export ─────────────────────────────────────────────────────────────────

const CONTRIBUTION_QUERY = `
  query($userName:String!) {
    user(login: $userName){
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches all necessary data from GitHub and computes the Wrapped stats.
 * 
 * @param username The GitHub username to fetch data for
 * @returns Aggregated stats matching the IWrapped interface
 * @throws {GitHubUserNotFoundError} When the user doesn't exist
 * @throws {GitHubRateLimitError} When rate limited
 */
export async function getGitHubWrappedData(username: string): Promise<Omit<IWrapped, 'createdAt'>> {
  
  // Fetch User Profile, Repos (paginated), and Contributions in parallel
  const [userProfile, repos, graphqlData] = await Promise.all([
    fetchREST<GitHubUserProfile>(`/users/${username}`),
    fetchAllRepos(username),
    fetchGraphQL<GraphQLContributionResponse>(CONTRIBUTION_QUERY, { userName: username }),
  ]);

  if (graphqlData.errors?.length) {
    throw new Error(`GraphQL query returned errors: ${JSON.stringify(graphqlData.errors)}`);
  }

  if (!graphqlData.data.user) {
    throw new GitHubUserNotFoundError(username);
  }

  const calendar = graphqlData.data.user.contributionsCollection.contributionCalendar;

  // A. Contributions & Streak
  const totalContributions = calendar.totalContributions;
  const longestStreak = calculateLongestStreak(calendar.weeks);
  const mostActiveWeekday = calculateMostActiveWeekday(calendar.weeks);

  // B. Repository Stats (Stars & Languages) — only original (non-fork) repos
  let totalStars = 0;
  let mostStarredRepo: string | null = null;
  let maxStars = -1;
  
  const languageCounts: Record<string, number> = {};
  let totalReposWithLanguage = 0;

  for (const repo of repos) {
    if (!repo.fork) {
      totalStars += repo.stargazers_count;
      
      if (repo.stargazers_count > maxStars) {
        maxStars = repo.stargazers_count;
        mostStarredRepo = repo.name;
      }

      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        totalReposWithLanguage++;
      }
    }
  }

  // Calculate top languages by percentage
  const topLanguages = Object.entries(languageCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5) // Top 5
    .map(([name, count]) => ({
      name,
      percentage: totalReposWithLanguage > 0 ? Math.round((count / totalReposWithLanguage) * 100) : 0,
    }));

  // C. Account Age (proper calendar year diff)
  const accountAgeInYears = calculateAccountAge(userProfile.created_at);

  return {
    username: userProfile.login,
    totalContributions,
    longestStreak,
    mostActiveWeekday,
    topLanguages,
    totalStars,
    mostStarredRepo,
    accountAgeInYears,
    totalRepos: userProfile.public_repos,
    avatarUrl: userProfile.avatar_url,
  };
}
