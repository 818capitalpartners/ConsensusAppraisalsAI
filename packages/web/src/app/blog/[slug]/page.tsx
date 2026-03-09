import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: `${post.title} | 818 Capital Partners Blog`,
    description: post.description,
  };
}

function renderMarkdown(content: string): string {
  // Simple markdown-to-HTML for blog content
  // Handles: headers, bold, italic, links, lists, code blocks, blockquotes, paragraphs
  let html = content
    // Code blocks (must come first)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-slate-800 rounded-lg p-4 my-4 overflow-x-auto text-sm"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-sm text-blue-300">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-3 text-slate-100">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4 text-slate-100">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-4 text-slate-100">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 pl-2">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 pl-2 list-decimal">$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 my-4 text-slate-400 italic">$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-slate-700" />')
    // Line breaks to paragraphs
    .replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed mb-4">')

  // Wrap in paragraph tags
  html = `<p class="text-slate-300 leading-relaxed mb-4">${html}</p>`;

  // Wrap consecutive li elements in ul
  html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, (match) => {
    if (match.includes('list-decimal')) {
      return `<ol class="list-decimal my-4 space-y-1">${match}</ol>`;
    }
    return `<ul class="list-disc my-4 space-y-1">${match}</ul>`;
  });

  return html;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const contentHtml = renderMarkdown(post.content);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <article className="max-w-3xl mx-auto px-4 py-16">
          {/* Back link */}
          <Link href="/blog" className="text-sm text-blue-400 hover:text-blue-300 mb-8 inline-block">
            &larr; Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                {post.category}
              </span>
              <span className="text-xs text-slate-500">{post.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-lg text-slate-400 mb-4">{post.description}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>By {post.author}</span>
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to run your numbers?</h3>
            <p className="text-slate-400 mb-6">Get an instant AI-powered analysis of your deal — free, no strings.</p>
            <Link
              href="/get-quote"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Analyze Your Deal &rarr;
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
