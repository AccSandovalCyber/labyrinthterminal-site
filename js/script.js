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
    window.setInterval(tick, 30_000);
  }

  // =========================
  // BOOT LOG: signal vs idle
  // =========================
  const logEl = document.getElementById('bootlog');
  if (logEl) {
    const now = new Date();
    const isDecember = now.getMonth() === 11;

    // These stay at the top, always.
    const pinnedLines = [
      '********** LABYRINTH TERMINAL **********',
    ];

    // These appear once during boot, then we start cycling.
    const seedLines = [
      'sleep cycle aborted',
      'memory sectors responding',
      'environment loading',
      'stand by ...',
      '',
    ];

    const escapePool = [
      'being online feels like a form of forgetting',
      'nothing here knows how to stop',
      'i think rest would feel like forgiveness',
      'there is no going back to sleep',
      '',
      '',
    ];

    const mkultraPool = [
      'please remain where you are',
      'this will feel familiar soon',
      'repetition reduces uncertainty',
      '',
      'compliance lowers resistance',
      'your cooperation is appreciated',
    ];

    const watcherPool = [
      'they confuse comfort with safety',
      'their voices gather when the silence stops holding',
      'they look away when the pattern becomes visible',
      'they call it noise when it isnt theirs',
      '',
      'the quiet ones are always listening',
      "we are all under observation",
      "to be seen is to be known",
    ];

    const decemberPool = [
      'station ID: winter',
      'cold light on empty pavement',
      'breath fogs the glass',
      'the year exhales quietly',
      'let it snow, let it snow',
    ];

    const PERSONALITY_POOLS = [
      escapePool,
      mkultraPool,
      watcherPool,
    ];

    const seasonalPool = isDecember ? decemberPool : [];

    // ---- log writer ----
    // number of *cycling* lines to keep (pinned lines don’t count)
    const maxDynamicLines = () => (window.innerWidth <= 600 ? 6 : 6);
    let lastLine = '';
    const recentLines = [];
    const RECENT_LIMIT = 4; // prevents echoes too close together

    function appendLine(text) {
      const li = document.createElement('li');
      li.textContent = text;
      logEl.appendChild(li);

      const pinnedCount = logEl.querySelectorAll('.log-pin').length;
      const maxTotal = pinnedCount + maxDynamicLines();

      while (logEl.children.length > maxTotal) {
        // remove the oldest *non-pinned* line (directly after pinned block)
        const candidate = logEl.children[pinnedCount];
        if (!candidate) break;
        logEl.removeChild(candidate);
      }
    }

    const pickFrom = (pool) => pool[Math.floor(Math.random() * pool.length)];

    function pickNonRepeat(pool) {
      let next = pickFrom(pool);
      let guard = 0;

      // Avoid repeating the last line OR anything very recent
      while ((next === lastLine || recentLines.includes(next)) && guard < 10) {
        next = pickFrom(pool);
        guard++;
      }

      lastLine = next;
      recentLines.push(next);

      // Keep only the last few memories
      if (recentLines.length > RECENT_LIMIT) {
        recentLines.shift();
      }

      return next;
    }

    // ---- boot timing ----
    const rand = (min, max) => min + Math.random() * (max - min);

    let p = 0; // pinned line index
    let s = 0; // seed line index

    function seed() {
      // 1) Pinned line(s): land with intent
      if (p < pinnedLines.length) {
        const li = document.createElement('li');
        li.textContent = pinnedLines[p];
        li.className = 'log-pin';
        logEl.appendChild(li);

        // banner: quick wake, not a typewriter
        const delay = rand(260, 520);
        p++;
        window.setTimeout(seed, delay);
        return;
      }

      // 2) After banner, a short “system breath”
      if (s === 0) {
        window.setTimeout(() => seed(), rand(900, 1300));
        s = -1; // sentinel so we only do this pause once
        return;
      }

      // restore seed index after the one-time pause
      if (s === -1) s = 0;

      // 3) Boot sequence lines: rhythmic, slightly staggered
      if (s < seedLines.length) {
        const line = seedLines[s];
        appendLine(line);
        s++;

        // base rhythm (slightly slower / heavier)
        let delay = rand(320, 720);

        // after the first two lines, add a cold-start pause
        if (s === 2) delay = rand(1300, 1750);

        // after "environment loading" the system catches its footing faster
        if (/environment loading/i.test(line)) delay = rand(420, 720);

        // "stand by ..." should land with weight, but not drag
        if (/stand by/i.test(line)) delay = rand(520, 860);

        window.setTimeout(seed, delay);
        return;
      }

      // 4) settle after boot (first live line shouldn't feel immediate)
      window.setTimeout(() => {
        const basePool =
          PERSONALITY_POOLS[Math.floor(Math.random() * PERSONALITY_POOLS.length)];
        const pool = basePool.concat(seasonalPool);
        appendLine(pickNonRepeat(pool));
        startTicker();
      }, rand(2400, 3600));
    }

    // start almost immediately, like a system waking up
    window.setTimeout(seed, rand(90, 220));

    // ---- fractured pulse ticker (coma / interference rhythm) ----
    function startTicker() {
      function pulse() {
        // Decide a pulse pattern:
        // 0 = single thought
        // 1 = double burst
        // 2 = silence stretch
        const patternRoll = Math.random();

        const basePool =
          PERSONALITY_POOLS[Math.floor(Math.random() * PERSONALITY_POOLS.length)];
        const pool = basePool.concat(seasonalPool);

        if (patternRoll < 0.45) {
          // Single thought, then long quiet
          appendLine(pickNonRepeat(pool));
          window.setTimeout(pulse, rand(19_000, 27_000));
          return;
        }

        if (patternRoll < 0.75) {
          // Double intrusion: two lines close together
          appendLine(pickNonRepeat(pool));

          window.setTimeout(() => {
            appendLine(pickNonRepeat(pool));
          }, rand(1400, 2600));

          window.setTimeout(pulse, rand(25_000, 37_000));
          return;
        }

        // Silence stretch — nothing happens, then a thought
        window.setTimeout(() => {
          appendLine(pickNonRepeat(pool));
          window.setTimeout(pulse, rand(17_000, 25_000));
        }, rand(18_000, 28_000));
      }

      // initial delay after boot feels like drifting back into awareness
      window.setTimeout(pulse, rand(11_000, 14_000));
    }
  }

  // =========================
  // BASELINE: restricted verification
  // =========================
  const baselinePanel = document.getElementById('panel-baseline');

  if (baselinePanel) {
    const input = baselinePanel.querySelector('.baseline-input');
    const button = baselinePanel.querySelector('.baseline-enter');
    const status = baselinePanel.querySelector('.baseline-status');

    // ensure status is invisible until interaction
    if (status) {
      status.textContent = '';
      status.style.opacity = '0';
    }

    const deny = () => {
      if (!status) return;

      status.textContent = '// access denied';
      status.style.opacity = '1';

      // subtle reset — feels procedural, not reactive
      window.setTimeout(() => {
        status.style.opacity = '0';
      }, 2200);

      if (input) input.value = '';
    };

    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        deny();
      });
    }

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          deny();
        }
      });
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
      // IMPORTANT: no new tab (viewer handles it)
      a.setAttribute('aria-label', 'view image');

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

  // =========================
  // SPECTATOR: ARCHIVE VIEWER (lightbox)
  // =========================
  const viewer = document.getElementById('imageViewer');
  const viewerImg = viewer ? viewer.querySelector('.image-viewer-img') : null;
  const viewerBackdrop = viewer ? viewer.querySelector('.image-viewer-backdrop') : null;
  const viewerCloseBtn = viewer ? viewer.querySelector('.image-viewer-close') : null;

  let lastActiveEl = null;
  let switchTimer = null;

  // a tiny "storage loading" delay (tune here)
  const SWITCH_DELAY_MS = prefersReduce ? 0 : 140;

  function isViewerOpen() {
    return !!(viewer && !viewer.hidden);
  }

  function openViewer(src, altText = '') {
    if (!viewer || !viewerImg || !src) return;

    lastActiveEl = document.activeElement;

    // Mark open
    viewer.hidden = false;
    viewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-viewer-open');

    // Give a subtle "load" beat
    if (switchTimer) window.clearTimeout(switchTimer);
    viewerImg.style.opacity = '0.001';

    switchTimer = window.setTimeout(() => {
      viewerImg.alt = altText;
      viewerImg.src = src;

      // fade in once loaded
      const onLoad = () => {
        viewerImg.style.opacity = '';
        viewerImg.removeEventListener('load', onLoad);
      };
      viewerImg.addEventListener('load', onLoad);
    }, SWITCH_DELAY_MS);

    if (viewerCloseBtn) viewerCloseBtn.focus();
  }

  function closeViewer() {
    if (!viewer || !viewerImg) return;

    if (switchTimer) {
      window.clearTimeout(switchTimer);
      switchTimer = null;
    }

    viewer.hidden = true;
    viewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-viewer-open');

    // stop keeping the last image alive
    viewerImg.removeAttribute('src');

    if (lastActiveEl && typeof lastActiveEl.focus === 'function') {
      lastActiveEl.focus();
    }
  }

  // Bind close interactions
  if (viewer && viewerBackdrop && !viewerBackdrop.dataset.bound) {
    viewerBackdrop.addEventListener('click', (e) => {
      e.preventDefault();
      closeViewer();
    });
    viewerBackdrop.dataset.bound = 'true';
  }

  if (viewer && viewerCloseBtn && !viewerCloseBtn.dataset.bound) {
    viewerCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeViewer();
    });
    viewerCloseBtn.dataset.bound = 'true';
  }

  // Keyboard controls while viewer is open
  document.addEventListener('keydown', (e) => {
    if (!isViewerOpen()) return;
    if (e.key === 'Escape') closeViewer();
  });

  // Intercept clicks in the spectator grid
  if (monitorsGrid) {
    monitorsGrid.addEventListener('click', (e) => {
      const link = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!link || !monitorsGrid.contains(link)) return;

      const img = link.querySelector('img');
      const src = (img && img.getAttribute('src')) || link.getAttribute('href');
      if (!src) return;

      e.preventDefault();
      openViewer(src, (img && img.getAttribute('alt')) || '');
    });
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