import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JoinForm from '@/components/JoinForm';
import LeaderCard from '@/components/LeaderCard';
import { getSiteContent, getLeaders, getVoices } from '@/lib/content';

export const revalidate = 60; // Revalidate every 60s or on demand via admin

export default async function HomePage() {
  const content = await getSiteContent();
  const leaders = await getLeaders();
  const voices = await getVoices();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* HERO SECTION */}
        <section
          className="bg-navy-gradient"
          style={{
            position: 'relative',
            paddingTop: '100px',
            paddingBottom: '120px',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow effect */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(44, 122, 171, 0.25) 0%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ marginBottom: '24px' }}>
                <span className="badge-pill badge-light">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)', display: 'inline-block' }} />
                  Launched on World CX Day 2026 • 50 Founding CX Leaders
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: '24px',
                }}
              >
                {content.hero.headline}
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1.125rem, 2vw, 1.35rem)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                  maxWidth: '780px',
                  margin: '0 auto 20px',
                }}
              >
                {content.hero.subheadline}
              </p>

              <p
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--color-gold)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '40px',
                }}
              >
                {content.hero.tagline}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  justifyContent: 'center',
                }}
              >
                <Link href="#join" className="btn btn-white" style={{ padding: '16px 32px', fontSize: '1rem' }}>
                  {content.hero.ctaPrimaryText}
                </Link>
                <Link href="/founding-50" className="btn btn-outline-white" style={{ padding: '16px 32px', fontSize: '1rem' }}>
                  {content.hero.ctaSecondaryText}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CREDIBILITY STRIP */}
        <section
          style={{
            background: 'var(--color-bg-alt)',
            borderTop: '1px solid #E2E8F0',
            borderBottom: '1px solid #E2E8F0',
            padding: '36px 0',
          }}
        >
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px',
                textAlign: 'center',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  Oct 6, 2026
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  World CX Day Launch
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                  50
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Founding CX Leaders
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  100%
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Brand-Side Peer Forum
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                  Zero Pitches
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Pure Collective Thinking
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: WHY WE EXIST */}
        <section id="why-we-exist" className="section-pad bg-warm-section">
          <div className="container">
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <span className="badge-pill badge-navy" style={{ marginBottom: '16px' }}>
                {content.whyWeExist.badge}
              </span>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  lineHeight: 1.25,
                  marginBottom: '32px',
                }}
              >
                {content.whyWeExist.headline}
              </h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  textAlign: 'left',
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-body)',
                }}
              >
                <p>{content.whyWeExist.paragraph1}</p>
                <p>{content.whyWeExist.paragraph2}</p>
                <p>{content.whyWeExist.paragraph3}</p>
              </div>

              <div
                style={{
                  marginTop: '40px',
                  padding: '24px 32px',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--color-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'left',
                }}
              >
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {content.whyWeExist.conclusion}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: PHILOSOPHY */}
        <section className="section-pad" style={{ background: '#FFFFFF' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px' }}>
              <span className="badge-pill badge-navy" style={{ marginBottom: '16px' }}>
                {content.philosophy.badge}
              </span>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  lineHeight: 1.2,
                }}
              >
                {content.philosophy.headline}
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              {content.philosophy.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-bg-warm)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px 28px',
                    border: '1px solid rgba(12, 35, 57, 0.08)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  className="philosophy-card"
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'var(--color-primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.125rem',
                      marginBottom: '20px',
                    }}
                  >
                    0{idx + 1}
                  </div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      marginBottom: '12px',
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-body)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: FOR CX LEADERS */}
        <section id="for-cx-leaders" className="section-pad bg-navy-dark">
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '56px',
                alignItems: 'center',
              }}
            >
              <div>
                <span className="badge-pill badge-light" style={{ marginBottom: '20px' }}>
                  {content.forLeaders.badge}
                </span>
                <h2
                  style={{
                    fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    lineHeight: 1.2,
                    marginBottom: '20px',
                  }}
                >
                  {content.forLeaders.headline}
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  {content.forLeaders.subheadline}
                </p>
                <div
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderLeft: '4px solid var(--color-gold)',
                    marginBottom: '32px',
                  }}
                >
                  <p style={{ color: '#FFFFFF', fontSize: '0.9375rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                    {content.forLeaders.callout}
                  </p>
                </div>
                <Link href="#join" className="btn btn-accent" style={{ padding: '14px 28px' }}>
                  {content.forLeaders.ctaText}
                </Link>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-inverse-muted)', marginTop: '12px' }}>
                  {content.forLeaders.note}
                </p>
              </div>

              {/* What you can expect checklist */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '36px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>
                  What You Can Expect
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '18px', padding: 0 }}>
                  {content.forLeaders.takeaways.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(44, 122, 171, 0.3)',
                          color: '#4A9BD0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDING 50 PREVIEW SECTION */}
        <section className="section-pad bg-warm-section">
          <div className="container">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', gap: '20px' }}>
              <div>
                <span className="badge-pill badge-gold" style={{ marginBottom: '12px' }}>
                  The Founding Cohort
                </span>
                <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-primary)' }}>
                  Meet Our Founding CX Leaders
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.0625rem', marginTop: '6px' }}>
                  A circle of leaders helping shape the conversations for India’s CX community.
                </p>
              </div>
              <Link href="/founding-50" className="btn btn-outline-navy">
                View All Founding Leaders
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              {leaders.slice(0, 4).map((leader) => (
                <LeaderCard key={leader.id} leader={leader} />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: FOR PARTNERS */}
        <section id="for-partners" className="section-pad" style={{ background: '#FFFFFF' }}>
          <div className="container">
            <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
              <span className="badge-pill badge-navy" style={{ marginBottom: '16px' }}>
                {content.forPartners.badge}
              </span>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  marginBottom: '28px',
                }}
              >
                {content.forPartners.headline}
              </h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  textAlign: 'left',
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-body)',
                }}
              >
                <p>{content.forPartners.paragraph1}</p>
                <p>{content.forPartners.paragraph2}</p>
                <p>{content.forPartners.paragraph3}</p>
              </div>

              <div
                style={{
                  marginTop: '36px',
                  padding: '24px',
                  background: 'rgba(12, 35, 57, 0.04)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(12, 35, 57, 0.1)',
                  display: 'inline-block',
                }}
              >
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {content.forPartners.principle}
                </p>
              </div>

              <div style={{ marginTop: '36px' }}>
                <Link href="#join" className="btn btn-primary" style={{ padding: '14px 28px' }}>
                  Explore Partnership Opportunities
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: COMMUNITY VOICES */}
        <section className="section-pad" style={{ background: 'var(--color-bg-alt)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <span className="badge-pill badge-navy" style={{ marginBottom: '14px' }}>
                Community Voices
              </span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Conversations That Matter
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {voices.map((voice) => (
                <div
                  key={voice.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '36px 30px',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <p style={{ fontSize: '1rem', color: 'var(--color-text-body)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '24px' }}>
                    “{voice.quote}”
                  </p>
                  <div>
                    <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {voice.name}
                    </h4>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                      {voice.designation}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {voice.company}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: ABOUT US */}
        <section className="section-pad" style={{ background: '#FFFFFF' }}>
          <div className="container">
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <span className="badge-pill badge-navy" style={{ marginBottom: '14px' }}>
                  {content.aboutUs.badge}
                </span>
                <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {content.aboutUs.headline}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-text-body)' }}>
                <p>{content.aboutUs.paragraph1}</p>
                <p>{content.aboutUs.paragraph2}</p>
                <p>{content.aboutUs.paragraph3}</p>
              </div>

              <div
                style={{
                  marginTop: '36px',
                  padding: '24px 28px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-warm)',
                  border: '1px solid rgba(12, 35, 57, 0.08)',
                }}
              >
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-primary)', fontWeight: 600, lineHeight: 1.6 }}>
                  {content.aboutUs.founderNote}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: JOIN / LEAD CAPTURE FORM */}
        <section id="join" className="section-pad bg-warm-section" style={{ borderTop: '1px solid #E2E8F0' }}>
          <div className="container">
            <JoinForm defaultType="cx_leader" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
