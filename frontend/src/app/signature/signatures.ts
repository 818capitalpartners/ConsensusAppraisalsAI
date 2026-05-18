// Static manifest of installable signatures.
// Source of truth for the picker UI.
// Add new people here + drop their canonical HTML at /public/signature/<slug>.html.
export const SIGNATURES = [
  {
    slug: 'ravi',
    name: 'Ravi Punn',
    title: 'Principal · 818 Capital Partners',
    email: 'ravi@818capitalpartners.com',
    headshot: '/team/ravi-punn-square.jpg',
  },
  {
    slug: 'angela',
    name: 'Angela Klein',
    title: 'Director of Lending Operations',
    email: 'angela@818capitalpartners.com',
    headshot: '/team/angela-klein-square.png',
  },
] as const;

export type SignatureEntry = typeof SIGNATURES[number];
