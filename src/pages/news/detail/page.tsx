import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { newsItems, categoryColors, categoryIcons, NewsItem } from '../../../mocks/newsArticles';
import { usePageMeta } from '../../../hooks/usePageMeta';
import SiteNav from '../../../components/feature/SiteNav';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://naloxoneadvocatesplymouth.co.uk';
const ORG_NAME = 'Naloxone Advocates Plymouth CIC';
const ORG_URL = SITE_URL;

function injectSchema(id: string, data: object) {
  document.getElementById(id)?.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

function removeSchema(id: string) {
  document.getElementById(id)?.remove();
}

function setMetaTag(selector: string, attrName: string, attrValue: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsItem[]>([]);
  const [moreStories, setMoreStories] = useState<NewsItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // ── Print handler ─────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Inject print styles once ──────────────────────────────────────────────
  useEffect(() => {
    const styleId = 'article-print-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media print {
          /* Hide everything except the article body */
          body > * { display: none !important; }
          #article-print-root { display: block !important; }

          /* Reset page */
          @page { margin: 20mm 15mm; }

          /* Show only the printable article wrapper */
          .print\\:hidden { display: none !important; }
          .print-article-content { display: block !important; }

          /* Typography */
          .print-article-content h1 { font-size: 24pt; margin-bottom: 8pt; }
          .print-article-content p  { font-size: 11pt; line-height: 1.6; margin-bottom: 8pt; }
          .print-article-content blockquote { border-left: 3pt solid #0d9488; padding-left: 10pt; font-style: italic; }

          /* Remove shadows / backgrounds */
          * { box-shadow: none !important; background: white !important; color: black !important; }
          a { text-decoration: none !important; color: black !important; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => { document.getElementById(styleId)?.remove(); };
  }, []);

  useEffect(() => {
    if (!id) { navigate('/news'); return; }
    const found = newsItems.find(item => item.id === id);
    if (!found) { navigate('/news'); return; }
    setArticle(found);
    setRelatedArticles(newsItems.filter(item => item.id !== id && item.category === found.category).slice(0, 3));
    setMoreStories(newsItems.filter(item => item.id !== id).slice(0, 3));
  }, [id, navigate]);

  // ── SEO: page-level meta ──────────────────────────────────────────────────
  usePageMeta({
    title: article
      ? `${article.title} | ${ORG_NAME}`
      : `News | ${ORG_NAME}`,
    description: article?.excerpt || 'Read the latest news and stories from Naloxone Advocates Plymouth CIC.',
    canonical: article ? `${SITE_URL}/news/${article.id}` : `${SITE_URL}/news`,
    ogTitle: article?.title,
    ogDescription: article?.excerpt,
  });

  // ── SEO: extra meta tags + Article schema ─────────────────────────────────
  useEffect(() => {
    if (!article) return;

    const url = `${SITE_URL}/news/${article.id}`;

    // Keywords
    setMetaTag('meta[name="keywords"]', 'name', 'keywords',
      `${article.category}, harm reduction, naloxone, Plymouth, overdose prevention, ${ORG_NAME}`);

    // OG image
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', article.image);
    setMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'article');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', ORG_NAME);

    // Twitter card
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', article.image);
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@napplymouth');

    // Article published/modified
    setMetaTag('meta[property="article:published_time"]', 'property', 'article:published_time', article.date);
    setMetaTag('meta[property="article:section"]', 'property', 'article:section', article.category);
    setMetaTag('meta[property="article:tag"]', 'property', 'article:tag',
      `harm reduction, naloxone, Plymouth, ${article.category}`);

    // ── Schema.org JSON-LD ────────────────────────────────────────────────
    const articleBody = article.body.join(' ');
    const wordCount = articleBody.split(/\s+/).length;

    injectSchema('schema-news-detail', {
      "@context": "https://schema.org",
      "@graph": [
        // 1. WebPage
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          "url": url,
          "name": `${article.title} | ${ORG_NAME}`,
          "description": article.excerpt,
          "inLanguage": "en-GB",
          "isPartOf": { "@id": `${SITE_URL}/#website` },
          "breadcrumb": { "@id": `${url}#breadcrumb` },
          "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": article.image,
            "width": 1200,
            "height": 630
          }
        },

        // 2. BreadcrumbList
        {
          "@type": "BreadcrumbList",
          "@id": `${url}#breadcrumb`,
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
            { "@type": "ListItem", "position": 2, "name": "News", "item": `${SITE_URL}/news` },
            { "@type": "ListItem", "position": 3, "name": article.title, "item": url }
          ]
        },

        // 3. Article (NewsArticle)
        {
          "@type": "NewsArticle",
          "@id": `${url}#article`,
          "headline": article.title,
          "name": article.title,
          "description": article.excerpt,
          "url": url,
          "datePublished": article.datePublished,
          "dateModified": article.datePublished,
          "inLanguage": "en-GB",
          "articleSection": article.category,
          "wordCount": wordCount,
          "timeRequired": article.readTime || '3 min read',
          "keywords": `harm reduction, naloxone, Plymouth, overdose prevention, ${article.category}`,
          "articleBody": articleBody,
          "image": {
            "@type": "ImageObject",
            "url": article.image,
            "width": 1200,
            "height": 630
          },
          "author": {
            "@type": "Person",
            "name": article.author,
            "image": {
              "@type": "ImageObject",
              "url": article.authorPhoto,
              "width": 200,
              "height": 200
            },
            "worksFor": {
              "@type": "Organization",
              "name": ORG_NAME,
              "url": ORG_URL
            }
          },
          "publisher": {
            "@type": "Organization",
            "name": ORG_NAME,
            "url": ORG_URL,
            "logo": {
              "@type": "ImageObject",
              "url": "https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg",
              "width": 200,
              "height": 60
            }
          },
          "mainEntityOfPage": { "@id": `${url}#webpage` },
          "isPartOf": {
            "@type": "Blog",
            "name": `${ORG_NAME} — News & Updates`,
            "url": `${SITE_URL}/news`
          }
        },

        // 4. Organisation (sitewide anchor)
        {
          "@type": "NGO",
          "@id": `${SITE_URL}/#organization`,
          "name": ORG_NAME,
          "url": ORG_URL,
          "sameAs": [
            "https://www.facebook.com/napplymouth",
            "https://www.instagram.com/napplymouth"
          ]
        }
      ]
    });

    return () => removeSchema('schema-news-detail');
  }, [article]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article?.title || '';
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!article) return null;

  const articleUrl = `${SITE_URL}/news/${article.id}`;

  return (
    <div className="min-h-screen bg-white" id="article-print-root">
      <SiteNav />

      {/* Hero */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          title={`${article.title} — ${ORG_NAME}`}
          className="w-full h-full object-cover object-top"
          width={1200}
          height={500}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-5xl mx-auto px-6 pb-16 w-full">
            {/* Breadcrumb — visible + semantic */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-white/80 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><i className="ri-arrow-right-s-line"></i></li>
                <li><Link to="/news" className="hover:text-white transition-colors">News</Link></li>
                <li><i className="ri-arrow-right-s-line"></i></li>
                <li className="text-white font-medium truncate max-w-xs">{article.title}</li>
              </ol>
            </nav>

            {/* Category */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${categoryColors[article.category]}`}>
                <i className={`${categoryIcons[article.category]} text-base`}></i>
                {article.category}
              </span>
            </div>

            {/* H1 */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <i className="ri-calendar-line"></i>
                <time dateTime={article.datePublished}>{article.date}</time>
              </div>
              {article.readTime && (
                <div className="flex items-center gap-2">
                  <i className="ri-time-line"></i>
                  <span>{article.readTime}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <i className="ri-user-line"></i>
                <span>{article.author}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Article Body */}
          <article className="lg:col-span-2 print-article-content" itemScope itemType="https://schema.org/NewsArticle">
            {/* Hidden microdata */}
            <meta itemProp="headline" content={article.title} />
            <meta itemProp="description" content={article.excerpt} />
            <meta itemProp="datePublished" content={article.datePublished} />
            <meta itemProp="dateModified" content={article.datePublished} />
            <meta itemProp="url" content={articleUrl} />
            <meta itemProp="image" content={article.image} />
            <span itemProp="author" itemScope itemType="https://schema.org/Person">
              <meta itemProp="name" content={article.author} />
              <meta itemProp="image" content={article.authorPhoto} />
            </span>
            <span itemProp="publisher" itemScope itemType="https://schema.org/Organization">
              <meta itemProp="name" content={ORG_NAME} />
              <meta itemProp="url" content={ORG_URL} />
            </span>

            {/* Social Share */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 print:hidden">
              <span className="text-sm font-semibold text-gray-700">Share:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity cursor-pointer"
                aria-label="Share on Facebook"
              >
                <i className="ri-facebook-fill"></i>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Share on X (Twitter)"
              >
                <i className="ri-twitter-x-fill"></i>
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors relative cursor-pointer"
                aria-label="Copy link"
              >
                <i className={copied ? 'ri-check-line' : 'ri-link'}></i>
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Link copied!
                  </span>
                )}
              </button>
              {/* Print button — inline share bar */}
              <button
                onClick={handlePrint}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                aria-label="Print article"
                title="Print article"
              >
                <i className="ri-printer-line"></i>
              </button>
            </div>

            {/* Body paragraphs */}
            <div className="prose prose-lg max-w-none" itemProp="articleBody">
              {article.body.map((paragraph, index) => {
                if (article.category === 'Story' && index === 1) {
                  return (
                    <div key={index}>
                      <p className="text-gray-700 leading-relaxed mb-6">{paragraph}</p>
                      <blockquote className="border-l-4 border-teal-500 pl-6 py-4 my-8 bg-gray-50 rounded-r-lg">
                        <p className="text-xl font-medium text-gray-900 italic mb-2">
                          &ldquo;{article.excerpt}&rdquo;
                        </p>
                      </blockquote>
                    </div>
                  );
                }
                return (
                  <p key={index} className="text-gray-700 leading-relaxed mb-6">{paragraph}</p>
                );
              })}
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {['Harm Reduction', 'Plymouth', 'Naloxone', 'Overdose Prevention', article.category].map(tag => (
                  <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author card */}
            <div className="mt-10 bg-gray-50 rounded-xl p-6 flex items-start gap-5">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-teal-200">
                <img
                  src={article.authorPhoto}
                  alt={`${article.author} — ${ORG_NAME}`}
                  title={`${article.author}, ${ORG_NAME}`}
                  className="w-full h-full object-cover object-top"
                  width={64}
                  height={64}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Written by</p>
                <p className="font-bold text-gray-900 text-lg">{article.author}</p>
                <p className="text-sm text-teal-600 font-medium mt-0.5">{ORG_NAME}</p>
                <p className="text-sm text-gray-600 mt-2">
                  A member of our peer-led harm reduction team dedicated to saving lives through naloxone training and community support across Plymouth and Devon.
                </p>
              </div>
            </div>

            {/* Newsletter Subscription Box */}
            <div className="mt-10 print:hidden">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-8">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/10"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg">
                      <i className="ri-mail-send-line text-white text-xl"></i>
                    </div>
                    <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">Stay Informed</span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    Get stories like this in your inbox
                  </h3>
                  <p className="text-white/80 text-sm mb-6 max-w-md">
                    Join our mailing list for the latest harm reduction news, naloxone training updates, and community stories from Plymouth and Devon.
                  </p>

                  {newsletterStatus === 'success' ? (
                    <div className="flex items-center gap-3 bg-white/20 rounded-xl px-5 py-4">
                      <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full flex-shrink-0">
                        <i className="ri-check-line text-teal-600 text-lg"></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold">You&apos;re subscribed!</p>
                        <p className="text-white/80 text-sm">Thank you — we&apos;ll be in touch with our next update.</p>
                      </div>
                    </div>
                  ) : (
                    <form
                      id="article-newsletter-form"
                      data-readdy-form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newsletterEmail) return;
                        setNewsletterStatus('submitting');
                        try {
                          const body = new URLSearchParams();
                          body.append('email', newsletterEmail);
                          const res = await fetch('https://readdy.ai/api/form/d6ijvoodenotc3br45j0', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: body.toString(),
                          });
                          if (res.ok) {
                            setNewsletterStatus('success');
                            setNewsletterEmail('');
                          } else {
                            setNewsletterStatus('error');
                          }
                        } catch {
                          setNewsletterStatus('error');
                        }
                      }}
                      className="flex flex-col sm:flex-row gap-3"
                    >
                      <input
                        type="email"
                        name="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="flex-1 px-4 py-3 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <button
                        type="submit"
                        disabled={newsletterStatus === 'submitting'}
                        className="px-6 py-3 bg-white text-teal-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-70"
                      >
                        {newsletterStatus === 'submitting' ? (
                          <span className="flex items-center gap-2">
                            <i className="ri-loader-4-line animate-spin"></i> Subscribing…
                          </span>
                        ) : (
                          'Subscribe Free'
                        )}
                      </button>
                    </form>
                  )}

                  {newsletterStatus === 'error' && (
                    <p className="mt-3 text-white/80 text-xs flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <p className="mt-4 text-white/60 text-xs">
                    No spam, ever. Unsubscribe at any time.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 print:hidden">
            <div className="sticky top-24 space-y-8">
              {/* CTA */}
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
                <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-lg mb-4">
                  <i className="ri-calendar-check-line text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Book Training</h3>
                <p className="text-white/90 text-sm mb-4">
                  Learn how to save lives with naloxone. Free training sessions available across Plymouth.
                </p>
                <Link
                  to="/booking"
                  className="block w-full bg-white text-teal-600 text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Book Now
                </Link>
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link key={related.id} to={`/news/${related.id}`} className="block group">
                        <div className="flex gap-3">
                          <img
                            src={related.image}
                            alt={related.title}
                            className="w-20 h-20 object-cover object-top rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold mb-1 ${categoryColors[related.category]}`}>
                              <i className={`${categoryIcons[related.category]} text-xs`}></i>
                              {related.category}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                              {related.title}
                            </h4>
                            <time className="text-xs text-gray-500 mt-1 block" dateTime={related.date}>{related.date}</time>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share sidebar */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Article</h3>
                <div className="flex gap-3">
                  <button onClick={() => handleShare('facebook')} className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    <i className="ri-facebook-fill"></i> Facebook
                  </button>
                  <button onClick={() => handleShare('twitter')} className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-twitter-x-fill"></i> X
                  </button>
                </div>
                <button onClick={() => handleShare('copy')} className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap">
                  <i className={copied ? 'ri-check-line' : 'ri-link'}></i>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                {/* Print button — sidebar */}
                <button
                  onClick={handlePrint}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-printer-line"></i> Print Article
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* More Stories */}
      {moreStories.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">More Stories</h2>
              <Link to="/news" className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-2 transition-colors whitespace-nowrap">
                View All News <i className="ri-arrow-right-line"></i>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {moreStories.map((story) => (
                <Link key={story.id} to={`/news/${story.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={`absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[story.category]}`}>
                      <i className={`${categoryIcons[story.category]} text-xs`}></i>
                      {story.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <time dateTime={story.date} className="flex items-center gap-1">
                        <i className="ri-calendar-line"></i>{story.date}
                      </time>
                      {story.readTime && (
                        <span className="flex items-center gap-1">
                          <i className="ri-time-line"></i>{story.readTime}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{story.excerpt}</p>
                    <span className="text-teal-600 font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                      Read Full Story <i className="ri-arrow-right-line"></i>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">{ORG_NAME}</h3>
              <p className="text-gray-400 text-sm">Saving lives through education, training, and naloxone distribution across Plymouth.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/training" className="hover:text-white transition-colors">Training</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/news" className="hover:text-white transition-colors">News</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Involved</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/volunteer" className="hover:text-white transition-colors">Volunteer</Link></li>
                <li><Link to="/partners" className="hover:text-white transition-colors">Partners</Link></li>
                <li><Link to="/booking" className="hover:text-white transition-colors">Book Training</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Emergency</h4>
              <p className="text-sm text-gray-400 mb-2">In an emergency, always call:</p>
              <a href="tel:999" className="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors">999</a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {ORG_NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
