"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-dark via-slate-900 to-dark">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-light mb-6">
            <span className="text-primary">SabiTrack</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Turn your long-term goals into structured daily actions with AI-generated roadmaps and WhatsApp accountability.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-cyan-400 transition">
              Get Started
            </button>
            <button className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-primary/50 transition">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Goal Definition</h3>
            <p className="text-slate-300">Define your major goal and set a realistic timeline for achievement.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-secondary/50 transition">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">AI Roadmap</h3>
            <p className="text-slate-300">Get an AI-generated breakdown into yearly, quarterly, monthly, weekly, and daily targets.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-accent/50 transition">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">WhatsApp Accountability</h3>
            <p className="text-slate-300">Daily reminders, progress tracking, and weekly reviews via WhatsApp.</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-20 text-center">
          <p className="text-slate-400">🚧 Platform coming soon. Subscribe to be notified when we launch.</p>
        </div>
      </div>
    </main>
  );
}
