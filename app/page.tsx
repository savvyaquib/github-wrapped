import TerminalInput from '@/components/TerminalInput';
import connectToDatabase from '@/lib/mongodb';
import Wrapped from '@/models/Wrapped';
import Image from 'next/image';
import Link from 'next/link';

// Force dynamic rendering since the leaderboard might change frequently
export const dynamic = 'force-dynamic';

export default async function Home() {
  await connectToDatabase();
  
  // Fetch top 10 accounts by totalContributions
  const topAccounts = await Wrapped.find()
    .sort({ totalContributions: -1 })
    .limit(10)
    .lean();

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-6 relative bg-background overflow-x-hidden pt-24 pb-32">
      
      {/* Decorative subtle grid background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #EDEFEC 1px, transparent 1px),
            linear-gradient(to bottom, #EDEFEC 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem'
        }}
      />
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-br from-green-300 via-emerald-500 to-green-700 text-transparent bg-clip-text drop-shadow-sm">
            GitHub Wrapped
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Unveil the story of your year in code. Discover your most active days, top languages, and longest streaks in a beautifully crafted recap.
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-3xl mb-24 relative group flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 w-full max-w-lg mx-auto"></div>
          <div className="relative w-full flex justify-center">
            <TerminalInput />
          </div>
        </div>

        {/* Top Accounts Section */}
        {topAccounts.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-green-500/50"></div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-wide">Top Contributors</h2>
              <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-green-500/50"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {topAccounts.map((account: any, index: number) => (
                <Link 
                  key={account.username} 
                  href={`/wrapped/${account.username}`} 
                  className="group relative block rounded-2xl p-[1px] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_2rem_-0.5rem_rgba(16,185,129,0.2)]"
                >
                  {/* Card Border Gradient */}
                  <span className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent group-hover:from-green-400/50 group-hover:via-emerald-500/20 group-hover:to-transparent transition-opacity duration-300"></span>
                  
                  {/* Card Content */}
                  <div className="relative h-full bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/5 flex flex-col">
                    
                    {/* Rank Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-sm font-bold text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-5 mb-6">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-green-400/50 transition-colors duration-300">
                        <Image 
                          src={`https://github.com/${account.username}.png`} 
                          alt={`${account.username}'s avatar`} 
                          fill 
                          className="object-cover" 
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 pr-8">
                        <span className="font-bold text-lg text-text-primary truncate group-hover:text-green-300 transition-colors">
                          @{account.username}
                        </span>
                        <span className="text-sm text-green-500 font-medium mt-0.5">
                          {account.totalContributions.toLocaleString()} <span className="text-text-secondary font-normal">commits</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-auto">
                      {account.topLanguages.slice(0, 3).map((lang: any) => (
                        <span 
                          key={lang.name} 
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/5 text-text-secondary border border-white/5 group-hover:border-white/10 group-hover:bg-white/10 transition-colors"
                        >
                          {lang.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
