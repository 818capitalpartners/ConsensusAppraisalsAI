export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  headshot: string;
  linkedin?: string;
  specialties: string[];
}

export const TEAM: TeamMember[] = [
  {
    name: 'Ravi Punn',
    title: 'Founder & Principal',
    bio: 'Ravi is a serial entrepreneur and real estate developer with 20+ years across single-family development, rezoning, ground-up construction, investment syndication, and multifamily acquisitions — over $100M in transactions since 2006. He founded 818 Capital Partners after years on the borrower side of the table, building a lending and advisory platform designed to get the right operators the right capital.',
    headshot: '/team/ravi-punn-opt.jpg',
    linkedin: 'https://www.linkedin.com/in/ravipunn',
    specialties: ['DSCR', 'Multifamily', 'Fix & Flip', 'Operator-Lens Underwriting'],
  },
  {
    name: 'Angela Roark',
    title: 'Director of Lending Operations',
    bio: 'Angela manages every deal from submission to funding. She coordinates between borrowers, appraisers, title companies, and insurance agents to make sure nothing falls through the cracks. Known for her responsiveness and clear communication, Angela is the voice most borrowers hear throughout their loan process.',
    headshot: '/team/angela-roark.jpg',
    specialties: ['Fix & Flip', 'STR', 'Loan Processing'],
  },
];

export const COMPANY_STORY = {
  headline: 'Built by Investors, for Investors',
  paragraphs: [
    '818 Capital was founded on a simple premise: real estate investors deserve a lender that moves as fast as they do. Too many deals die waiting for term sheets, chasing underwriters, or navigating lender bureaucracies. We built something better.',
    'As a direct investment property lender, we fund DSCR rentals, fix-and-flip projects, short-term rentals, and multifamily acquisitions across 48 states. Our AI-powered underwriting engine — the Scenario Desk — analyzes deals in seconds, not days, giving investors certainty before they commit.',
    'Every deal gets a dedicated point of contact, transparent communication at every step, and a commitment to close in 14-21 days. We don\'t hide behind email queues or automated voicemails. When you call 818 Capital, a human picks up.',
  ],
};
