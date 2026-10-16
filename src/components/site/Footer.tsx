import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, LinkedIn } from './Icons';
import { JoinButton } from '@/modules/leads/components/JoinModal';
import { NAV_LINKS } from './nav';
import { defaultSettings } from '@/modules/content/models/content.defaults';

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="wrap">
        <div className="footer__brand">
          <Image src="/brand/cx-mark-light.png" alt="" width={800} height={420} className="footer__mark" />
          <p className="footer__word">The CX Assembly</p>
        </div>

        <div className="footer__cols">
          <div className="footer__lead">
            <p className="h-md" style={{ color: 'var(--on-ink)' }}>
              Built by CX Leaders. <span className="soft">For CX Leaders.</span>
            </p>
            <p style={{ marginTop: 12 }}>An initiative of The Executive Assembly.</p>
            <div style={{ marginTop: 32 }}>
              <JoinButton source="footer" className="cta cta--light">
                Join The Assembly
                <ArrowRight size={16} />
              </JoinButton>
            </div>
          </div>

          <div className="footer__nav">
            <p className="footer__heading">Explore</p>
            <ul className="footer__links">
              {NAV_LINKS.filter((l) => l.href !== '#contact').map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__connect">
            <p className="footer__heading">Contact Us</p>
            <ul className="footer__links">
              <li>
                <a href={`mailto:${defaultSettings.contactEmail}`}>{defaultSettings.contactEmail}</a>
              </li>
              <li>
                <a
                  href={defaultSettings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                >
                  <LinkedIn size={16} />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 The CX Assembly. All rights reserved.</span>
          <nav aria-label="Legal">
            <a href={`mailto:${defaultSettings.contactEmail}`}>Contact</a>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
