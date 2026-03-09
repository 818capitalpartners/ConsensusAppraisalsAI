interface LaneHeroProps {
  title: string;
  subtitle: string;
  features: string[];
  badge: string;
  gradient: string; // tailwind gradient class
}

export default function LaneHero({ title, subtitle, features, badge, gradient }: LaneHeroProps) {
  return (
    <section className={`relative overflow-hidden ${gradient} py-16 sm:py-20`}>
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-white/80 border border-white/20 mb-4">
            {badge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>
          <p className="text-lg text-white/70 mb-8 leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            {features.map((feature, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/10 backdrop-blur rounded-lg text-white/90 border border-white/10"
              >
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
