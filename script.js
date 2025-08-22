document.addEventListener("DOMContentLoaded", () => {
  // Respect reduced motion once, reuse everywhere
  const prefersReduce =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- HEADER: short boot flicker then month/year lock-in -----
  const statusWord = document.querySelector(".status-word");
  const flicker = [
    "// JAN ", "// FEB ", "// MAR ", "// APR ", "// MAY ", "// JUN ",
    "// JUL ", "// AUG ", "// SEP ", "// OCT ", "// NOV ", "// DEC "
  ]; // brief, machine-like
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  let i = 0;
  // Show a very short flicker when reduced motion is on, full sequence otherwise
  const FLICKER_STEPS = prefersReduce ? 12 : flicker.length;
  const STEP_MS = prefersReduce ? 105 : 50;

  (function cycle() {
    if (!statusWord) return;
    if (i < FLICKER_STEPS) {
      statusWord.textContent = flicker[i++] || flicker[flicker.length - 1];
      setTimeout(cycle, STEP_MS);
    } else {
      const now = new Date();
      statusWord.textContent = `// ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    }
  })();

  // ----- CLOCK: 24-hour local time -----
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    const pad = n => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    tick();
    setInterval(tick, 30000); // update every 30s
  }

  // ----- BOOT LOG: seed + live ticker (adds seasonal lines in December) -----
  const logEl = document.getElementById("bootlog");
  if (logEl) {
    const now = new Date();
    const isDecember = now.getMonth() === 11; // 0-based months, 11 = DEC

    const seedLines = [
      "********** OS V1.0.0 **********",
      "01000101 01000011 01001000 01001111",
      "grid",
      "01000111 01001111 01000100",
      "initializing connection...",
      "system memory attached",
      "please stand by...",
    ];

    const basePool = [
      "memory sector fragmented...",
      "reality patch applied",
      "universe ... expanding",
      "idle dream ... looping",
      "time loop stable ",
      "void staring back",
      "where does the universe end ... unknown",

    ];

    const decemberPool = [
      "snow filter … ready",
      "ambient jingle … muted",
      "ornament data … cached",
      "warm lights … simulated",
      "holiday banner … disabled",
    ];

    function appendLine(text) {
      const li = document.createElement("li");
      li.textContent = text;
      logEl.appendChild(li);
      
      // dynamic max lines based on viewport
      const maxLines = window.innerWidth <= 600 ? 9 : 7;
      
      while (logEl.children.length > maxLines) {
        logEl.removeChild(logEl.firstChild);
  }
}

    // seed quickly
    let s = 0;
    (function seed() {
      if (s < seedLines.length) {
        appendLine(seedLines[s++]);
        setTimeout(seed, 300 + Math.random() * 300);
      } else {
        startTicker();
      }
    })();

    function startTicker() {
      const pool = basePool.concat(isDecember ? decemberPool : []);
      setInterval(() => {
        const text = pool[Math.floor(Math.random() * pool.length)];
        appendLine(text);
      }, 5000 + Math.random() * 4000); // 5–9s
    }
  }

  // ----- PIP NAV: tabs with ARIA + hash routing -----
  // Expects markup like:
  // <div role="tablist" class="nav" aria-label="Pip navigation"> ... </div>
  const tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls'))).filter(Boolean);

    function lazyLoad(panel) {
      panel.querySelectorAll('img[data-src]').forEach(img => {
        img.setAttribute('src', img.getAttribute('data-src'));
        img.removeAttribute('data-src');
      });
    }

    function activate(id, setHash = true) {
      tabs.forEach((tab, idx) => {
        const selected = tab.id === id;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
        const panel = panels[idx];
        if (panel) {
          panel.hidden = !selected;
          if (selected) lazyLoad(panel);
        }
      });
      if (setHash) {
        try {
          history.replaceState(null, "", '#' + id);
        } catch (_) {
          // fallback if history API not available
          location.hash = id;
        }
      }
    }

    tablist.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (!tab) return;
      activate(tab.id);
      tab.focus();
    });

    // Keyboard navigation: ArrowLeft/ArrowRight cycles through tabs
    tablist.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        tabs[next].focus();
        activate(tabs[next].id);
      }
    });

    // On load, honor hash (e.g., #tab-data) or default to first tab
    const initial = tabs.find(t => '#' + t.id === location.hash) || tabs[0];
    if (initial) activate(initial.id, false);

    // Back/forward support
    window.addEventListener('hashchange', () => {
      const target = tabs.find(t => '#' + t.id === location.hash);
      if (target) activate(target.id, false);
    });
  }
});
