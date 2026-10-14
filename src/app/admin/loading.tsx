import styles from '@/components/admin/AdminLoading.module.css';

// Shown instantly (and prefetched) while an admin page renders on the server.
export default function AdminLoading() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading">
      <div className={styles.head}>
        <span className={`${styles.bone} ${styles.eyebrow}`} />
        <span className={`${styles.bone} ${styles.title}`} />
        <span className={`${styles.bone} ${styles.sub}`} />
      </div>
      <div className={styles.grid}>
        <span className={`${styles.bone} ${styles.card} ${styles.wide}`} />
        <span className={`${styles.bone} ${styles.card} ${styles.tall}`} />
        <span className={`${styles.bone} ${styles.card} ${styles.tall}`} />
        <span className={`${styles.bone} ${styles.card}`} />
        <span className={`${styles.bone} ${styles.card}`} />
      </div>
    </div>
  );
}
