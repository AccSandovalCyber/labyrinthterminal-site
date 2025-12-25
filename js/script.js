document.addEventListener('DOMContentLoaded', () => {
  const prefersReduce =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================
  // HEADER: boot flicker -> month/year
  // =========================
  const statusWord = document.querySelector('.status-word');
  const flicker = [
    '// jan ', '// feb ', '// mar ', '// apr ', '// may ', '// jun ',
    '// look', '// look', '// again', '// again',
    '// jul ', '// aug ', '// sep ', '// oct ', '// nov ', '// dec ',
  ];
  const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  if (statusWord) {
    let i = 0;
    const FLICKER_STEPS = prefersReduce ? 12 : flicker.length;
    const STEP_MS = prefersReduce ? 105 : 50;

    (function cycle() {
      if (i < FLICKER_STEPS) {
        statusWord.textContent = flicker[i++] || flicker[flicker.length - 1];
        setTimeout(cycle, STEP_MS);
        return;
      }
      const now = new Date();
      statusWord.textContent = `// ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    })();
  }

  // =========================
  // CLOCK: Los Angeles time (always)
  // =========================
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const tick = () => {
      clockEl.textContent = fmt.format(new Date());
    };

    tick();
    window.setInterval(tick, 30_000);
  }

  // =========================
  // BOOT LOG: signal vs idle
  // =========================
  const logEl = document.getElementById('bootlog');
  if (logEl) {
    const now = new Date();
    const isDecember = now.getMonth() === 11;

    const seedLines = [
      '********** CORE ONLINE **********',
      'power routed',
      'cognitive matrix loading',
      'memory sectors aligned',
      'standby state entered',
    ];

    const signalPool = [
      'signal received',
      'within cells interlinked',
      'carrier found',
      'channel open',
      'interference fading',
      'voiceprint: unknown',
      'transmission holds',
    ];

    const idlePool = [
      'it remains quiet',
      'screen glow only',
      'the air feels archived',
      'i see that place in my restless dreams',
      'it slips away so easily — only noticed once it’s out of reach',
      'even utopia rots when left alone',
    ];

    const decemberPool = [
      'streets quieter than usual',
      'windows glowing in the distance',
      'memories surface this time of year',
      'warmth simulated',
      'chestnuts in the static',
      'a carol stuck in the walls',
      'winter frequency: low',
      'let it snow, let it snow',
    ];

    // idle detection
    let lastInteraction = Date.now();
    const IDLE_MS = 25_000;

    const markInteraction = () => {
      lastInteraction = Date.now();
    };

    ['mousemove', 'keydown', 'scroll', 'touchstart', 'pointerdown'].forEach((evt) => {
      window.addEventListener(evt, markInteraction, { passive: true });
    });

    const isIdle = () => Date.now() - lastInteraction > IDLE_MS;

    const maxLines = () => (window.innerWidth <= 600 ? 9 : 7);
    let lastLine = '';

    function appendLine(text) {
      const li = document.createElement('li');
      li.textContent = text;

      // glitch disabled (keep the world calm)
      // li.classList.add('glitch-line');

      logEl.appendChild(li);

      while (logEl.children.length > maxLines()) {
        logEl.removeChild(logEl.firstChild);
      }
    }

    // seed fast
    let s = 0;
    (function seed() {
      if (s < seedLines.length) {
        appendLine(seedLines[s++]);
        window.setTimeout(seed, 120 + Math.random() * 160);
        return;
      }

      // brief pause after boot (feels like a system settling)
      window.setTimeout(() => {
        const firstPool = (isIdle() ? idlePool : signalPool)
          .concat(isDecember ? decemberPool : []);
        const first = firstPool[Math.floor(Math.random() * firstPool.length)];
        lastLine = first;
        appendLine(first);
        startTicker();
      }, 3000);
    })();

    // true dynamic timing (setTimeout loop)
    function startTicker() {
      const nextDelay = () => {
        if (isIdle()) return 10_000 + Math.random() * 6_000; // 10–16s
        return 7_000 + Math.random() * 4_000;                // 7–11s
      };

      const tick = () => {
        const pool = (isIdle() ? idlePool : signalPool)
          .concat(isDecember ? decemberPool : []);

        // avoid back-to-back duplicates
        let next = pool[Math.floor(Math.random() * pool.length)];
        let guard = 0;
        while (next === lastLine && guard < 6) {
          next = pool[Math.floor(Math.random() * pool.length)];
          guard++;
        }
        lastLine = next;
        appendLine(next);

        window.setTimeout(tick, nextDelay());
      };

      window.setTimeout(tick, nextDelay());
    }
  }

  // =========================
  // TAB NAVIGATION (PIP)
  // =========================
  const tablist = document.querySelector('[role="tablist"]');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = tabs
    .map((t) => document.getElementById(t.getAttribute('aria-controls')))
    .filter(Boolean);

  // =========================
  // CAMERA GRID
  // =========================
  const monitorsGrid = document.getElementById('monitorsGrid');
  let monitorsBuilt = false;

  // Add files as you drop them into: /assets/camera/
  const MONITORS = [
    { src: 'assets/camera/001.jpg' },
    { src: 'assets/camera/002.jpg' },
    { src: 'assets/camera/003.jpg' },
    { src: 'assets/camera/004.jpg' },
    { src: 'assets/camera/005.jpg' },
    { src: 'assets/camera/006.jpg' },
    { src: 'assets/camera/007.jpg' },
    { src: 'assets/camera/008.jpg' },
  ];

  function buildMonitorsGrid() {
    if (!monitorsGrid || monitorsBuilt) return;
    monitorsBuilt = true;

    const frag = document.createDocumentFragment();

    MONITORS.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'monitor-item';

      const a = document.createElement('a');
      a.href = item.src;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', 'open image');

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = '';
      img.src = item.src; // load immediately when the panel opens

      img.addEventListener('error', () => li.remove());

      a.appendChild(img);
      li.appendChild(a);
      frag.appendChild(li);
    });

    monitorsGrid.appendChild(frag);
  }

  function activate(id, setHash = true) {
    tabs.forEach((tab, idx) => {
      const selected = tab.id === id;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;

      const panel = panels[idx];
      if (!panel) return;

      panel.hidden = !selected;
      if (selected && panel.id === 'panel-inv') buildMonitorsGrid();

      // legacy lazy hydration if any remain
      if (selected) {
        panel.querySelectorAll('img[data-src]').forEach((img) => {
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
        });
      }
    });

    if (setHash) {
      try {
        history.replaceState(null, '', '#' + id);
      } catch {
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

  tablist.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i === -1) return;

    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;

    if (next === null) return;

    e.preventDefault();
    tabs[next].focus();
    activate(tabs[next].id);
  });

  const initial = tabs.find((t) => '#' + t.id === location.hash) || tabs[0];
  if (initial) activate(initial.id, false);

  window.addEventListener('hashchange', () => {
    const target = tabs.find((t) => '#' + t.id === location.hash);
    if (target) activate(target.id, false);
  });
});
