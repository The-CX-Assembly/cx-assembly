import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LeaderCard from '@/components/LeaderCard';
import { JoinButton } from '@/components/JoinModal';
import { Accent, Eyebrow } from '@/components/Type';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from '@/components/Icons';
import { getSiteContent, getLeaders, getSiteSettings } from '@/lib/content';
import { pageGraph } from '@/lib/seo';
import { defaultSettings } from '@/lib/default-content';
import JsonLd from '@/components/JsonLd';

export const revalidate = 60; // Revalidate every 60s or on demand via admin

// Short labels for the three For Partners paragraphs (paragraph1–3 in the CMS)
const PARTNER_TITLES = ['Built Through Collaboration', 'Understanding Before Solutions', 'Meaningful Industry Engagement'];

function splitLabel(item: string) {
  const i = item.indexOf(':');
  return i === -1 ? { title: item, text: '' } : { title: item.slice(0, i).trim(), text: item.slice(i + 1).trim() };
}

/** "Lead in: Main point." → ['Lead in', 'Main point.'] */
function splitAtColon(text: string): [string, string] {
  const i = text.indexOf(':');
  return i === -1 ? ['', text] : [text.slice(0, i).trim(), text.slice(i + 1).trim()];
}

export default async function HomePage() {
  const [content, leaders, settings] = await Promise.all([getSiteContent(), getLeaders(), getSiteSettings()]);
  const { hero, whyWeExist, philosophy, forLeaders, forPartners, aboutUs } = content;

  const [principleLead, principleBody] = splitAtColon(forPartners.principle);
  const [beliefLead, belief] = splitAtColon(aboutUs.paragraph3);
  const credibility = [settings.credibilityText, settings.foundingCount].filter(Boolean);
  const marqueeRun = [...credibility, ...credibility, ...credibility];

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: '/',
          name: settings.siteTitle || defaultSettings.siteTitle,
          description: settings.metaDescription || defaultSettings.metaDescription,
        })}
      />
      <Navbar />

      <main>
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="hero">
          <Image src="/brand/mark-navy.png" alt="" width={750} height={425} className="hero__mark" priority aria-hidden="true" />
          <div className="wrap">
            <h1 className="display hero__title rise">
              <Accent text={hero.headline} />
            </h1>

            <div className="hero__foot rise-2">
              <div className="hero__copy">
                <p className="lede">{hero.subheadline}</p>
                <p className="hero__tagline">{hero.tagline}</p>
              </div>
              <div className="hero__actions">
                <Link href="/founding-50" className="link-arrow">
                  {hero.ctaSecondaryText}
                </Link>
                <JoinButton source="hero">
                  {hero.ctaPrimaryText}
                  <ArrowRight size={16} />
                </JoinButton>
              </div>
            </div>
          </div>
        </section>

        {/* Credibility marquee */}
        <div className="marquee" role="region" aria-label={credibility.join('. ')}>
          <div className="marquee__track" aria-hidden="true">
            {[0, 1].map((group) => (
              <div key={group} className="marquee__group">
                {marqueeRun.map((item, i) => (
                  <span key={i} style={{ display: 'contents' }}>
                    <span className="marquee__item">{item}</span>
                    <Image src="/brand/mark-navy.png" alt="" width={750} height={425} className="marquee__sep" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── 01 WHY WE EXIST ─────────────────────────────── */}
        <section id="why-we-exist" className="section">
          <div className="wrap split">
            <div className="split__aside">
              <Eyebrow num="01">{whyWeExist.badge}</Eyebrow>
            </div>
            <div className="split__main">
              <h2 className="h-xl reveal">
                <Accent text={whyWeExist.headline} />
              </h2>

              <div className="split" style={{ marginTop: 'clamp(48px, 6vw, 80px)' }}>
                <div className="split__half-l prose reveal">
                  <p>{whyWeExist.paragraph1}</p>
                  <p>{whyWeExist.paragraph2}</p>
                </div>
                <div className="split__half-r prose reveal">
                  <p>{whyWeExist.paragraph3}</p>
                </div>
              </div>

              <hr className="rule" style={{ margin: 'clamp(48px, 6vw, 80px) 0 32px' }} />
              <p className="statement reveal">{whyWeExist.conclusion}</p>
            </div>
          </div>
        </section>

        {/* ── 02 PHILOSOPHY ───────────────────────────────── */}
        <section className="section section--ink">
          <div className="wrap">
            <div className="split" style={{ marginBottom: 'clamp(56px, 7vw, 104px)' }}>
              <div className="split__aside">
                <Eyebrow num="02">{philosophy.badge}</Eyebrow>
              </div>
              <div className="split__main">
                <h2 className="h-xl reveal">
                  <Accent text={philosophy.headline} />
                </h2>
                {philosophy.intro && (
                  <p className="lede reveal" style={{ marginTop: 32, maxWidth: '56ch' }}>
                    {philosophy.intro}
                  </p>
                )}
              </div>
            </div>

            <ol className="rows">
              {philosophy.pillars.map((pillar, idx) => (
                <li key={pillar.title} className="row reveal">
                  <span className="row__num">0{idx + 1}</span>
                  <h3 className="row__title">{pillar.title}</h3>
                  <p className="row__body">{pillar.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 03 FOR CX LEADERS ───────────────────────────── */}
        <section id="for-cx-leaders" className="section">
          <div className="wrap">
            <div className="eyebrow-line">
              <Eyebrow num="03">{forLeaders.badge}</Eyebrow>
            </div>

            <div className="split" style={{ marginTop: 'clamp(40px, 5vw, 72px)' }}>
              <div className="split__l5 sticky">
                <h2 className="caps-head" style={{ marginTop: 0, fontSize: 'clamp(2rem, 3.3vw, 3.125rem)', paddingRight: 16 }}>
                  {forLeaders.headline}
                </h2>
                <p className="lede" style={{ marginTop: 32 }}>
                  {forLeaders.subheadline}
                </p>
                <p style={{ marginTop: 20, fontSize: '1.0625rem', lineHeight: 1.7 }}>{forLeaders.callout}</p>
                {forLeaders.closing && (
                  <p className="h-md" style={{ marginTop: 40, maxWidth: '28ch' }}>
                    {forLeaders.closing}
                  </p>
                )}
              </div>

              <div className="split__r7">
                <p className="eyebrow" style={{ marginBottom: 24 }}>
                  What You Can Expect
                </p>
                <ul className="tiles">
                  {forLeaders.takeaways.map((item) => {
                    const { title, text } = splitLabel(item);
                    return (
                      <li key={item} className="tile reveal">
                        <div className="tile__head">
                          <h3 className="tile__title">{title}</h3>
                          <span className="tile__arrow">
                            <ArrowDownRight />
                          </span>
                        </div>
                        {text && <p className="tile__text">{text}</p>}
                      </li>
                    );
                  })}
                  <li className="reveal" style={{ display: 'flex' }}>
                    <JoinButton source="for-leaders-tile" className="tile tile--cta">
                      <span className="tile__head">
                        <span className="tile__title">{forLeaders.ctaText}</span>
                        <span className="tile__arrow">
                          <ArrowRight size={22} />
                        </span>
                      </span>
                      <span className="tile__text">{forLeaders.note}</span>
                    </JoinButton>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 04 FOUNDING 50 ──────────────────────────────── */}
        <section className="section section--paper-2">
          <div className="wrap">
            <div className="section-head">
              <div>
                <Eyebrow num="04">The Founding 50</Eyebrow>
                <h2 className="h-xl reveal" style={{ marginTop: 28 }}>
                  <Accent text={content.founding50.subheadline} />
                </h2>
              </div>
              <Link href="/founding-50" className="link-arrow">
                {hero.ctaSecondaryText}
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="people">
              {leaders.slice(0, 4).map((leader) => (
                <LeaderCard key={leader.id} leader={leader} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 05 FOR PARTNERS ─────────────────────────────── */}
        <section id="for-partners" className="section section--ink" style={{ overflow: 'hidden' }}>
          <div className="wrap">
            <div className="eyebrow-line">
              <Eyebrow num="05">{forPartners.badge}</Eyebrow>
            </div>
            <h2 className="caps-head reveal">{forPartners.headline}</h2>

            <div className="cells">
              {[forPartners.paragraph1, forPartners.paragraph2, forPartners.paragraph3].map((p, i) => (
                <div key={i} className="cell reveal">
                  <span className="cell__num">0{i + 1}</span>
                  <h3 className="cell__title">{PARTNER_TITLES[i]}</h3>
                  <p className="cell__text">{p}</p>
                </div>
              ))}
            </div>

            <div className="principle reveal">
              <Image src="/brand/mark-light.png" alt="" width={750} height={425} className="principle__mark" aria-hidden="true" />
              {principleLead && <p className="eyebrow">{principleLead}</p>}
              <p className="principle__text">{principleBody}</p>
            </div>
          </div>
        </section>

        {/* ── 06 ABOUT US ─────────────────────────────────── */}
        <section id="about" className="section">
          <div className="wrap">
            <div className="split">
              <div className="split__aside">
                <Eyebrow num="06">{aboutUs.badge}</Eyebrow>
              </div>
              <div className="split__main">
                <h2 className="h-xl reveal">
                  <Accent text={aboutUs.headline} />
                </h2>
                <div className="split" style={{ marginTop: 'clamp(48px, 6vw, 80px)' }}>
                  <p className="split__half-l lede reveal">{aboutUs.paragraph1}</p>
                  <p className="split__half-r reveal" style={{ fontSize: '1.0625rem', lineHeight: 1.7 }}>
                    {aboutUs.paragraph2}
                  </p>
                </div>
              </div>
            </div>

            <div className="belief split">
              <div className="split__aside">
                <Eyebrow>One shared belief</Eyebrow>
              </div>
              <div className="split__main">
                {beliefLead && (
                  <p className="muted" style={{ fontSize: '1.0625rem', maxWidth: '60ch' }}>
                    {beliefLead}:
                  </p>
                )}
                <p className="belief__text reveal">
                  <mark>{belief}</mark>
                </p>
              </div>
            </div>

            <div className="split">
              <dl className="split__main facts">
                <div className="facts__item reveal">
                  <dt>An initiative of</dt>
                  <dd>
                    <strong>The Executive Assembly</strong>
                    Building trusted, peer-led leadership communities.
                  </dd>
                </div>
                <div className="facts__item reveal">
                  <dt>Founded by</dt>
                  <dd>
                    <strong>Vivek Sheth</strong>
                    {aboutUs.founderNote.replace(/^.*?Vivek Sheth,?\s*/, '').replace(/^\w/, (c) => c.toUpperCase())}
                  </dd>
                </div>
                <div className="facts__item reveal">
                  <dt>Sister community</dt>
                  <dd>
                    <strong>The CMO Assembly</strong>
                    <a href="https://thecmoassembly.com/" target="_blank" rel="noopener noreferrer" className="link-arrow">
                      thecmoassembly.com
                      <ArrowUpRight size={14} />
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
