/**
 * Editorial headline: the first sentence sits in full ink, the rest fades back.
 * Single-sentence headlines fade their last two words instead.
 */
export function Accent({ text, stacked = false }: { text: string; stacked?: boolean }) {
  const sentences = text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim());

  if (sentences && sentences.length > 1) {
    const [first, ...rest] = sentences;
    return (
      <>
        {first} {stacked && <br />}
        <span className="soft">{rest.join(' ')}</span>
      </>
    );
  }

  const words = text.trim().split(/\s+/);
  if (words.length < 4) return <>{text}</>;
  return (
    <>
      {words.slice(0, -2).join(' ')} <span className="soft">{words.slice(-2).join(' ')}</span>
    </>
  );
}

export function Eyebrow({ num, children }: { num?: string; children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      {num && <span className="eyebrow__num">({num})</span>}
      {children}
    </p>
  );
}
