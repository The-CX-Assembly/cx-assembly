'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Marks its wrapper with data-inview="false" after mount and flips it to "true"
 * the first time it scrolls into view. CSS keys entrance animations off that
 * attribute, so content stays fully visible if JavaScript never runs.
 */
export default function InView({
  children,
  className,
  as: Tag = 'div',
  threshold = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'h2' | 'p' | 'ul';
  threshold?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'false' | 'true' | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setState('false');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('true');
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const Element = Tag as React.ElementType;
  return (
    <Element ref={ref} className={className} data-inview={state}>
      {children}
    </Element>
  );
}
