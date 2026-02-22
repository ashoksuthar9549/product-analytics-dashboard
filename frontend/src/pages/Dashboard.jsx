import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCookieFilters } from '../hooks/useCookieFilters';
import { useTrack } from '../hooks/useTrack';
import { getAnalytics } from '../api/client';
import FilterBar from '../components/FilterBar';
import FeatureBarChart from '../components/FeatureBarChart';
import TrendLineChart from '../components/TrendLineChart';
import StatCard from '../components/StatCard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user, logout }          = useAuth();
  const { filters, setFilters, resetFilters } = useCookieFilters();
  const track                     = useTrack();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Debounce ref for filter changes
  const fetchTimer = useRef(null);

  const fetchAnalytics = useCallback(async (f, feature) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        start_date: f.start_date,
        end_date:   f.end_date,
        age:        f.age !== 'all' ? f.age : undefined,
        gender:     f.gender !== 'all' ? f.gender : undefined,
        feature:    feature || undefined,
      };
      const { data } = await getAnalytics(params);
      setAnalytics(data);

      // If no feature selected yet, default to top bar item
      if (!feature && data.bar_chart?.[0]) {
        setSelectedFeature(data.bar_chart[0].feature_name);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when filters change (debounced 400ms)
  useEffect(() => {
    clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => {
      fetchAnalytics(filters, selectedFeature);
    }, 400);
    return () => clearTimeout(fetchTimer.current);
  }, [filters]); // eslint-disable-line

  // When selected feature changes, re-fetch line chart data
  useEffect(() => {
    if (selectedFeature) {
      fetchAnalytics(filters, selectedFeature);
    }
  }, [selectedFeature]); // eslint-disable-line

  // ── Filter change handler — also tracks the event
  const handleFilterChange = (update) => {
    const key = Object.keys(update)[0];
    const featureMap = {
      start_date: 'date_filter',
      end_date:   'date_filter',
      age:        'age_filter',
      gender:     'gender_filter',
    };
    if (featureMap[key]) track(featureMap[key]);
    setFilters(update);
  };

  // ── Bar chart click
  const handleBarClick = (featureName) => {
    track('bar_chart_click');
    setSelectedFeature(featureName);
  };

  const handleReset = () => {
    resetFilters();
    setSelectedFeature(null);
  };

  const summary = analytics?.summary;
  const barData = analytics?.bar_chart ?? [];
  const lineData = analytics?.line_chart ?? [];

  return (
    <div className={styles.root}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              <span /><span /><span />
            </div>
            <span className={styles.logoText}>VIGILITY</span>
          </div>
          <div className={styles.headerDivider} />
          <span className={styles.pageTitle}>Analytics</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.userBadge}>
            <div className={styles.userAvatar}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.username}</span>
              <span className={styles.userMeta}>{user?.gender} · {user?.age} yrs</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* ─── Body ───────────────────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Filter bar */}
        <section className={styles.filterSection}>
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            loading={loading}
          />
        </section>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠ {error}</span>
            <button onClick={() => fetchAnalytics(filters, selectedFeature)}>Retry</button>
          </div>
        )}

        {/* ─── Stat Cards ─────────────────────────────────────────────── */}
        <section className={styles.statsGrid}>
          <StatCard
            label="Total Clicks"
            value={summary?.total_clicks?.toLocaleString()}
            sub="across filtered period"
            accent
          />
          <StatCard
            label="Unique Users"
            value={summary?.unique_users?.toLocaleString()}
            sub="distinct users tracked"
          />
          <StatCard
            label="Active Feature"
            value={selectedFeature ? selectedFeature.replace(/_/g, ' ') : '—'}
            sub="selected in bar chart"
          />
          <StatCard
            label="Date Range"
            value={summary ? `${filters.start_date} → ${filters.end_date}` : '—'}
            sub="current filter window"
          />
        </section>

        {/* ─── Charts ─────────────────────────────────────────────────── */}
        <section className={styles.chartsGrid}>

          {/* Bar Chart Card */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <h2 className={styles.chartTitle}>Total Clicks</h2>
                <p className={styles.chartSub}>Click a bar to explore its daily trend →</p>
              </div>
              <div className={styles.chartBadge}>
                <span className={styles.badgeDot} style={{ background: '#f0b429' }} />
                Feature Usage
              </div>
            </div>
            <div className={styles.chartBody}>
              {loading && !analytics ? (
                <div className={styles.skeleton} />
              ) : (
                <FeatureBarChart
                  data={barData}
                  selectedFeature={selectedFeature}
                  onSelect={handleBarClick}
                />
              )}
            </div>
          </div>

          {/* Line Chart Card */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <h2 className={styles.chartTitle}>Clicks Daily</h2>
                <p className={styles.chartSub}>
                  {selectedFeature
                    ? <>Showing: <code className={styles.featureCode}>{selectedFeature}</code></>
                    : 'Select a feature in the bar chart'}
                </p>
              </div>
              <div className={styles.chartBadge}>
                <span className={styles.badgeDot} style={{ background: '#2dd4bf' }} />
                Time Trend
              </div>
            </div>
            <div className={styles.chartBody}>
              {loading && !analytics ? (
                <div className={styles.skeleton} />
              ) : (
                <TrendLineChart
                  data={lineData}
                  featureName={selectedFeature}
                />
              )}
            </div>
          </div>
        </section>

        {/* ─── Footer ─────────────────────────────────────────────────── */}
        <footer className={styles.footer}>
          <span>Vigility Analytics Dashboard</span>
          <span className={styles.footerDot}>·</span>
          <span>Every filter interaction is tracked in real-time</span>
          {summary && (
            <>
              <span className={styles.footerDot}>·</span>
              <span className={styles.footerMono}>
                {summary.date_range.start.slice(0, 10)} → {summary.date_range.end.slice(0, 10)}
              </span>
            </>
          )}
        </footer>
      </main>
    </div>
  );
}
