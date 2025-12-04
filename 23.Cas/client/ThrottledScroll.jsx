/**
 * ============================================
 * THROTTLING PRIMER - Scroll & Resize
 * ============================================
 *
 * Ovaj primer demonstrira korišćenje throttling-a
 * za optimizaciju scroll i resize događaja.
 *
 * BEZ throttling-a: 60+ poziva u sekundi pri scrollovanju
 * SA throttling-om: ograničeno na npr. 5 poziva u sekundi
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ============================================
// THROTTLE HELPER FUNKCIJA
// ============================================

/**
 * Throttle funkcija - ograničava koliko često se funkcija može izvršiti
 *
 * @param {Function} func - Funkcija koju želimo da "throttle-ujemo"
 * @param {number} limit - Minimalno vreme između izvršavanja (u ms)
 * @returns {Function} - Nova funkcija sa throttle ponašanjem
 */
function throttle(func, limit) {
  let inThrottle = false;
  let lastArgs = null;

  return function (...args) {
    // Sačuvaj poslednje argumente (za trailing izvršavanje)
    lastArgs = args;

    if (!inThrottle) {
      // Ako nismo u "cooldown" periodu, izvrši odmah
      func.apply(this, args);
      inThrottle = true;

      // Postavi cooldown timer
      setTimeout(() => {
        inThrottle = false;
        // Opcionalno: izvrši sa poslednjim argumentima na kraju cooldown-a
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    }
    // Ako smo u throttle periodu, poziv se ignoriše
    // (ali čuvamo argumente za trailing)
  };
}

/**
 * Jednostavnija verzija throttle funkcije (bez trailing)
 */
function throttleSimple(func, limit) {
  let inThrottle = false;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// GLAVNA KOMPONENTA
// ============================================

export default function ThrottledScroll() {
  // Scroll position state
  const [scrollY, setScrollY] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Window size state
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Statistika za demonstraciju
  const [scrollEventCount, setScrollEventCount] = useState(0);
  const [throttledScrollCount, setThrottledScrollCount] = useState(0);
  const [resizeEventCount, setResizeEventCount] = useState(0);
  const [throttledResizeCount, setThrottledResizeCount] = useState(0);

  // Progress bar visibility (pokazuje se kad scrolluješ)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // ============================================
  // THROTTLED SCROLL HANDLER
  // ============================================

  useEffect(() => {
    // Originalni handler - poziva se na SVAKI scroll event
    const handleScrollRaw = () => {
      setScrollEventCount((prev) => prev + 1);
    };

    // Throttled handler - poziva se maksimalno svakih 100ms
    const handleScrollThrottled = throttleSimple(() => {
      const currentScrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = maxScroll > 0 ? (currentScrollY / maxScroll) * 100 : 0;

      setScrollY(currentScrollY);
      setScrollPercent(Math.round(percent));
      setThrottledScrollCount((prev) => prev + 1);

      // Pokaži scroll indikator
      setShowScrollIndicator(true);
    }, 100); // 100ms = maksimalno 10 poziva u sekundi

    // Dodaj oba listenera
    window.addEventListener("scroll", handleScrollRaw);
    window.addEventListener("scroll", handleScrollThrottled);

    return () => {
      window.removeEventListener("scroll", handleScrollRaw);
      window.removeEventListener("scroll", handleScrollThrottled);
    };
  }, []);

  // ============================================
  // THROTTLED RESIZE HANDLER
  // ============================================

  useEffect(() => {
    // Originalni handler - poziva se na SVAKI resize event
    const handleResizeRaw = () => {
      setResizeEventCount((prev) => prev + 1);
    };

    // Throttled handler - poziva se maksimalno svakih 200ms
    const handleResizeThrottled = throttleSimple(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setThrottledResizeCount((prev) => prev + 1);
    }, 200); // 200ms = maksimalno 5 poziva u sekundi

    window.addEventListener("resize", handleResizeRaw);
    window.addEventListener("resize", handleResizeThrottled);

    return () => {
      window.removeEventListener("resize", handleResizeRaw);
      window.removeEventListener("resize", handleResizeThrottled);
    };
  }, []);

  // ============================================
  // SAKRIVANJE SCROLL INDIKATORA
  // ============================================

  useEffect(() => {
    if (showScrollIndicator) {
      const timer = setTimeout(() => {
        setShowScrollIndicator(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showScrollIndicator, scrollY]);

  // ============================================
  // RESET FUNKCIJA
  // ============================================

  const handleReset = () => {
    setScrollEventCount(0);
    setThrottledScrollCount(0);
    setResizeEventCount(0);
    setThrottledResizeCount(0);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={styles.container}>
      {/* Fixed Header sa statistikom */}
      <header style={styles.header}>
        <h1 style={styles.title}>Throttling Primer - Scroll & Resize</h1>

        {/* Progress bar */}
        <div style={styles.progressBarContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${scrollPercent}%`,
            }}
          />
        </div>

        {/* Statistika Grid */}
        <div style={styles.statsGrid}>
          {/* Scroll statistika */}
          <div style={styles.statsSection}>
            <h3 style={styles.statsSectionTitle}>Scroll Eventi</h3>
            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Bez throttle:</span>
                <span style={styles.statValueRed}>{scrollEventCount}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Sa throttle:</span>
                <span style={styles.statValueGreen}>
                  {throttledScrollCount}
                </span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Ušteda:</span>
                <span style={styles.statValueBlue}>
                  {scrollEventCount > 0
                    ? `${Math.round(((scrollEventCount - throttledScrollCount) / scrollEventCount) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>

          {/* Resize statistika */}
          <div style={styles.statsSection}>
            <h3 style={styles.statsSectionTitle}>Resize Eventi</h3>
            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Bez throttle:</span>
                <span style={styles.statValueRed}>{resizeEventCount}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Sa throttle:</span>
                <span style={styles.statValueGreen}>
                  {throttledResizeCount}
                </span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Ušteda:</span>
                <span style={styles.statValueBlue}>
                  {resizeEventCount > 0
                    ? `${Math.round(((resizeEventCount - throttledResizeCount) / resizeEventCount) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trenutne vrednosti */}
        <div style={styles.currentValues}>
          <span style={styles.currentValue}>
            Scroll: {scrollY}px ({scrollPercent}%)
          </span>
          <span style={styles.currentValue}>
            Window: {windowSize.width} x {windowSize.height}
          </span>
          <button onClick={handleReset} style={styles.resetButton}>
            Reset Statistike
          </button>
        </div>

        {/* Instrukcije */}
        <p style={styles.instructions}>
          Scrolluj gore-dole ili promeni veličinu prozora da vidiš razliku!
        </p>
      </header>

      {/* Scrollable Content */}
      <main style={styles.main}>
        {/* Sekcija 1 - Objašnjenje */}
        <section style={styles.section}>
          <h2>Šta je Throttling?</h2>
          <p>
            <strong>Throttling</strong> je tehnika koja ograničava koliko često
            se funkcija može izvršiti. Umesto da se funkcija poziva na svaki
            event (što može biti 60+ puta u sekundi pri scrollovanju), throttle
            osigurava da se izvrši maksimalno jednom u svakih N milisekundi.
          </p>
          <div style={styles.codeBlock}>
            <pre>
              {`// Throttle funkcija
function throttle(func, limit) {
  let inThrottle = false;

  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);  // Izvrši
      inThrottle = true;        // Blokiraj

      setTimeout(() => {
        inThrottle = false;     // Deblokiraj
      }, limit);
    }
  };
}`}
            </pre>
          </div>
        </section>

        {/* Sekcija 2 - Vizuelno objašnjenje */}
        <section style={styles.section}>
          <h2>Vizuelno objašnjenje</h2>
          <div style={styles.visualBox}>
            <p>
              <strong>Bez throttling-a:</strong>
            </p>
            <code style={styles.visual}>
              Eventi: ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
              <br />
              Pozivi: ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
            </code>
            <p style={{ marginTop: "20px" }}>
              <strong>Sa throttling-om (100ms):</strong>
            </p>
            <code style={styles.visual}>
              Eventi: ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
              <br />
              Pozivi: ↓ {"        "} ↓ {"        "} ↓ {"        "} ↓
            </code>
          </div>
        </section>

        {/* Sekcija 3 - Kada koristiti */}
        <section style={styles.section}>
          <h2>Kada koristiti Throttling?</h2>
          <ul style={styles.list}>
            <li>
              <strong>Scroll eventi</strong> - Infinite scroll, parallax efekti,
              sticky header
            </li>
            <li>
              <strong>Resize eventi</strong> - Responsive layout kalkulacije
            </li>
            <li>
              <strong>Mouse move</strong> - Drag and drop, tooltip pozicioniranje
            </li>
            <li>
              <strong>Window events</strong> - Orientation change na mobilnim
              uređajima
            </li>
            <li>
              <strong>Igre</strong> - Ograničavanje input-a (pucanje, skakanje)
            </li>
          </ul>
        </section>

        {/* Sekcija 4 - Razlika od Debouncing-a */}
        <section style={styles.section}>
          <h2>Throttling vs Debouncing</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Aspekt</th>
                <th style={styles.th}>Throttling</th>
                <th style={styles.th}>Debouncing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Kada se izvršava?</td>
                <td style={styles.td}>Periodično (svakih N ms)</td>
                <td style={styles.td}>Posle pauze</td>
              </tr>
              <tr>
                <td style={styles.td}>Broj izvršavanja</td>
                <td style={styles.td}>Više puta</td>
                <td style={styles.td}>Jednom (na kraju)</td>
              </tr>
              <tr>
                <td style={styles.td}>User experience</td>
                <td style={styles.td}>Bez delay-a</td>
                <td style={styles.td}>Oseća se delay</td>
              </tr>
              <tr>
                <td style={styles.td}>Idealno za</td>
                <td style={styles.td}>Scroll, Resize</td>
                <td style={styles.td}>Search, Auto-save</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Sekcija 5 - Praktična primena */}
        <section style={styles.section}>
          <h2>Praktična primena u React-u</h2>
          <div style={styles.codeBlock}>
            <pre>
              {`// Infinite Scroll sa Throttling-om
useEffect(() => {
  const handleScroll = throttle(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // Ako smo blizu dna, učitaj još
    if (scrollTop + windowHeight >= docHeight - 200) {
      loadMoreItems();
    }
  }, 200);  // Proveri svakih 200ms

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);`}
            </pre>
          </div>
        </section>

        {/* Sekcije za scroll demonstraciju */}
        {Array.from({ length: 10 }, (_, i) => (
          <section key={i} style={styles.demoSection}>
            <h2>Sekcija {i + 1}</h2>
            <p>
              Scrolluj da vidiš kako throttling radi u praksi. Prati statistiku
              u header-u.
            </p>
            <div
              style={{
                ...styles.colorBox,
                backgroundColor: `hsl(${i * 36}, 70%, 80%)`,
              }}
            >
              <span style={styles.colorBoxText}>
                {i % 2 === 0
                  ? "Throttle štedi resurse!"
                  : "Bolje performanse!"}
              </span>
            </div>
          </section>
        ))}

        {/* Footer */}
        <footer style={styles.footer}>
          <p>Stigao si do kraja! Proveri statistiku u header-u.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={styles.scrollTopButton}
          >
            Vrati se na vrh
          </button>
        </footer>
      </main>

      {/* Floating Scroll Indicator */}
      {showScrollIndicator && (
        <div style={styles.floatingIndicator}>
          <span style={styles.floatingText}>
            {scrollPercent}% scrollovano
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// STILOVI
// ============================================

const styles = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: "300vh",
  },
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "15px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    zIndex: 1000,
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "20px",
    textAlign: "center",
    color: "#333",
  },
  progressBarContainer: {
    height: "4px",
    backgroundColor: "#e5e7eb",
    borderRadius: "2px",
    marginBottom: "15px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3b82f6",
    transition: "width 0.1s",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "10px",
  },
  statsSection: {
    backgroundColor: "#f9fafb",
    padding: "10px",
    borderRadius: "8px",
  },
  statsSectionTitle: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
  },
  statsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  statBox: {
    textAlign: "center",
    padding: "5px 10px",
  },
  statLabel: {
    display: "block",
    fontSize: "10px",
    color: "#666",
  },
  statValueRed: {
    display: "block",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#ef4444",
  },
  statValueGreen: {
    display: "block",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#22c55e",
  },
  statValueBlue: {
    display: "block",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#3b82f6",
  },
  currentValues: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginBottom: "5px",
    flexWrap: "wrap",
  },
  currentValue: {
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#f3f4f6",
    padding: "4px 10px",
    borderRadius: "4px",
  },
  resetButton: {
    padding: "6px 12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  instructions: {
    margin: 0,
    textAlign: "center",
    fontSize: "12px",
    color: "#3b82f6",
  },
  main: {
    paddingTop: "280px",
    padding: "300px 20px 20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  section: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  codeBlock: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "8px",
    overflow: "auto",
  },
  visualBox: {
    backgroundColor: "#f0fdf4",
    padding: "20px",
    borderRadius: "8px",
    fontFamily: "monospace",
  },
  visual: {
    display: "block",
    fontSize: "14px",
    lineHeight: "2",
  },
  list: {
    lineHeight: "2",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f3f4f6",
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #e5e7eb",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },
  demoSection: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  colorBox: {
    padding: "40px",
    borderRadius: "8px",
    textAlign: "center",
    marginTop: "15px",
  },
  colorBoxText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
  },
  footer: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    color: "#fff",
  },
  scrollTopButton: {
    marginTop: "15px",
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  floatingIndicator: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  floatingText: {
    display: "block",
  },
};
