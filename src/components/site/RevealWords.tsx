import { Fragment } from 'react';
import InView from './InView';

/** Splits text into sentences, each on its own line. */
export function sentenceLines(text: string) {
  return text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text];
}

/**
 * Heading whose words rise out of a mask one after another when it scrolls into view.
 * Each entry in `lines` starts on a new line; the stagger runs across all lines.
 */
export default function RevealWords({
  lines,
  className,
  as = 'h2',
}: {
  lines: string[];
  className?: string;
  as?: 'h2' | 'p';
}) {
  let index = 0;
  const words = lines.filter(Boolean).map((line) => line.split(' ').map((word) => ({ word, i: index++ })));

  return (
    <InView as={as} className={`words ${className ?? ''}`} threshold={0.3}>
      {words.map((line, li) => (
        <span key={li} className="words__line">
          {line.map(({ word, i }) => (
            <Fragment key={i}>
              <span className="w" style={{ '--i': i } as React.CSSProperties}>
                <span>{word}</span>
              </span>{' '}
            </Fragment>
          ))}
        </span>
      ))}
    </InView>
  );
}
