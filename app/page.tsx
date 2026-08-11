import TerminalInput from '@/components/TerminalInput';

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col justify-center px-6 relative bg-background overflow-hidden">
      
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
      
      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-start pt-20 pb-32">
        <h1 className="sr-only">GitHub Wrapped</h1>
        <TerminalInput />
      </div>

    </main>
  );
}
