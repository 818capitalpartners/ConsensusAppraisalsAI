import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Closed Deals | 818 Capital',
  description: 'Recent transactions funded by 818 Capital across DSCR, Fix & Flip, STR, and Multifamily.',
};

const DEALS = [
  {
    title: 'DSCR Rental Portfolio',
    location: 'Hempstead, Long Island, NY',
    type: 'DSCR',
    loanAmount: '$1,250,000',
    ltv: '75%',
    dscr: '1.32',
    units: '4 units',
    closeTime: '18 days',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=400&fit=crop',
  },
  {
    title: 'Fix & Flip — Distressed SFR',
    location: 'Hialeah, FL (Miami-Dade)',
    type: 'Fix & Flip',
    loanAmount: '$285,000',
    ltv: '85% LTC',
    dscr: null,
    units: 'Single-family',
    closeTime: '12 days',
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&h=400&fit=crop',
  },
  {
    title: 'Airbnb Pool Home',
    location: 'Scottsdale, AZ',
    type: 'STR',
    loanAmount: '$615,000',
    ltv: '75%',
    dscr: '1.45',
    units: 'Single-family',
    closeTime: '21 days',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
  },
  {
    title: '12-Unit Apartment Building',
    location: 'Garland, TX (Dallas metro)',
    type: 'Multifamily',
    loanAmount: '$2,100,000',
    ltv: '72%',
    dscr: '1.48',
    units: '12 units',
    closeTime: '28 days',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=400&fit=crop',
  },
  {
    title: 'Cash-Out Refi Duplex',
    location: 'Burbank, CA',
    type: 'DSCR',
    loanAmount: '$720,000',
    ltv: '70%',
    dscr: '1.21',
    units: '2 units',
    closeTime: '16 days',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
  },
  {
    title: 'STR Loft — Music Row',
    location: 'Nashville, TN',
    type: 'STR',
    loanAmount: '$480,000',
    ltv: '75%',
    dscr: '1.38',
    units: 'Condo',
    closeTime: '19 days',
    image: 'https://images.unsplash.com/photo-1588897159261-328f3f53715f?w=600&h=400&fit=crop',
  },
];

const STATS = [
  { value: '$12M+', label: 'Funded to Date' },
  { value: '35+', label: 'Deals Closed' },
  { value: '18', label: 'Avg Days to Close' },
  { value: '12', label: 'States' },
];

export default function ClosedDealsPage() {
  return (
    <>
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6">
          <h1 className="text-h1 text-white">Closed Deals</h1>
          <p className="mt-4 text-lg text-navy-200 font-body font-light max-w-xl">
            A selection of recent transactions funded by 818 Capital. Every deal is different — we structure each one to fit.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-navy-100">
        <div className="mx-auto max-w-content px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-sans font-bold text-navy-900">{s.value}</p>
                <p className="mt-1 text-sm text-navy-500 font-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deal cards */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {DEALS.map((deal) => (
              <div key={deal.title + deal.location} className="rounded-lg border border-navy-100 bg-white shadow-sm overflow-hidden">
                <div className="relative h-48">
                  <Image src={deal.image} alt={deal.title} fill className="object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-accent text-white text-xs font-sans font-semibold uppercase tracking-wide px-2.5 py-1 rounded">{deal.type}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-h4 text-navy-900 mb-1">{deal.title}</h3>
                  <p className="text-sm text-navy-400 font-body mb-4">{deal.location}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-navy-400 font-body">Loan Amount</p>
                      <p className="text-sm font-sans font-semibold text-navy-900">{deal.loanAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-400 font-body">LTV / LTC</p>
                      <p className="text-sm font-sans font-semibold text-navy-900">{deal.ltv}</p>
                    </div>
                    {deal.dscr && (
                      <div>
                        <p className="text-xs text-navy-400 font-body">DSCR</p>
                        <p className="text-sm font-sans font-semibold text-success">{deal.dscr}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-navy-400 font-body">Closed In</p>
                      <p className="text-sm font-sans font-semibold text-navy-900">{deal.closeTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
