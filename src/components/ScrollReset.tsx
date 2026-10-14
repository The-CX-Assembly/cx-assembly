'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Starts every new page at the top. Next.js keeps the old scroll position when
 * any part of the new page is visible, so leaving the home page from far down
 * landed visitors on the footer of shorter pages. Links with a #section hash
 * are left alone so they still jump to their section.
 */
export default function ScrollReset() {
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return; // first load or refresh: keep the browser's restore
    previous.current = pathname;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
