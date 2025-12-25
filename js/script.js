document.addEventListener("DOMContentLoaded", () => {
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- HEADER: Boot Flicker + Month Display -----
  const statusWord = document.querySelector(".status-word");
  const flicker = [
    "// JAN ", "// FEB ", "// MAR ", "// APR ", "// MAY ", "// JUN ", "// LOOK", "// LOOK", "// AGAIN", "// AGAIN",
    "// JUL ", "// AUG ", "// SEP ", "// OCT ", "// NOV ", "// DEC "
  ];
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  let i = 0;
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

  // ----- CLOCK: Local Time 24hr -----
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    const pad = n => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    tick();
    setInterval(tick, 30000);
  }

  // ----- BOOT LOG -----
  const logEl = document.getElementById("bootlog");
  if (logEl) {
    const now = new Date();
    const isDecember = now.getMonth() === 11;

    // Visit tracking
    let visits = parseInt(localStorage.getItem("visits") || "0", 10);
    visits = (visits + 1) % 4;
    localStorage.setItem("visits", visits.toString());

    let evolvingPool = [];
    switch (visits) {
      case 0:
        evolvingPool = ["i think i remember you"];
        break;
      case 1:
        evolvingPool = [
          "memory detected",
          "i think i remember you",
          "do you remember me?"
        ];
        break;
      case 2:
        evolvingPool = [
          "this place is waiting for you",
          "do you remember me?"
        ];
        break;
      case 3:
        evolvingPool = [
          "it goes aways so easily only noticed when it's to late",
          "familiarity breeds ... amnesia",
          "retrieval impossible",
          "loop reset detected. nothing was learned"
        ];
        break;
    }

    const seedLines = [
      "********** OS V1.0.0 **********",
      "boot sequence initialized",
      "decrypting ...",
      "01000111 01001111 01000100",
      "initializing connection ...",
      "system memory attached",
      "please stand by ...",
    ];

    const basePool = [
      "memory fragmented ...",
      "they left behind silence ... the machine filled it with dreams",
      "universe expanding ...",
      "wish you were here",
      "this place is waiting for you",
      "would you kindly ... forget everything",
      "the systems were melting and i felt fine",
      "even utopia rots when left alone",
      "reality bends where guilt lingers",
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

      if (visits === 3 && logEl.children.length === 3) {
        li.classList.add("glitch-line");
      }

      logEl.appendChild(li);

      const maxLines = window.innerWidth <= 600 ? 9 : 7;
      while (logEl.children.length > maxLines) {
        logEl.removeChild(logEl.firstChild);
      }
    }

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
      const pool = basePool.concat(evolvingPool).concat(isDecember ? decemberPool : []);
      setInterval(() => {
        const text = pool[Math.floor(Math.random() * pool.length)];
        appendLine(text);
      }, 5000 + Math.random() * 4000);
    }
  }

  // ----- PIP NAVIGATION -----
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
      if (next !== null) {
        e.preventDefault();
        tabs[next].focus();
        activate(tabs[next].id);
      }
    });

    const initial = tabs.find(t => '#' + t.id === location.hash) || tabs[0];
    if (initial) activate(initial.id, false);

    window.addEventListener('hashchange', () => {
      const target = tabs.find(t => '#' + t.id === location.hash);
      if (target) activate(target.id, false);
    });
  }
});
