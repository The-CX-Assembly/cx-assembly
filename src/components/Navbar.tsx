'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from '@/components/Icons';
import { JoinButton } from '@/components/JoinModal';
import { NAV_LINKS } from '@/lib/nav';

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
    <header className="site-header" data-scrolled={scrolled || open}>
      <div className="wrap site-header__bar">
        <Link href="/" className="brand" aria-label="The CX Assembly — home" onClick={() => setOpen(false)}>
          <Image src="/brand/mark-navy.png" alt="" width={750} height={425} className="brand__mark" priority />
          <span className="brand__word">
            The CX
            <br />
            Assembly
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav__link">
              {link.label}
            </Link>
          ))}
        </nav>

        <JoinButton className="cta cta--solid header-cta">
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

      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile">
          {NAV_LINKS.map((link, i) => (
            <Link key={link.href} href={link.href} className="mobile-menu__link" onClick={() => setOpen(false)}>
              {link.label}
              <span>0{i + 1}</span>
            </Link>
          ))}
          <div style={{ marginTop: 32 }}>
            <JoinButton onClick={() => setOpen(false)}>
              Join The Assembly
              <ArrowRight size={16} />
            </JoinButton>
          </div>
        </nav>
      )}
    </header>
  );
}
