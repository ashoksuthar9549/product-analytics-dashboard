import styles from './StatCard.module.css';

export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`${styles.card} ${accent ? styles.accent : ''}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value ?? '—'}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}
