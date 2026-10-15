'use client';

import styles from './dashboard.module.css';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

/** Pill tab group with a sliding highlight. */
export default function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  return (
    <div
      className={styles.segmented}
      role="tablist"
      aria-label={label}
      style={{ '--n': options.length, '--idx': index } as React.CSSProperties}
    >
      <span className={styles.segmentedThumb} aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={`${styles.segment} ${option.value === value ? styles.segmentActive : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
