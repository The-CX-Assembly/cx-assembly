import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import SpeakerCard from '@/modules/speakers/components/SpeakerCard';
import InView from '@/components/site/InView';
import PhilosophyShowcase from '@/components/site/PhilosophyShowcase';
import RevealWords, { sentenceLines } from '@/components/site/RevealWords';
import { JoinButton } from '@/modules/leads/components/JoinModal';
import { Accent, Eyebrow } from '@/components/site/Type';
import { ArrowRight } from '@/components/site/Icons';
import { getSiteContent, getSiteSettings } from '@/modules/content/services/content.service';
import { getSpeakers } from '@/modules/speakers/services/speakers.service';
import { pageGraph } from '@/modules/seo/utils/metadata';
import { defaultSettings } from '@/modules/content/models/content.defaults';
import JsonLd from '@/modules/seo/components/JsonLd';
import { getMediaSettings, getPublishedVideos } from '@/modules/media/services/media.service';
import VideoGrid from '@/modules/media/components/VideoGrid';

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
  const [content, speakers, settings, media, homeVideos] = await Promise.all([
    getSiteContent(),
    getSpeakers(),
    getSiteSettings(),
    getMediaSettings(),
    getPublishedVideos(undefined, { home: true }),
  ]);
  const { hero, whyWeExist, philosophy, forLeaders, forPartners, aboutUs } = content;

  const [principleLead, principleBody] = splitAtColon(forPartners.principle);
  const [beliefLead, belief] = splitAtColon(aboutUs.paragraph3);
  // Boxes: paragraph1, paragraph2, then paragraph3 split into its first sentence and the rest
  const [p3First, ...p3Rest] = whyWeExist.paragraph3.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [
    whyWeExist.paragraph3,
  ];
  const whyBoxes = [whyWeExist.paragraph1, whyWeExist.paragraph2, p3First, p3Rest.join(' ')].filter(Boolean);
  const heroWords = hero.headline.trim().split(/\s+/);

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
        {/* Type-only hero: light headline area over a dark band holding the copy and CTAs */}
        <section className="hero">
          <div className="hero__card">
            <div className="wrap hero__inner">
              <div className="hero__top">
                <p className="eyebrow">{hero.tagline}</p>
                {settings.credibilityText && <p className="eyebrow hero__launch">{settings.credibilityText}</p>}
              </div>

              <h1 className="hero__title">
                {heroWords.map((word, i) => (
                  <Fragment key={i}>
                    <span className="hw" style={{ '--i': i } as React.CSSProperties}>
                      <span>{word}</span>
                    </span>{' '}
                  </Fragment>
                ))}
              </h1>
            </div>

            <div className="hero__band section--ink">
              <div className="wrap hero__foot">
                <p className="hero__lede">{hero.subheadline}</p>
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
            </div>
          </div>
        </section>

        {/* ── 01 WHY WE EXIST ─────────────────────────────── */}
        <section id="why-we-exist" className="section">
          <div className="wrap">
            <div className="eyebrow-line">
              <Eyebrow num="01">{whyWeExist.badge}</Eyebrow>
            </div>

            {/* Headline stays put while the four statements scroll past; their words
                light up as they reach reading height, and a line tracks progress */}
            <div className="why-layout">
              <div className="why-aside">
                <RevealWords lines={sentenceLines(whyWeExist.headline)} className="why-head" />
                <div className="why-progress" aria-hidden="true">
                  <span />
                </div>
              </div>

              <ol className="why-story">
                {whyBoxes.map((text, i) => (
                  <li key={i} className="why-step">
                    <span className="why-step__num">{String(i + 1).padStart(2, '0')}</span>
                    <p className="why-step__text">
                      {text.split(/\s+/).map((word, j) => (
                        <Fragment key={j}>
                          <span className="lw">{word}</span>{' '}
                        </Fragment>
                      ))}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

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
                {/* Numbered rows; a navy fill sweeps across the row under the pointer */}
                <ol className="expect">
                  {forLeaders.takeaways.map((item, i) => {
                    const { title, text } = splitLabel(item);
                    return (
                      <li key={item} className="expect__row reveal">
                        <span className="expect__num">{String(i + 1).padStart(2, '0')}</span>
                        <h3 className="expect__title">{title}</h3>
                        {text && <p className="expect__text">{text}</p>}
                      </li>
                    );
                  })}
                </ol>

                <JoinButton source="for-leaders-tile" className="expect__cta reveal">
                  <span className="expect__cta-title">{forLeaders.ctaText}</span>
                  {forLeaders.note && <span className="expect__cta-note">{forLeaders.note}</span>}
                  <ArrowRight size={22} />
                </JoinButton>
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

        {/* ── VIDEOS (only when switched on in Videos & PDFs) ── */}
        {media.videosOnHome && homeVideos.length > 0 && (
          <section id="videos" className="section">
            <div className="wrap">
              <div className="section-head">
                <div>
                  <Eyebrow>Watch</Eyebrow>
                  <h2 className="h-xl reveal" style={{ marginTop: 28 }}>
                    {media.videosTitle}
                  </h2>
                  {media.videosIntro && (
                    <p className="lede reveal" style={{ marginTop: 20, maxWidth: '52ch' }}>
                      {media.videosIntro}
                    </p>
                  )}
                </div>
                {media.videosPage && (
                  <Link href="/videos" className="link-arrow">
                    All videos
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
              <VideoGrid videos={homeVideos.slice(0, 3)} />
            </div>
          </section>
        )}

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
