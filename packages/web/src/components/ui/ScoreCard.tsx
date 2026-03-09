'use client';

interface Metric {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface LenderMatch {
  name: string;
  rateRange?: string;
  maxLtv?: number;
  minDscr?: number;
}

interface Scenario {
  label: string;
  profit: number;
  roi: number;
}

interface Narrative {
  headline: string;
  analysis: string;
  strengths: string[];
  risks: string[];
  nextSteps: string[];
  aiGenerated: boolean;
}

interface ScoreCardProps {
  score: 'green' | 'yellow' | 'red';
  lane: string;
  metrics: Metric[];
  lenders: LenderMatch[];
  scenarios?: Scenario[];
  narrative?: Narrative | null;
}

const SCORE_CONFIG = {
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500',
    label: 'Strong Deal',
  },
  yellow: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    badge: 'bg-amber-500',
    label: 'Workable',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    text: 'text-red-400',
    badge: 'bg-red-500',
    label: 'Needs Work',
  },
};

const fmt = (n: number | string) => {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return String(n);
  if (num >= 10000) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  if (num > 0 && num < 10) return num.toFixed(2);
  return num.toLocaleString();
};

export default function ScoreCard({ score, lane, metrics, lenders, scenarios, narrative }: ScoreCardProps) {
  const config = SCORE_CONFIG[score];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Score Banner + AI Headline */}
      <div className={`rounded-2xl p-6 border-2 ${config.bg} ${config.border}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-4 h-4 rounded-full ${config.badge}`} />
          <h3 className={`text-xl font-bold ${config.text}`}>{config.label}</h3>
          {narrative?.aiGenerated && (
            <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
              AI Analysis
            </span>
          )}
        </div>
        {narrative ? (
          <>
            <p className="text-lg font-semibold text-white mb-2">{narrative.headline}</p>
            <p className="text-slate-300 text-sm leading-relaxed">{narrative.analysis}</p>
          </>
        ) : (
          <p className="text-slate-300 text-sm">
            {score === 'green'
              ? 'This deal has solid fundamentals. We have lenders ready to move.'
              : score === 'yellow'
              ? "This deal can work with the right lender and structure. Let's talk specifics."
              : 'The numbers are tight. We can explore options or help restructure.'}
          </p>
        )}
      </div>

      {/* Strengths & Risks */}
      {narrative && (narrative.strengths.length > 0 || narrative.risks.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {narrative.strengths.length > 0 && (
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <span>✅</span> Strengths
              </h4>
              <ul className="space-y-2">
                {narrative.strengths.map((s, i) => (
                  <li key={i} className="text-slate-300 text-sm leading-relaxed flex gap-2">
                    <span className="text-emerald-500 mt-1 shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {narrative.risks.length > 0 && (
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <span>⚠️</span> Watch Points
              </h4>
              <ul className="space-y-2">
                {narrative.risks.map((r, i) => (
                  <li key={i} className="text-slate-300 text-sm leading-relaxed flex gap-2">
                    <span className="text-amber-500 mt-1 shrink-0">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Your Numbers</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metrics.map((m, i) => (
            <div key={i}>
              <div className="text-xs text-slate-500">{m.label}</div>
              <div className={`text-lg font-semibold ${m.highlight ? config.text : 'text-white'}`}>
                {typeof m.value === 'number' ? fmt(m.value) : m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flip Scenarios */}
      {scenarios && scenarios.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Profit Scenarios</h4>
          <div className="space-y-2">
            {scenarios.map((s, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-lg p-3 border ${
                  s.profit > 30000
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : s.profit > 10000
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <span className="text-sm text-slate-300">{s.label}</span>
                <div className="text-right">
                  <span className={`font-bold ${s.profit > 30000 ? 'text-emerald-400' : s.profit > 10000 ? 'text-amber-400' : 'text-red-400'}`}>
                    {fmt(s.profit)}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">{s.roi}% ROI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matching Lenders */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          {lenders.length} Lender{lenders.length !== 1 ? 's' : ''} Ready
        </h4>
        {lenders.length === 0 ? (
          <p className="text-slate-500 text-sm">We&apos;ll find the right lender — submit for a custom match.</p>
        ) : (
          <div className="space-y-2">
            {lenders.slice(0, 5).map((l, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                <span className="text-sm text-white font-medium">{l.name}</span>
                <span className="text-sm text-blue-400">{l.rateRange || 'Competitive'}</span>
              </div>
            ))}
            {lenders.length > 5 && (
              <p className="text-xs text-slate-500 text-center pt-1">
                + {lenders.length - 5} more lenders available
              </p>
            )}
          </div>
        )}
      </div>

      {/* Next Steps */}
      {narrative && narrative.nextSteps.length > 0 && (
        <div className="bg-blue-950/30 rounded-xl p-5 border border-blue-800/40">
          <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <span>🎯</span> Recommended Next Steps
          </h4>
          <ol className="space-y-2">
            {narrative.nextSteps.map((step, i) => (
              <li key={i} className="text-slate-300 text-sm leading-relaxed flex gap-3">
                <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30 text-center">
        <h4 className="text-white font-bold text-lg mb-1">Ready to lock this in?</h4>
        <p className="text-slate-300 text-sm mb-4">Our team responds in under 2 hours during business hours.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="tel:+18185551234"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors text-sm"
          >
            📞 Call Now
          </a>
          <a
            href="mailto:team@818capitalpartners.com"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors text-sm"
          >
            ✉️ Email Us
          </a>
        </div>
      </div>
    </div>
  );
}
