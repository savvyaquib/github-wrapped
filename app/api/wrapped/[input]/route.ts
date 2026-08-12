import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import WrappedModel from '@/models/Wrapped';
import { getGitHubWrappedData } from '@/lib/github';

/**
 * Extracts a GitHub username from either a raw username or a profile URL.
 * 
 * @param input Raw username string or URL (e.g. "mdaqu" or "https://github.com/mdaqu")
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
  } catch (e) {
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

    // Connect to MongoDB using our cached connection helper
    await connectToDatabase();

    // 1. Check the cache
    // We do a case-insensitive regex search because GitHub usernames are case-insensitive
    const cachedData = await WrappedModel.findOne({ 
      username: new RegExp(`^${username}$`, 'i') 
    });

    if (cachedData && cachedData.avatarUrl) {
      // Cache HIT!
      return NextResponse.json({ data: cachedData, source: 'cache' });
    } else if (cachedData && !cachedData.avatarUrl) {
      // Delete incomplete cache to fetch fresh data with avatarUrl
      await WrappedModel.deleteOne({ _id: cachedData._id });
    }

    // 2. Cache MISS - Fetch from GitHub
    const freshData = await getGitHubWrappedData(username);

    // 3. Save to Cache
    const newWrapped = new WrappedModel(freshData);
    await newWrapped.save();

    // Return the fresh data
    return NextResponse.json({ data: freshData, source: 'github' });
    
  } catch (error: any) {
    console.error('API Route Error:', error);
    
    // Return a generic error to the client, but you can refine this 
    // based on if it's a 404 (user not found) or a 403 (rate limit)
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching data.' }, 
      { status: 500 }
    );
  }
}
