/**
 * Playground App
 *
 * Interactive showcase for react-lite-toast.
 * This will be progressively enhanced as each phase is completed.
 *
 * Phase 1: Architecture overview / coming-soon screen.
 * Phase 8+: Full interactive demo with all toast types and options.
 */
import type { ReactElement } from 'react';
import styles from './App.module.css';

// Import constants available from Phase 1
import { CORE_VERSION, DEFAULT_TOAST_DEFAULTS } from '@react-lite-toast/core';

const FEATURES = [
  { icon: '⚡', label: 'Provider-less', description: 'No <ToastProvider> ever needed' },
  { icon: '🎯', label: 'Zero Config', description: 'import { toast } and go' },
  { icon: '🔒', label: 'TypeScript First', description: 'Strict mode, zero any' },
  { icon: '♿', label: 'Accessible', description: 'WCAG AA compliant, ARIA live' },
  { icon: '🪶', label: 'Tiny Bundle', description: '<8 KB gzip target' },
  { icon: '🧩', label: 'Headless', description: 'Bring your own UI' },
  { icon: '🌊', label: 'React 18 + 19', description: 'useSyncExternalStore' },
  { icon: '🌐', label: 'SSR Safe', description: 'No hydration warnings' },
] as const;

const PACKAGES = [
  { name: '@react-lite-toast/core', role: 'Framework-agnostic engine' },
  { name: '@react-lite-toast/react', role: 'React renderer + components' },
  { name: '@react-lite-toast/themes', role: 'Built-in theme collection' },
  { name: '@react-lite-toast/icons', role: 'SVG icon pack' },
  { name: '@react-lite-toast/devtools', role: 'Debugging tools' },
  { name: '@react-lite-toast/testing', role: 'Test utilities' },
  { name: 'react-lite-toast', role: 'Umbrella convenience package' },
] as const;

export default function App(): ReactElement {
  return (
    <div className={styles.app}>
      {/* ─── Ambient Background ─────────────────────────────── */}
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.ambientOrb1} />
        <div className={styles.ambientOrb2} />
        <div className={styles.ambientOrb3} />
      </div>

      <main className={styles.main}>
        {/* ─── Hero ────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Phase 1 — Scaffolding Complete
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleAccent}>react-lite-toast</span>
          </h1>

          <p className={styles.subtitle}>
            One import.&nbsp; Zero config.&nbsp; Infinite control.
          </p>

          <p className={styles.description}>
            A production-ready, provider-less React notification library designed to outlast
            react-toastify, Sonner, and Notistack in architecture, DX, and performance.
          </p>

          {/* Code snippet */}
          <div className={styles.codeBlock} role="region" aria-label="Usage example">
            <div className={styles.codeHeader}>
              <span className={styles.codeDot} style={{ '--dot-color': '#ff5f57' } as React.CSSProperties} />
              <span className={styles.codeDot} style={{ '--dot-color': '#febc2e' } as React.CSSProperties} />
              <span className={styles.codeDot} style={{ '--dot-color': '#28c840' } as React.CSSProperties} />
              <span className={styles.codeFilename}>App.tsx</span>
            </div>
            <pre className={styles.code}>
              <code>{`import { toast } from 'react-lite-toast';

// That's it. No <ToastProvider>. No setup. Nothing.
toast.success('Saved successfully!');
toast.error('Something went wrong.');
toast.promise(saveData(), {
  messages: {
    loading: 'Saving...',
    success: 'All changes saved!',
    error: (err) => 'Failed: ' + err.message,
  },
});`}</code>
            </pre>
          </div>

          {/* Version badge */}
          <div className={styles.versionInfo}>
            <code className={styles.versionBadge}>core v{CORE_VERSION}</code>
            <code className={styles.versionBadge}>default duration: {DEFAULT_TOAST_DEFAULTS.duration}ms</code>
          </div>
        </section>

        {/* ─── Features Grid ───────────────────────────────────── */}
        <section className={styles.section} aria-labelledby="features-heading">
          <h2 id="features-heading" className={styles.sectionTitle}>
            Built different
          </h2>
          <div className={styles.featuresGrid}>
            {FEATURES.map((feature) => (
              <div key={feature.label} className={styles.featureCard}>
                <span className={styles.featureIcon} aria-hidden="true">
                  {feature.icon}
                </span>
                <h3 className={styles.featureLabel}>{feature.label}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Monorepo Packages ───────────────────────────────── */}
        <section className={styles.section} aria-labelledby="packages-heading">
          <h2 id="packages-heading" className={styles.sectionTitle}>
            Monorepo structure
          </h2>
          <div className={styles.packagesList}>
            {PACKAGES.map((pkg) => (
              <div key={pkg.name} className={styles.packageRow}>
                <code className={styles.packageName}>{pkg.name}</code>
                <span className={styles.packageRole}>{pkg.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Phases ──────────────────────────────────────────── */}
        <section className={styles.section} aria-labelledby="phases-heading">
          <h2 id="phases-heading" className={styles.sectionTitle}>
            Implementation progress
          </h2>
          <div className={styles.phaseGrid}>
            {([
              [1, 'Project Init', true],
              [2, 'Type System', true],
              [3, 'Observable Store', false],
              [4, 'Bootstrap Engine', false],
              [5, 'Toast Engine & Dispatcher', false],
              [6, 'Queue System', false],
              [7, 'React Renderer & Portal', false],
              [8, 'Toast Components', false],
              [9, 'CSS & Animations', false],
              [10, 'Accessibility', false],
              [11, 'Promise Engine', false],
              [12, 'Multiple Containers', false],
              [13, 'SSR', false],
              [14, 'Hooks', false],
              [15, 'Themes & Icons', false],
              [16, 'DevTools', false],
              [17, 'Testing', false],
              [18, 'Storybook', false],
              [19, 'Documentation', false],
              [20, 'CI/CD', false],
            ] as [number, string, boolean][]).map(([num, label, done]) => (
              <div key={num} className={`${styles.phaseItem} ${done ? styles.phaseDone : ''}`}>
                <span className={styles.phaseNum}>{num}</span>
                <span className={styles.phaseLabel}>{label}</span>
                {done && <span className={styles.phaseCheck} aria-label="Complete">✓</span>}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Footer ──────────────────────────────────────────── */}
        <footer className={styles.footer}>
          <p>
            Built with precision by the react-lite-toast team •{' '}
            <a
              href="https://github.com/jithinsebastian2/react-lite-toast"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
