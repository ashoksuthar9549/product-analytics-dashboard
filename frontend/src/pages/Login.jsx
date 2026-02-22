import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode]     = useState('login'); // 'login' | 'register'
  const [form, setForm]     = useState({ username: '', password: '', age: '', gender: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
      } else {
        if (!form.age || !form.gender) {
          setError('Age and gender are required for registration.');
          setLoading(false);
          return;
        }
        await register({ ...form, age: parseInt(form.age) });
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setForm({ username: '', password: '', age: '', gender: '' });
  };

  return (
    <div className={styles.root}>
      {/* Left panel — branding */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              <span />
              <span />
              <span />
            </div>
            <span className={styles.logoText}>VIGILITY</span>
          </div>
          <h1 className={styles.headline}>Analytics<br />at the<br />speed of<br />thought.</h1>
          <p className={styles.sub}>
            Every interaction tracked. Every insight surfaced.<br />
            Real-time dashboards, zero friction.
          </p>
          <div className={styles.statsRow}>
            {[
              { label: 'Events / min', value: '12.4K' },
              { label: 'Avg latency',  value: '18ms'  },
              { label: 'Uptime',       value: '99.9%' },
            ].map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.modeTabs}>
              <button
                className={`${styles.modeTab} ${mode === 'login' ? styles.active : ''}`}
                onClick={() => mode !== 'login' && toggle()}
                type="button"
              >
                Sign In
              </button>
              <button
                className={`${styles.modeTab} ${mode === 'register' ? styles.active : ''}`}
                onClick={() => mode !== 'register' && toggle()}
                type="button"
              >
                Register
              </button>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                type="text"
                name="username"
                placeholder="e.g. alice_pm"
                value={form.username}
                onChange={handleChange}
                autoFocus
                autoComplete="username"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {mode === 'register' && (
              <>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Age</label>
                    <input
                      className={styles.input}
                      type="number"
                      name="age"
                      placeholder="28"
                      min="1"
                      max="120"
                      value={form.age}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Gender</label>
                    <select
                      className={styles.input}
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className={styles.error}>
                <span className={styles.errorIcon}>⚠</span>
                {error}
              </div>
            )}

            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className={styles.hint}>
              Demo credentials: <code>alice_pm</code> / <code>Password123!</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
