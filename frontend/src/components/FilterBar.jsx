import styles from './FilterBar.module.css';

const AGE_OPTIONS = [
  { value: 'all',  label: 'All Ages'  },
  { value: '<18',  label: 'Under 18'  },
  { value: '18-40',label: '18 – 40'   },
  { value: '>40',  label: 'Over 40'   },
];

const GENDER_OPTIONS = [
  { value: 'all',    label: 'All Genders' },
  { value: 'Male',   label: 'Male'        },
  { value: 'Female', label: 'Female'      },
  { value: 'Other',  label: 'Other'       },
];

export default function FilterBar({ filters, onChange, onReset, loading }) {
  const handle = (key) => (e) => onChange({ [key]: e.target.value });

  return (
    <div className={styles.bar}>
      {/* Date Range */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Date Range
        </span>
        <div className={styles.dateRow}>
          <input
            className={styles.dateInput}
            type="date"
            value={filters.start_date}
            max={filters.end_date}
            onChange={handle('start_date')}
          />
          <span className={styles.dateSep}>→</span>
          <input
            className={styles.dateInput}
            type="date"
            value={filters.end_date}
            min={filters.start_date}
            onChange={handle('end_date')}
          />
        </div>
      </div>

      <div className={styles.divider} />

      {/* Age Filter */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          Age
        </span>
        <div className={styles.pillGroup}>
          {AGE_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`${styles.pill} ${filters.age === o.value ? styles.pillActive : ''}`}
              onClick={() => onChange({ age: o.value })}
              type="button"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Gender Filter */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
          Gender
        </span>
        <div className={styles.pillGroup}>
          {GENDER_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`${styles.pill} ${filters.gender === o.value ? styles.pillActive : ''}`}
              onClick={() => onChange({ gender: o.value })}
              type="button"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.spacer} />

      {/* Status + Reset */}
      <div className={styles.actions}>
        {loading && (
          <div className={styles.loadingDot}>
            <span />
            <span className={styles.loadingRing} />
          </div>
        )}
        <button className={styles.resetBtn} onClick={onReset} type="button">
          Reset
        </button>
      </div>
    </div>
  );
}
