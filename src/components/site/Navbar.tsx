'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from './Icons';
import { JoinButton } from '@/features/leads/components/JoinModal';
import { NAV_LINKS } from './nav';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="site-header" data-scrolled={scrolled || open}>
        <div className="wrap site-header__bar">
          <Link href="/" className="brand" aria-label="The CX Assembly — home" onClick={() => setOpen(false)}>
            <Image src="/brand/cx-logo-navy.png" alt="" width={966} height={840} className="brand__logo" priority />
          </Link>

          <nav className="nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav__link">
                {link.label}
              </Link>
            ))}
          </nav>

          <JoinButton source="navbar" className="cta cta--solid header-cta">
            Join The Assembly
            <ArrowRight size={16} />
          </JoinButton>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Close' : 'Menu'}
            <span className="menu-toggle__lines" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Outside the header: its backdrop-filter would otherwise trap this fixed panel inside the 84px bar */}
      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile">
          {NAV_LINKS.map((link, i) => (
            <Link key={link.href} href={link.href} className="mobile-menu__link" onClick={() => setOpen(false)}>
              {link.label}
              <span>0{i + 1}</span>
            </Link>
          ))}
          <div style={{ marginTop: 32 }}>
            <JoinButton source="mobile-menu" onClick={() => setOpen(false)}>
              Join The Assembly
              <ArrowRight size={16} />
            </JoinButton>
          </div>
        </nav>
      )}
    </>
  );
}
