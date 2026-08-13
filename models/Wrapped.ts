import mongoose from 'mongoose';

/**
 * Model representing a user's GitHub Wrapped recap data.
 * 
 * We cache this data so we don't bombard the GitHub API on every page reload
 * or share. A 1-week TTL (Time To Live) is used so the data remains fresh
 * but doesn't require constant re-fetching.
 */

export interface IWrapped {
  username: string;
  totalContributions: number;
  longestStreak: number;
  mostActiveWeekday: string;
  topLanguages: { name: string; percentage: number }[];
  totalStars: number;
  mostStarredRepo: string | null;
  accountAgeInYears: number;
  avatarUrl?: string;
  createdAt?: Date; // Handled by Mongoose timestamps
}

const WrappedSchema = new mongoose.Schema<IWrapped>(
  {
    username: { type: String, required: true, unique: true, index: true },
    totalContributions: { type: Number, required: true },
    longestStreak: { type: Number, required: true },
    mostActiveWeekday: { type: String, required: true },
    topLanguages: [
      {
        name: { type: String, required: true },
        percentage: { type: Number, required: true },
      },
    ],
    totalStars: { type: Number, required: true },
    mostStarredRepo: { type: String, default: null },
    accountAgeInYears: { type: Number, required: true },
    avatarUrl: { type: String },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// This creates a TTL index. MongoDB will automatically delete documents 
// 1 week (604800 seconds) after their `createdAt` date.
// If the document is requested after deletion, it counts as a cache miss,
// and the app will re-fetch fresh data from GitHub.
WrappedSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

// Ensure we don't overwrite the model if it's already compiled (common in hot-reloading)
export default mongoose.models.Wrapped || mongoose.model<IWrapped>('Wrapped', WrappedSchema);
