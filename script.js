document.addEventListener("DOMContentLoaded", () => {
    // ----- HEADER: short boot flicker then month/year lock-in -----
    const statusWord = document.querySelector(".status-word");
  const flicker = [
      "// milkway",
      "// milkway",
      "",
      "// earth",
      "// earth",
      "// earth",
        
]; // brief, machine-like
    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "aug", "SEP", "OCT", "NOV", "DEC"];
    let i = 0;
    (function cycle() {
        if (!statusWord) return; // safety if the element isn't on this page
        if (i < flicker.length) {
            statusWord.textContent = flicker[i++];
            setTimeout(cycle, 265); // quick flicker
        } else {
            const now = new Date();
            const label = `// ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
            statusWord.textContent = label; // e.g., "SIG // AUG 2025"
            // after lock-in, rotate a subtle status glyph/word every ~4s
            startTopStatus();
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
        setInterval(tick, 500 * 30); // update every 30s   
    }

    // ----- BOOT LOG: seed + live ticker (adds seasonal lines in December) -----
    const logEl = document.getElementById("bootlog");
    if (logEl) {
        const now = new Date();
        const isDecember = now.getMonth() === 11; // 0-based months, 11 = DEC

        const seedLines = [
            "--. --- -..",
            "01000101 01000011 01001000 01001111",
            "grid",
            "01000111 01001111 01000100",
            "initializing connection …",
            "synthetic memory … attached",
            "system ready … stand by",
        ];
   
        const basePool = [
            "lost signal … tolerated",
            "idle dream … looping",
            "memory sector … fragmented",
            "reality patch … applied",
            "universe … expanding",
            "dream data … incomplete",
            "time loop … stable",
            "entropy … increasing",
            "void … staring back",
            "universe … accessed",    
            "existence … simulated",
        ];

        const decemberPool = [
            "snow filter … ready",
            "ambient jingle … muted",
            "ornament data … cached",
            "warm lights … simulated",
            "holiday banner … disabled"
        ];

        function appendLine(text) {
            const li = document.createElement("li");
            li.textContent = text;
            logEl.appendChild(li);
            // keep last 10 lines
            if (logEl.children.length > 10)
                logEl.removeChild(logEl.firstChild);
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

    function startTopStatus() {
      if (!statusWord) return;
      // respect reduced motion: keep it static
      const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduce) return;

      const now = new Date();
      statusWord.textContent = `// ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    }
});
