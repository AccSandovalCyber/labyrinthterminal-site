document.addEventListener('DOMContentLoaded', () => {
  const prefersReduce =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================
  // HEADER: boot flicker -> month/year
  // =========================
  const statusWord = document.querySelector('.status-word');

  const FLICKER = [
    '// sync ',
    '// scan ',
    '// align ',
    '// jan ',
    '// feb ',
    '// mar ',
    '// apr ',
    '// may ',
    '// jun ',
    '// jul ',
    '// aug ',
    '// sep ',
    '// oct ',
    '// nov ',
    '// dec ',
  ];

  const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  if (statusWord) {
    let i = 0;
    const FLICKER_STEPS = prefersReduce ? 12 : FLICKER.length;
    const FLICKER_STEP_MS = prefersReduce ? 120 : 85;

    (function cycle() {
      if (i < FLICKER_STEPS) {
        statusWord.textContent = FLICKER[i++] || FLICKER[FLICKER.length - 1];
        window.setTimeout(cycle, FLICKER_STEP_MS);
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
    const CLOCK_TICK_MS = 30_000;
    window.setInterval(tick, CLOCK_TICK_MS);
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
      'sleep cycle aborted',
      'memory sectors responding',
      'environment loading',
      'stand by ...',
    ];

    const signalPool = [
      'cells',
      'cells interlinked',
      'within cells interlinked',
      'interlinked',
    ];

    const idlePool = [
      'thoughts loop without friction',
      'memory travels faster when the world slows down',
      'i see that place in my restless dreams',
      'the room forgets your weight',
      'time stretches thin here',
    ];

    const decemberPool = [
      'station ID: winter',
      'cold light on empty pavement',
      'breath fogs the glass',
      'the year exhales quietly',
      'let it snow, let it snow',
    ];

    // ---- idle detection ----
    let lastInteraction = Date.now();
    const IDLE_MS = 25_000;

    const markInteraction = () => { lastInteraction = Date.now(); };
    ['mousemove','keydown','scroll','touchstart','pointerdown'].forEach((evt) => {
      window.addEventListener(evt, markInteraction, { passive: true });
    });

    const isIdle = () => Date.now() - lastInteraction > IDLE_MS;

    // ---- log writer ----
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

    const pickFrom = (pool) => pool[Math.floor(Math.random() * pool.length)];

    function pickNonRepeat(pool) {
      let next = pickFrom(pool);
      let guard = 0;
      while (next === lastLine && guard < 6) {
        next = pickFrom(pool);
        guard++;
      }
      lastLine = next;
      return next;
    }

    // ---- boot timing ----
    const PREBOOT_MIN_MS = 120;
    const PREBOOT_MAX_MS = 650;

    const SEED_MIN_MS = 140;
    const SEED_MAX_MS = 420;

    const SETTLE_MIN_MS = 3_800;
    const SETTLE_MAX_MS = 6_000;

    const rand = (min, max) => min + Math.random() * (max - min);

    // seed fast (after a little dead air)
    let s = 0;

    function seed() {
      if (s < seedLines.length) {
        appendLine(seedLines[s++]);
        window.setTimeout(seed, rand(SEED_MIN_MS, SEED_MAX_MS));
        return;
      }

      // settle after boot
      window.setTimeout(() => {
        const pool = (isIdle() ? idlePool : signalPool).concat(isDecember ? decemberPool : []);
        const first = pickNonRepeat(pool);
        appendLine(first);
        startTicker();
      }, rand(SETTLE_MIN_MS, SETTLE_MAX_MS));
    }

    window.setTimeout(seed, rand(PREBOOT_MIN_MS, PREBOOT_MAX_MS));

    // ---- antenna ticker (slow + irregular) ----
    function startTicker() {
      const nextDelay = () => {
        // Mostly long gaps (3–4/min), rare interference flicker.
        const idle = isIdle();

        const flickerChance = idle ? 0.02 : 0.04;
        if (Math.random() < flickerChance) return rand(900, 1800);

        const roll = Math.random();

        if (roll < 0.55) {
          // drift
          return idle ? rand(16_000, 24_000) : rand(14_000, 22_000);
        }

        if (roll < 0.88) {
          // hold
          return idle ? rand(26_000, 40_000) : rand(22_000, 34_000);
        }

        // dead air
        return idle ? rand(40_000, 70_000) : rand(34_000, 60_000);
      };

      const tick = () => {
        const pool = (isIdle() ? idlePool : signalPool).concat(isDecember ? decemberPool : []);
        appendLine(pickNonRepeat(pool));
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

  const MONITORS = [
    { src: 'assets/camera/001.jpg' },
    { src: 'assets/camera/002.jpg' },
    { src: 'assets/camera/003.jpg' },
    { src: 'assets/camera/004.jpg' },
    { src: 'assets/camera/005.jpg' },
    { src: 'assets/camera/006.jpg' },
    { src: 'assets/camera/007.jpg' },
    { src: 'assets/camera/008.jpg' },
    { src: 'assets/camera/009.jpg' },
    { src: 'assets/camera/010.jpg' },
    { src: 'assets/camera/011.jpg' },
    { src: 'assets/camera/012.jpg' },
    { src: 'assets/camera/013.jpg' },
    { src: 'assets/camera/014.jpg' },
    { src: 'assets/camera/015.jpg' },
    { src: 'assets/camera/016.jpg' },
    { src: 'assets/camera/017.jpg' },
    { src: 'assets/camera/018.jpg' },
    { src: 'assets/camera/019.jpg' },
    { src: 'assets/camera/020.jpg' },
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
      img.src = item.src;

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

      // legacy hydration if any remain
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