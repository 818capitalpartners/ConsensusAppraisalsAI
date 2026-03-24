export interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  quote: string;
  dealType: 'DSCR' | 'Fix & Flip' | 'STR' | 'Multifamily';
  avatar?: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Marcus Chen',
    role: 'DSCR Investor — 12 Units',
    location: 'Dallas, TX',
    quote: 'Closed on a 4-unit rental in 16 days. No tax returns, no W-2s, no bank statements. I sent the deal Friday and had a term sheet Monday morning. This is how lending should work.',
    dealType: 'DSCR',
    rating: 5,
  },
  {
    id: 2,
    name: 'Danielle Torres',
    role: 'Fix & Flip Investor',
    location: 'Washington, DC',
    quote: '90% LTC and 100% rehab financed on my DC flip. I brought less than $30K to close on a $525K deal. The draw process was seamless — funds released within 48 hours of inspection.',
    dealType: 'Fix & Flip',
    rating: 5,
  },
  {
    id: 3,
    name: 'James Okafor',
    role: 'Real Estate Broker',
    location: 'Atlanta, GA',
    quote: 'I send all my investor clients to 818 Capital. The AI scenario tool tells me in 30 seconds whether a deal works before I waste my client\'s time. That kind of speed makes me look like a genius.',
    dealType: 'DSCR',
    rating: 5,
  },
  {
    id: 4,
    name: 'Sarah Kim',
    role: 'STR Portfolio Owner',
    location: 'Nashville, TN',
    quote: 'They used my Airbnb income to qualify me — no other lender would touch it. Pulled 12 months of platform statements, ran the numbers through STR Signal, and I had a term sheet the next day.',
    dealType: 'STR',
    rating: 5,
  },
  {
    id: 5,
    name: 'Robert Vasquez',
    role: 'Repeat Flip Investor — 11 Flips',
    location: 'Fort Worth, TX',
    quote: 'This is my fourth deal with 818 and each one closes faster than the last. They know my file, they know my contractors, and they don\'t make me re-prove myself every time. That\'s loyalty you can\'t buy.',
    dealType: 'Fix & Flip',
    rating: 5,
  },
  {
    id: 6,
    name: 'Priya Patel',
    role: 'Multifamily Investor',
    location: 'Fort Myers, FL',
    quote: 'Closed a 33-unit apartment building with 818. The Sponsor Brief they generated was more thorough than what my previous lender\'s analyst produced. Underwriting was clean and the communication was constant.',
    dealType: 'Multifamily',
    rating: 5,
  },
  {
    id: 7,
    name: 'Michael Brooks',
    role: 'Self-Employed Investor',
    location: 'Long Island, NY',
    quote: 'My CPA told me I\'d never qualify for a rental loan with my tax returns. 818 used the rental income to qualify the deal — closed at 75% LTV with a 30-year term. No income docs whatsoever.',
    dealType: 'DSCR',
    rating: 5,
  },
  {
    id: 8,
    name: 'Christina Hayes',
    role: 'Mortgage Loan Officer',
    location: 'Miami, FL',
    quote: 'I was losing investor deals because I couldn\'t offer DSCR or bridge products. Since partnering with 818, I\'ve closed 9 investor loans I would have turned away. The comp structure is transparent and my clients love the speed.',
    dealType: 'Fix & Flip',
    rating: 5,
  },
  {
    id: 9,
    name: 'David Nguyen',
    role: 'BRRRR Strategy Investor',
    location: 'Pigeon Forge, TN',
    quote: 'Bought a cabin in Pigeon Forge with bridge money, rehabbed it, leased it on Airbnb, then refinanced into a DSCR loan — all through 818. One relationship, two products, zero friction.',
    dealType: 'STR',
    rating: 5,
  },
  {
    id: 10,
    name: 'Angela Moretti',
    role: 'First-Time Investor',
    location: 'St. Petersburg, FL',
    quote: 'I was terrified of my first investment property purchase. 818 walked me through every number, explained every fee, and told me exactly what to expect at closing. They didn\'t oversell — they educated. That earned my trust.',
    dealType: 'DSCR',
    rating: 5,
  },
];
