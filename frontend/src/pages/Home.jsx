import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col relative overflow-hidden text-text-main">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-pink/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-magenta/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="px-8 py-6 flex justify-between items-center relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-pink to-accent-magenta flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-accent-pink/30">
            S
          </div>
          <span className="text-xl font-bold tracking-wide text-white">Skill <span className="text-gradient">Exchange</span></span>
        </div>
        <nav className="flex gap-4">
          <Link to="/auth" className="px-5 py-2 rounded-full text-white hover:bg-white/5 transition font-medium text-sm">
            Sign In
          </Link>
          <Link to="/auth" className="glow-button px-5 py-2 rounded-full text-white font-medium text-sm">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 mt-[-10vh]">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-text-muted mb-8 tracking-widest uppercase">
          ✦ The Premier Student Network
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-white mb-6 max-w-4xl leading-tight">
          Unlock your potential through <span className="text-gradient">peer learning.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-muted mb-12 max-w-2xl leading-relaxed">
          Exchange skills, collaborate on projects, and build your portfolio with the most driven students on campus.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/auth" className="glow-button px-8 py-4 rounded-full text-white font-semibold text-lg shadow-xl hover:shadow-accent-pink/50 flex items-center justify-center gap-2">
            Join the Network <span className="text-xl">↗</span>
          </Link>
          <a href="#how-it-works" className="px-8 py-4 rounded-full text-white font-semibold text-lg border border-white/10 hover:bg-white/5 transition">
            How it works
          </a>
        </div>
        
        <div id="how-it-works" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="glass-panel p-6 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-4 border border-white/10">🎓</div>
            <h3 className="text-white font-semibold text-lg mb-2">Learn from Experts</h3>
            <p className="text-sm text-text-muted">Connect with students who have mastered the skills you want to learn.</p>
          </div>
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-pink/10 blur-xl rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-4 border border-white/10">🚀</div>
              <h3 className="text-white font-semibold text-lg mb-2">Boost Your Resume</h3>
              <p className="text-sm text-text-muted">Teach others to prove your expertise and build a strong portfolio.</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-4 border border-white/10">🤝</div>
            <h3 className="text-white font-semibold text-lg mb-2">Expand Your Network</h3>
            <p className="text-sm text-text-muted">Meet ambitious peers outside your major and form lasting connections.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;