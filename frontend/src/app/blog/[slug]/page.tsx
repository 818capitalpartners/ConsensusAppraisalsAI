import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPostBySlug, getAllSlugs, POSTS } from '@/lib/blog-data';
import InlineLeadCapture from '@/components/InlineLeadCapture';

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };
  const url = `https://www.818capitalpartners.com/blog/${slug}`;
  return {
    title: `${post.title} | 818 Capital`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image, alt: post.title }],
      publishedTime: post.date,
      authors: ['https://www.818capitalpartners.com/about#ravipunn'],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images: [post.image] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Simple markdown-to-HTML (handles ##, **, |tables|, -, numbered lists)
  const html = post.content
    .split('\n')
    .map((line) => {
      if (line.startsWith('## ')) return `<h2 class="text-h3 text-navy-900 mt-10 mb-4">${line.slice(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3 class="text-h4 text-navy-900 mt-8 mb-3">${line.slice(4)}</h3>`;
      if (line.startsWith('| ') && line.includes('|')) {
        const cells = line.split('|').filter(Boolean).map((c) => c.trim());
        if (cells.every((c) => /^[-:]+$/.test(c))) return ''; // separator row
        const tag = line.includes('---') ? 'th' : 'td';
        return `<tr>${cells.map((c) => `<${tag} class="border border-navy-200 px-4 py-2 text-sm">${c}</${tag}>`).join('')}</tr>`;
      }
      if (line.startsWith('- **')) {
        const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<li class="ml-4 text-navy-600 font-body text-sm leading-relaxed mb-2">${content}</li>`;
      }
      if (line.startsWith('- ')) return `<li class="ml-4 text-navy-600 font-body text-sm leading-relaxed mb-1">${line.slice(2)}</li>`;
      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<li class="ml-4 text-navy-600 font-body text-sm leading-relaxed mb-2 list-decimal">${content}</li>`;
      }
      if (line.trim() === '') return '<br/>';
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-navy-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline font-semibold">$1</a>');
      return `<p class="text-navy-600 font-body text-sm leading-relaxed mb-3">${formatted}</p>`;
    })
    .join('\n');

  const related = POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  const postUrl = `https://www.818capitalpartners.com/blog/${slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [post.image],
    datePublished: post.date,
    dateModified: post.date,
    author: { '@id': 'https://www.818capitalpartners.com/about#ravipunn' },
    publisher: { '@id': 'https://www.818capitalpartners.com/#organization' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    articleSection: post.category,
    inLanguage: 'en-US',
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.818capitalpartners.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.818capitalpartners.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Hero */}
      <section className="relative min-h-[350px] flex items-end overflow-hidden">
        <Image src={post.image} alt={post.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/95 via-navy-900/60 to-navy-900/20" />
        <div className="relative mx-auto max-w-content px-6 py-12 w-full">
          <span className="bg-accent text-white text-xs font-sans font-semibold uppercase tracking-wide px-3 py-1 rounded">{post.category}</span>
          <h1 className="text-h1 text-white mt-4 max-w-3xl">{post.title}</h1>
          <p className="mt-3 text-sm text-navy-200 font-body">{post.date} &middot; {post.readTime}</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl px-6">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>

      {/* Inline Lead Capture */}
      <section className="bg-white pb-4">
        <div className="mx-auto max-w-3xl px-6">
          <InlineLeadCapture />
        </div>
      </section>

      {/* Author Bio */}
      <section className="bg-white py-8 border-t border-navy-100">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-navy-200 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-sans font-bold text-navy-500">RP</span>
            </div>
            <div>
              <p className="text-sm font-sans font-semibold text-navy-900">Written by Ravi Punn</p>
              <p className="text-xs text-accent font-sans font-semibold">Founder &amp; Principal, 818 Capital Partners</p>
              <p className="mt-2 text-xs text-navy-500 font-body leading-relaxed">
                Serial entrepreneur and real estate developer with 20+ years and $100M+ in transactions. Ravi founded 818 Capital to get the right operators the right capital — with an advisory process that&apos;s relational, educational, and direct.
              </p>
              <Link href="/about" className="text-xs text-accent font-sans font-semibold mt-2 inline-block hover:underline">
                Learn more about our team &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-h3 text-white">Ready to Run Your Numbers?</h2>
          <p className="mt-2 text-white/80 font-body">Submit your scenario and get an AI-powered analysis.</p>
          <Link href="/dscr-loans#form" className="btn-white mt-6 inline-flex">Submit a Scenario</Link>
        </div>
      </section>

      {/* Related */}
      <section className="bg-navy-50/50 py-12">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-8">More Articles</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-lg border border-navy-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="relative h-40 overflow-hidden">
                  <Image src={p.image} alt={p.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-sans font-semibold text-accent uppercase tracking-wide">{p.category}</span>
                  <h3 className="mt-1 text-sm font-sans font-semibold text-navy-900 group-hover:text-accent transition">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
