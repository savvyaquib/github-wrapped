import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import WrappedModel from '@/models/Wrapped';
import { getGitHubWrappedData, GitHubUserNotFoundError, GitHubRateLimitError } from '@/lib/github';

/**
 * Extracts a GitHub username from either a raw username or a profile URL.
 * 
 * @param input Raw username string or URL (e.g. "mdaquib" or "https://github.com/mdaquib")
 * @returns The extracted username
 */
function extractUsername(input: string): string {
  try {
    // If it's a URL, parse it
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const url = new URL(input);
      if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          return pathSegments[0]; // The first segment after / is the username
        }
      }
    }
  } catch {
    // URL parsing failed, fall back to treating it as a raw username
  }
  
  // Assume it's a raw username (or a malformed URL that we couldn't parse)
  // Strip any trailing slashes or '@' prefixes just in case
  return input.replace(/^@/, '').replace(/\/+$/, '');
}

export async function GET(
  request: NextRequest,
  // Context typing in Next.js 14+ App Router API routes
  { params }: { params: Promise<{ input: string }> }
) {
  try {
    // `params` is a Promise in Next.js 15+ App Router, must await it
    const { input } = await params;
    
    if (!input) {
      return NextResponse.json({ error: 'Missing input parameter' }, { status: 400 });
    }

    const username = extractUsername(decodeURIComponent(input));

    // Normalize to lowercase — matches the storage convention in the Wrapped model
    const normalizedUsername = username.toLowerCase();

    // Connect to MongoDB using our cached connection helper
    await connectToDatabase();

    // 1. Check the cache using a simple equality match on the normalized username.
    //    No regex needed — usernames are lowercased on write via a Mongoose pre-save hook.
    const cachedData = await WrappedModel.findOne({ username: normalizedUsername }).lean();

    if (cachedData && cachedData.avatarUrl) {
      // Cache HIT!
      return NextResponse.json({ data: cachedData, source: 'cache' });
    }

    // 2. Cache MISS (or incomplete cache) — Fetch from GitHub
    const freshData = await getGitHubWrappedData(username);

    // 3. Atomically upsert into cache.
    //    `findOneAndUpdate` with `upsert: true` solves the race condition where
    //    two concurrent requests for the same new user would both try to insert,
    //    causing a duplicate-key error with the old `new Model().save()` approach.
    await WrappedModel.findOneAndUpdate(
      { username: normalizedUsername },
      { ...freshData, username: normalizedUsername },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Return the fresh data
    return NextResponse.json({ data: freshData, source: 'github' });
    
  } catch (error: unknown) {
    console.error('API Route Error:', error);
    
    // Return granular HTTP status codes based on error type
    if (error instanceof GitHubUserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof GitHubRateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while fetching data.' }, 
      { status: 500 }
    );
  }
}
