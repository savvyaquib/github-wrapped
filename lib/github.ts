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

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  'Content-Type': 'application/json',
};

// Helper for GraphQL API
async function fetchGraphQL(query: string, variables: any) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not defined in environment variables.');
  }

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    // Ensure we get fresh data from GitHub, not a cached Next.js response
    cache: 'no-store', 
  });

  if (!res.ok) {
    throw new Error(`GraphQL Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Helper for REST API
async function fetchREST(endpoint: string) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not defined in environment variables.');
  }

  const res = await fetch(`https://api.github.com${endpoint}`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`REST Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Calculates the longest streak of consecutive days with contributions.
 * 
 * @param weeks The weeks array from the GraphQL contribution calendar
 * @returns The longest streak in days
 */
function calculateLongestStreak(weeks: any[]): number {
  let currentStreak = 0;
  let longestStreak = 0;

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }
  }

  return longestStreak;
}

/**
 * Determines the weekday with the most contributions.
 * 
 * @param weeks The weeks array from the GraphQL contribution calendar
 * @returns The name of the most active weekday
 */
function calculateMostActiveWeekday(weeks: any[]): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      // weekday is an integer from 0 (Sunday) to 6 (Saturday)
      dayCounts[day.weekday] += day.contributionCount;
    }
  }

  const maxIndex = dayCounts.indexOf(Math.max(...dayCounts));
  return days[maxIndex];
}

/**
 * Fetches all necessary data from GitHub and computes the Wrapped stats.
 * 
 * @param username The GitHub username to fetch data for
 * @returns Aggregated stats matching the IWrapped interface
 */
export async function getGitHubWrappedData(username: string): Promise<Omit<IWrapped, 'createdAt'>> {
  
  // 1. Fetch User Profile & Repos (REST) in parallel with Contributions (GraphQL)
  const query = `
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

  const [userProfile, repos, graphqlData] = await Promise.all([
    fetchREST(`/users/${username}`),
    fetchREST(`/users/${username}/repos?per_page=100&type=owner`),
    fetchGraphQL(query, { userName: username }),
  ]);

  if (graphqlData.errors) {
    throw new Error(`GraphQL query returned errors: ${JSON.stringify(graphqlData.errors)}`);
  }

  const calendar = graphqlData.data.user.contributionsCollection.contributionCalendar;

  // 2. Aggregate Data

  // A. Contributions & Streak
  const totalContributions = calendar.totalContributions;
  const longestStreak = calculateLongestStreak(calendar.weeks);
  const mostActiveWeekday = calculateMostActiveWeekday(calendar.weeks);

  // B. Repository Stats (Stars & Languages)
  let totalStars = 0;
  let mostStarredRepo = null;
  let maxStars = -1;
  
  const languageCounts: Record<string, number> = {};
  let totalReposWithLanguage = 0;

  for (const repo of repos) {
    // Only count repos the user actually owns and aren't forks, 
    // to give a true reflection of their original work.
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

  // C. Account Age
  const createdDate = new Date(userProfile.created_at);
  const currentDate = new Date();
  const accountAgeInYears = Math.abs(
    new Date(currentDate.getTime() - createdDate.getTime()).getUTCFullYear() - 1970
  );

  return {
    username: userProfile.login,
    totalContributions,
    longestStreak,
    mostActiveWeekday,
    topLanguages,
    totalStars,
    mostStarredRepo,
    accountAgeInYears,
  };
}
