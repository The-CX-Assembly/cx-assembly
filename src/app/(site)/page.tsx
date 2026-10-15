import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import SpeakerCard from '@/features/speakers/components/SpeakerCard';
import HeroArt from '@/components/site/HeroArt';
import InView from '@/components/site/InView';
import PhilosophyShowcase from '@/components/site/PhilosophyShowcase';
import RevealWords, { sentenceLines } from '@/components/site/RevealWords';
import { JoinButton } from '@/features/leads/components/JoinModal';
import { Accent, Eyebrow } from '@/components/site/Type';
import {
  ArrowDownRight,
  ArrowRight,
  BookIcon,
  ChatIcon,
  SparkIcon,
  UsersIcon,
} from '@/components/site/Icons';
import { getSiteContent, getSiteSettings } from '@/features/content/server';
import { getSpeakers } from '@/features/speakers/server';
import { pageGraph } from '@/features/seo/metadata';
import { defaultSettings } from '@/features/content/defaults';
import JsonLd from '@/features/seo/components/JsonLd';

export const revalidate = 60; // Revalidate every 60s or on demand via admin

// Icons for the four Why We Exist boxes, in order
const WHY_ICONS = [SparkIcon, BookIcon, ChatIcon, UsersIcon];

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
  const [content, speakers, settings] = await Promise.all([getSiteContent(), getSpeakers(), getSiteSettings()]);
  const { hero, whyWeExist, philosophy, forLeaders, forPartners, aboutUs } = content;

  const [principleLead, principleBody] = splitAtColon(forPartners.principle);
  const [beliefLead, belief] = splitAtColon(aboutUs.paragraph3);
  // Boxes: paragraph1, paragraph2, then paragraph3 split into its first sentence and the rest
  const [p3First, ...p3Rest] = whyWeExist.paragraph3.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [
    whyWeExist.paragraph3,
  ];
  const whyBoxes = [whyWeExist.paragraph1, whyWeExist.paragraph2, p3First, p3Rest.join(' ')].filter(Boolean);
  const heroWords = hero.headline.trim().split(/\s+/);
  const heroSpeakers = speakers.slice(0, 4);
  // "50 Founding CX Leaders" → big number + label
  const [, foundingNum = '', foundingLabel = settings.foundingCount] = settings.foundingCount.match(/^(\d+)\s+(.+)$/) ?? [];
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
          <div className="wrap hero__grid">
            <div className="hero__main">
              <p className="hero__kicker">
                <span className="hero__pulse" aria-hidden="true" />
                {hero.tagline}
              </p>

              <h1 className="display hero__title">
                {heroWords.map((word, i) => (
                  <Fragment key={i}>
                    <span className="hw" style={{ '--i': i } as React.CSSProperties}>
                      <span className={i >= heroWords.length - 2 ? 'hero__em' : undefined}>{word}</span>
                    </span>{' '}
                  </Fragment>
                ))}
              </h1>

              <p className="lede hero__lede">{hero.subheadline}</p>

              <div className="hero__actions">
                <JoinButton source="hero">
                  {hero.ctaPrimaryText}
                  <ArrowRight size={16} />
                </JoinButton>
                <Link href="/founding-50" className="link-arrow">
                  {hero.ctaSecondaryText}
                </Link>
              </div>
            </div>

            <div className="hero__visual">
              <div className="hero__panel">
                <HeroArt />
                <Image src="/brand/cx-mark-light.png" alt="" width={916} height={508} className="hero__panel-mark" priority aria-hidden="true" />
                {settings.credibilityText && (
                  <p className="hero__chip">
                    <span className="hero__pulse hero__pulse--light" aria-hidden="true" />
                    {settings.credibilityText}
                  </p>
                )}
              </div>

              {settings.foundingCount && (
                <Link href="/founding-50" className="hero__stat">
                  {heroSpeakers.length > 0 && (
                    <span className="hero__faces" aria-hidden="true">
                      {heroSpeakers.map((speaker) => (
                        <span key={speaker.id} className="hero__face">
                          <Image src={speaker.photoUrl || '/brand/leader-sample-1.jpg'} alt="" fill sizes="48px" style={{ objectFit: 'cover' }} />
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="hero__stat-text">
                    {foundingNum && <span className="hero__stat-num">{foundingNum}</span>}
                    <span className="hero__stat-label">{foundingLabel}</span>
                  </span>
                </Link>
              )}
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
                    <Image src="/brand/cx-mark-navy.png" alt="" width={916} height={508} className="marquee__sep" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── 01 WHY WE EXIST ─────────────────────────────── */}
        <section id="why-we-exist" className="section">
          <div className="wrap">
            <div className="eyebrow-line">
              <Eyebrow num="01">{whyWeExist.badge}</Eyebrow>
            </div>

            <RevealWords lines={sentenceLines(whyWeExist.headline)} className="why-head" />

            {/* Story cards: each one slides up and stacks over the last, light to dark */}
            <ol className="why-stack">
              {whyBoxes.map((text, i) => {
                const Icon = WHY_ICONS[i % WHY_ICONS.length];
                return (
                  <li key={i} className={`why-card why-card--${i % 4}`} style={{ '--i': i } as React.CSSProperties}>
                    <div className="why-card__meta">
                      <span className="why-card__num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="why-card__steps" aria-hidden="true">
                        {whyBoxes.map((_, j) => (
                          <span key={j} className={j <= i ? 'is-on' : undefined} />
                        ))}
                      </span>
                    </div>
                    <p className="why-card__text">{text}</p>
                    <span className="why-card__orb" aria-hidden="true">
                      <span className="why-card__ring" />
                      <span className="why-card__icon">
                        <Icon size={34} />
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>

            <InView className="why-body" threshold={0.3}>
              <p className="why-conclusion">
                <Image src="/brand/cx-mark-light.png" alt="" width={916} height={508} className="why-conclusion__mark" />
                <span className="why-conclusion__text">{whyWeExist.conclusion}</span>
              </p>
            </InView>
          </div>
        </section>

        {/* ── 02 PHILOSOPHY ───────────────────────────────── */}
        <section className="section section--ink">
          <div className="wrap">
            <div className="eyebrow-line">
              <Eyebrow num="02">{philosophy.badge}</Eyebrow>
            </div>

            <div className="ph-head">
              <h2 className="h-xl reveal">
                <Accent text={philosophy.headline} />
              </h2>
              {philosophy.intro && <p className="lede reveal">{philosophy.intro}</p>}
            </div>

            <div className="reveal">
              <PhilosophyShowcase pillars={philosophy.pillars} />
            </div>
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
              {speakers.slice(0, 4).map((speaker) => (
                <SpeakerCard key={speaker.id} speaker={speaker} />
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
              <Image src="/brand/cx-mark-light.png" alt="" width={916} height={508} className="principle__mark" aria-hidden="true" />
              {principleLead && <p className="eyebrow">{principleLead}</p>}
              <p className="principle__text">{principleBody}</p>
            </div>
          </div>
        </section>

        {/* ── 06 ABOUT US ─────────────────────────────────── */}
        <section id="about" className="section">
          <div className="wrap">
            <div className="eyebrow-line">
              <Eyebrow num="06">{aboutUs.badge}</Eyebrow>
            </div>

            <div className="ph-head">
              <RevealWords lines={sentenceLines(aboutUs.headline)} className="h-xl" />
              <p className="lede reveal">{aboutUs.paragraph1}</p>
            </div>

            {/* The wrapper is observed; the panel inside it is what gets clipped */}
            <InView className="founder-wrap" threshold={0.1}>
              <div className="founder-panel">
                <figure className="founder-panel__photo">
                  <Image
                    src="/images/vivek-sheth.jpg"
                    alt="Vivek Sheth"
                    fill
                    sizes="(max-width: 900px) 100vw, 42vw"
                    style={{ objectFit: 'cover', objectPosition: '55% 20%' }}
                  />
                  <figcaption className="founder-panel__caption">{aboutUs.founderNote}</figcaption>
                </figure>

                <div className="founder-panel__body">
                  <Image src="/brand/cx-mark-light.png" alt="" width={916} height={508} className="founder-panel__mark" aria-hidden="true" />
                  <p className="founder-panel__intro">{aboutUs.paragraph2}</p>

                  {/* paragraph3, shown whole: the lead-in small, the belief large */}
                  <blockquote className="founder-panel__quote">
                    <span className="founder-panel__qmark" aria-hidden="true">
                      &ldquo;
                    </span>
                    <p>
                      {beliefLead && <span className="founder-panel__lead">{beliefLead}: </span>}
                      <span className="founder-panel__belief">{belief}</span>
                    </p>
                  </blockquote>
                </div>
              </div>
            </InView>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
