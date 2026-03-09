import Link from 'next/link';

export const metadata = {
  title: 'Get a Quote | 818 Capital Partners',
  description: 'Get an instant quote for your investment property loan. DSCR, Fix & Flip, STR, or Multifamily — pick your lane and run the numbers.',
};

export default function GetQuotePage() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Get a Quote in 60 Seconds</h1>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Pick the program that fits your deal. Enter the numbers. Get your score and lender match instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            href: '/dscr',
            icon: '📊',
            title: 'DSCR Loan',
            desc: 'Buy-and-hold rental. Qualify on rent, not income.',
            color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 hover:border-blue-500/50',
          },
          {
            href: '/fix-and-flip',
            icon: '🔨',
            title: 'Fix & Flip',
            desc: 'Short-term rehab project. Need speed and leverage.',
            color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 hover:border-amber-500/50',
          },
          {
            href: '/str',
            icon: '🏖️',
            title: 'STR / Airbnb',
            desc: 'Short-term rental with Airbnb or VRBO income.',
            color: 'from-teal-500/20 to-teal-600/5 border-teal-500/30 hover:border-teal-500/50',
          },
          {
            href: '/multifamily',
            icon: '🏢',
            title: 'Multifamily (5+)',
            desc: 'Commercial apartment building. NOI-based.',
            color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 hover:border-purple-500/50',
          },
        ].map((lane) => (
          <Link
            key={lane.href}
            href={lane.href}
            className={`group bg-gradient-to-br ${lane.color} rounded-2xl p-6 border transition-all hover:scale-[1.02]`}
          >
            <div className="text-4xl mb-3">{lane.icon}</div>
            <h3 className="text-white text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors">
              {lane.title}
            </h3>
            <p className="text-slate-400 text-sm">{lane.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-slate-500 text-sm">
          Not sure which program? Call us at{' '}
          <a href="tel:+18185551234" className="text-blue-400 hover:text-blue-300">
            (818) 555-1234
          </a>{' '}
          and we&apos;ll help you figure it out.
        </p>
      </div>
    </section>
  );
}
