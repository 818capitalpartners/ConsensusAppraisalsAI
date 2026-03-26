'use client';

import { useState, useEffect, useCallback } from 'react';
import { TESTIMONIALS, type Testimonial } from '@/data/testimonials';

const BADGE_COLORS: Record<string, string> = {
  'DSCR': 'bg-blue-100 text-blue-700',
  'Fix & Flip': 'bg-orange-100 text-orange-700',
  'STR': 'bg-purple-100 text-purple-700',
  'Multifamily': 'bg-green-100 text-green-700',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-navy-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('');
  return (
    <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-sans font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="flex-shrink-0 w-[calc(100%-2rem)] md:w-[calc(33.333%-1rem)] bg-white rounded-xl border border-navy-100 p-6 shadow-sm hover:shadow-md transition">
      <StarRating rating={t.rating} />
      <p className="mt-4 text-sm text-navy-600 font-body leading-relaxed line-clamp-5">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3">
        <Avatar name={t.name} />
        <div className="min-w-0">
          <p className="text-sm font-sans font-semibold text-navy-900 truncate">{t.name}</p>
          <p className="text-xs text-navy-500 font-body truncate">{t.role}</p>
          <p className="text-xs text-navy-400 font-body">{t.location}</p>
        </div>
      </div>
      <div className="mt-4">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-sans font-semibold ${BADGE_COLORS[t.dealType] || 'bg-navy-100 text-navy-600'}`}>
          {t.dealType}
        </span>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const maxIndex = TESTIMONIALS.length - 1;

  const advance = useCallback(() => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goBack = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [isPaused, advance]);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-content px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Trusted by Investors Nationwide
          </p>
          <h2 className="section-heading">What Our Borrowers Say</h2>
        </div>

        {/* Carousel */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex gap-4 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / 3 + 1.333)}%)`,
            }}
          >
            {TESTIMONIALS.map(t => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>

          {/* Nav arrows */}
          <button
            onClick={goBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-navy-200 shadow-md flex items-center justify-center hover:bg-navy-50 transition z-10"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={advance}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-navy-200 shadow-md flex items-center justify-center hover:bg-navy-50 transition z-10"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition ${i === currentIndex ? 'bg-accent w-6' : 'bg-navy-200 hover:bg-navy-300'}`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Google Reviews CTA */}
        <div className="text-center mt-8">
          <a
            href="https://www.google.com/maps/place/818+Capital+Partners"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-accent transition font-body"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Read Our Google Reviews
          </a>
        </div>
      </div>
    </section>
  );
}
