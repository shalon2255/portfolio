(() => {
  "use strict";
  const C = window.CONFIG, SEC = C.sections, N = SEC.length;
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ls = { get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

  const app = $("#app"), menu = $("#menu"), sec = $("#sec"), mstage = $("#mstage"), panel = $("#panel"), hero = $("#hero"), heroimg = $("#heroimg"), spots = $("#spots"), split = $("#split");
  const visited = new Set(JSON.parse(ls.get("sr_visited2", "[]")));
  let view = "menu", cur = -1, sel = 0, busy = false, typeTok = 0;
  let muted = ls.get("sr_mute", "0") === "1";

  /* ================= SOUND (WebAudio chip blips) ================= */
  let ac;
  function beep(f, d = 0.07, type = "square", v = 0.04, slide = 1, delay = 0) {
    if (muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (slide !== 1) o.frequency.exponentialRampToValueAtTime(f * slide, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d);
    } catch {}
  }
  const sfx = {
    move: () => beep(520, 0.05),
    ok: () => { beep(660, 0.07); beep(990, 0.12, "square", 0.04, 1, 0.07); },
    back: () => { beep(440, 0.07, "square", 0.04, 0.6); },
    wipe: () => beep(180, 0.45, "sawtooth", 0.03, 3),
    tick: () => beep(1100, 0.015, "square", 0.012),
    win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.12, "square", 0.04, 1, i * 0.09)),
  };
  const sndBtn = $("#snd");
  function drawSnd() { sndBtn.firstElementChild.textContent = muted ? "SOUND OFF" : "SOUND ON"; sndBtn.setAttribute("aria-pressed", String(!muted)); }
  sndBtn.addEventListener("click", () => { muted = !muted; ls.set("sr_mute", muted ? "1" : "0"); drawSnd(); sfx.ok(); });
  drawSnd();

  /* ================= IMAGES: preload + sample background colour ================= */
  const imgInfo = {};
  function load(src) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => {
        let col = "#34084a";
        try {
          const c = document.createElement("canvas"); c.width = c.height = 8;
          const x = c.getContext("2d"); x.drawImage(im, 0, 0, 8, 8);
          const px = [[0, 0], [7, 0], [0, 7], [7, 7]].map(([a, b]) => x.getImageData(a, b, 1, 1).data);
          col = "rgb(" + [0, 1, 2].map((k) => Math.round(px.reduce((s, p) => s + p[k], 0) / 4)).join(",") + ")";
        } catch {}
        imgInfo[src] = { col, w: im.naturalWidth, h: im.naturalHeight }; res(im);
      };
      im.onerror = () => res(null);
      im.src = src;
    });
  }
  // remove the baked-in arrow from the menu artwork (we draw our own, it moves)
  function patchMenu(im) {
    try {
      const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
      const x = c.getContext("2d"); x.drawImage(im, 0, 0);
      const k = im.naturalWidth / 1672;
      x.drawImage(c, 200 * k, 396 * k, 56 * k, 60 * k, 256 * k, 396 * k, 56 * k, 60 * k);
      // remove the wings around the name: repaint those two areas with the sky colour sampled from a clean strip
      const y0 = 56, y1 = 204, sx = 836, sw = 40;
      const strip = x.getImageData(Math.round(sx * k), Math.round(y0 * k), Math.round(sw * k), Math.round((y1 - y0) * k)).data, sH = Math.round((y1 - y0) * k), sW = Math.round(sw * k);
      const rowCol = [];
      for (let r = 0; r < sH; r++) { const ch = [[], [], []]; for (let q = 0; q < sW; q++) for (let m = 0; m < 3; m++) ch[m].push(strip[(r * sW + q) * 4 + m]); rowCol.push(ch.map((a) => a.sort((u, v) => u - v)[a.length >> 1])); }
      const sm = rowCol.map((_, r) => [0, 1, 2].map((m) => { let s = 0, n = 0; for (let d = -6; d <= 6; d++) { const rr = r + d; if (rr >= 0 && rr < sH) { s += rowCol[rr][m]; n++; } } return Math.round(s / n); }));
      for (const [rx0, rx1] of [[142, 269], [717, 850]]) for (let r = 0; r < sH; r++) { x.fillStyle = `rgb(${sm[r].join(",")})`; x.fillRect(Math.round(rx0 * k), Math.round(y0 * k) + r, Math.round((rx1 - rx0) * k), 1); }
      $("#menuimg").src = c.toDataURL("image/png");
    } catch {}
  }

  /* ================= MENU ================= */
  const btns = [];
  const mb = $("#menubtns"), cursor = $("#cursor");
  SEC.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = "mbtn"; b.textContent = s.label; b.setAttribute("aria-label", "Open " + s.label);
    b.addEventListener("pointerenter", () => setSel(i));
    b.addEventListener("focus", () => setSel(i, true));
    b.addEventListener("click", () => { setSel(i, true); sfx.ok(); open(i); });
    mb.appendChild(b); btns.push(b);
  });
  function setSel(i, silent, force) {
    if (i === sel && !force && cursor.dataset.ready) return;
    if (i !== sel) sfx.move();
    sel = i; btns.forEach((b, k) => b.classList.toggle("sel", k === i));
    const portrait = matchMedia("(max-aspect-ratio: 1/1)").matches;
    if (portrait) cursor.style.display = "none";
    else { const b = btns[i]; cursor.style.display = ""; gsap.to(cursor, { top: mb.offsetTop + b.offsetTop + (b.offsetHeight - cursor.offsetHeight) / 2, duration: reduce ? 0 : 0.18, ease: "steps(4)" }); }
    cursor.dataset.ready = 1;
  }
  function menuIntro() {
    setSel(sel, true, true); if (reduce) return;
    gsap.fromTo(mstage, { scale: 1.12, rotationY: 8, opacity: 0 }, { scale: 1, rotationY: 0, opacity: 1, duration: 0.9, ease: "power3.out", clearProps: "scale" });
    gsap.fromTo(btns, { xPercent: -140, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: "steps(5)", delay: 0.25, clearProps: "transform,opacity" });
    gsap.fromTo(cursor, { opacity: 0 }, { opacity: 1, delay: 0.7, duration: 0.01 });
  }

  /* ================= TYPEWRITER ================= */
  function typeInto(el, text, speed = 16) {
    const tok = ++typeTok;
    if (reduce) { el.textContent = text; return; }
    el.textContent = ""; el.classList.add("tw"); let i = 0;
    (function step() {
      if (tok !== typeTok) return;
      i += 2; el.textContent = text.slice(0, i); if (i % 6 === 0) sfx.tick();
      if (i < text.length) setTimeout(step, speed); else el.classList.remove("tw");
    })();
  }

  /* ================= SECTION CONTENT ================= */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const T = {
    profile: (s) => `<h2 class="rv">${s.title}</h2><p class="rv" id="dlg"></p>
      <div class="chips">${s.chips.map(([a, b]) => `<div class="chip rv"><b>${a}</b><span>${b}</span></div>`).join("")}</div>
      <div class="row-btns rv"><button class="pxbtn" data-go="contact"><span>★ HIRE ME</span></button><a class="pxbtn" href="${s.play[1]}" target="_blank" rel="noopener noreferrer"><span>${s.play[0]}</span></a><button class="pxbtn" data-go="projects"><span>SEE PROJECTS</span></button></div>`,
    career: (s) => `<h2 class="rv">${s.title}</h2>
      <div class="steps rv">${s.steps.map((st, k) => `<button class="pxbtn small" data-st="${k}"><span>${st.icon} ${st.name}</span></button>`).join("")}</div><div class="stepinfo" id="sinfo"></div>`,
    education: (s) => `<h2 class="rv">${s.title}</h2>${s.items.map(([a, b, c]) => `<div class="row-edu rv"><small>${a}</small><h3>${esc(b)}</h3><p>${esc(c)}</p></div>`).join("")}`,
    projects: (s) => `<h2 class="rv">${s.title}</h2><div class="lvl">${s.projects.map((p, i) => `<button class="lvlbtn rv" data-p="${i}"><small>${p.lvl} · ${p.tag}</small>${esc(p.name)}</button>`).join("")}</div><div id="pdet"></div>`,
    skills: (s) => { let n = 0; return `<h2 class="rv">${s.title}</h2><div class="desc rv" id="sdesc">▶ Select a skill to inspect it.</div>${s.groups.map(([g, items]) => `<div class="grp rv"><h3>${g}</h3><div class="slots">${items.map(([ic, nm, d]) => `<button class="slot" style="animation-delay:${(0.35 + 0.045 * n++).toFixed(2)}s" data-d="${esc(d)}" data-ic="${ic}"><i>${ic}</i>${esc(nm)}</button>`).join("")}</div></div>`).join("")}`; },
    about: (s) => `<h2 class="rv">${s.title}</h2><div class="sheet">${s.sheet.map(([a, b]) => `<div class="chip rv"><b>${a}</b><span>${esc(b)}</span></div>`).join("")}</div><h3 class="tagline rv">${s.heading2}</h3><ul>${s.passives.map((p) => `<li class="rv">${esc(p)}</li>`).join("")}</ul><div class="quest rv">${esc(s.quest)}</div>`,
    contact: (s) => `<h2 class="rv">${s.title}</h2><p class="rv">${s.sub}</p><div style="margin-top:10px">${s.links.map(([a, b, h, cp]) => `<div class="crow rv ${h ? "isl" : ""}"><b>${a}</b>${h ? `<a class="clink" href="${esc(h)}" ${h.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}>${esc(b)} <em>↗</em></a>` : `<span>${esc(b)}</span>`}${cp ? `<button class="pxbtn small" data-copy="${esc(h.replace(/^(mailto:|tel:)/, ""))}"><span>COPY</span></button>` : ""}</div>`).join("")}</div>
      <div class="row-btns rv"><a class="pxbtn" href="${s.resume.file}" download="${s.resume.name}"><span>${s.resume.label}</span></a></div>`,
  };

  function bindSection(s, i) {
    panel.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => { sfx.ok(); open(SEC.findIndex((x) => x.id === b.dataset.go)); }));
    if (s.id === "profile") typeInto($("#dlg"), s.dialog, 14);
    if (s.id === "skills") {
      panel.querySelectorAll(".slot").forEach((b) => {
        b.addEventListener("pointerenter", () => sfx.tick());
        b.addEventListener("click", () => {
          panel.querySelectorAll(".slot").forEach((x) => x.classList.toggle("on", x === b)); sfx.ok();
          typeInto($("#sdesc"), "▶ " + b.textContent + ": " + b.dataset.d, 12);
          b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse");
        });
      });
      if (!reduce) setTimeout(() => { if (cur === SEC.findIndex((x) => x.id === "skills")) sfx.win(); }, 900);
    }
    if (s.id === "projects") {
      const show = (k) => {
        panel.querySelectorAll(".lvlbtn").forEach((x, j) => x.classList.toggle("on", j === k));
        const p = s.projects[k], link = p.links && p.links[0], href = link ? link[1] : "";
        const sparks = p.spark ? `<i class="spark ${p.sparkAlt || ""}" style="--sx:${p.spark[0]}%;--sy:${p.spark[1]}%"></i>${Array.from({ length: 7 }, (_, j) => `<b class="fly" style="--sx:${p.spark[0]}%;--sy:${p.spark[1]}%;--dx:${Math.round(Math.cos(j * 0.9) * 70)}px;--dy:${Math.round(Math.sin(j * 0.9) * 55)}px;animation-delay:${(j * 0.07).toFixed(2)}s"></b>`).join("")}` : "";
        const inner = p.cover ? `<div class="coverin"><img src="${p.cover}" alt="${esc(p.name)} cover" draggable="false">${sparks}${link ? `<span class="playtag">${link[0]}</span>` : ""}</div>` : "";
        const cover = p.cover ? (href ? `<a class="cover" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${esc(link[0])}">${inner}</a>` : `<div class="cover">${inner}</div>`) : "";
        $("#pdet").innerHTML = `${cover}<div class="tagline">${p.status}</div><ul>${p.points.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>${link ? `<div class="row-btns"><a class="pxbtn" href="${href}" target="_blank" rel="noopener noreferrer"><span>${link[0]}</span></a></div>` : ""}`;
        gsap.fromTo("#pdet .cover", { y: 24, opacity: 0, rotationX: -25 }, { y: 0, opacity: 1, rotationX: 0, transformPerspective: 800, duration: reduce ? 0 : 0.5, ease: "back.out(1.4)" });
        gsap.fromTo("#pdet li", { x: 30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.08, duration: reduce ? 0 : 0.3, ease: "steps(4)", delay: 0.15 });
        const cv = $("#pdet .cover"), ci = cv && $(".coverin", cv);
        if (cv && !reduce) {
          cv.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5; gsap.to(ci, { rotationY: nx * 14, rotationX: -ny * 10, transformPerspective: 700, duration: 0.3, overwrite: "auto" }); });
          cv.addEventListener("pointerleave", () => gsap.to(ci, { rotationY: 0, rotationX: 0, duration: 0.5 }));
          cv.addEventListener("pointerenter", () => sfx.move());
        }
      };
      panel.querySelectorAll(".lvlbtn").forEach((b) => b.addEventListener("click", () => { sfx.ok(); show(+b.dataset.p); }));
      show(0);
    }
    panel.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", () => sfx.ok()));
    if (s.id === "contact") panel.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => {
      try { navigator.clipboard.writeText(b.dataset.copy); } catch {}
      sfx.win(); b.firstElementChild.textContent = "COPIED!"; setTimeout(() => (b.firstElementChild.textContent = "COPY"), 1400);
    }));
    if (s.id === "career") initSteps(s);
  }

  function initSteps(s) {
    const box = panel;
    const showStep = (k, snd) => {
      const st = s.steps[k]; if (snd) sfx.ok();
      box.querySelectorAll("[data-st]").forEach((b, j) => b.classList.toggle("on", j === k));
      spots.querySelectorAll(".spot").forEach((b, j) => b.classList.toggle("on", j === k));
      $("#sinfo").innerHTML = `<small>${st.when}</small><h3>${esc(st.title)}</h3><div class="org">${esc(st.org)}</div><ul>${st.points.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
      if (!reduce) {
        gsap.fromTo("#sinfo > *", { x: 30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.07, duration: 0.3, ease: "steps(4)" });
        gsap.fromTo(heroimg, { scale: 1 }, { scale: 1.035, duration: 0.15, yoyo: true, repeat: 1, ease: "steps(2)" });
      }
    };
    s.steps.forEach((st, k) => {
      const sp = document.createElement("button"); sp.className = "spot"; sp.textContent = st.icon; sp.style.left = st.x + "%"; sp.style.top = st.y + "%"; sp.setAttribute("aria-label", st.name);
      sp.addEventListener("click", () => showStep(k, true)); sp.addEventListener("pointerenter", () => sfx.move()); spots.appendChild(sp);
    });
    box.querySelectorAll("[data-st]").forEach((b) => b.addEventListener("click", () => showStep(+b.dataset.st, true)));
    placeSpots(); showStep(s.start || 0, false);
  }
  function placeSpots() {
    const im = heroimg; spots.style.left = im.offsetLeft + "px"; spots.style.top = im.offsetTop + "px"; spots.style.width = im.offsetWidth + "px"; spots.style.height = im.offsetHeight + "px";
  }
  heroimg.addEventListener("load", placeSpots);

  /* ================= WIPE TRANSITION ================= */
  const wipe = $("#wipe"); let blocks = [], rows = 8, cols = 14;
  function buildWipe() {
    cols = innerWidth < 700 ? 8 : 14; rows = Math.max(6, Math.round((cols * innerHeight) / innerWidth));
    wipe.style.gridTemplateColumns = `repeat(${cols},1fr)`; wipe.style.gridTemplateRows = `repeat(${rows},1fr)`;
    wipe.innerHTML = "<i></i>".repeat(cols * rows); blocks = [...wipe.children];
  }
  buildWipe(); addEventListener("resize", () => { buildWipe(); placeSpots(); if (view === "menu") setSel(sel, true, true); });

  function transition(mid, dir = 1) {
    if (busy) return; busy = true;
    const outEl = view === "menu" ? mstage : sec;
    if (reduce) { mid(); busy = false; return; }
    sfx.wipe();
    const grid = { grid: [rows, cols], amount: 0.42 };
    gsap.timeline({ onComplete: () => { busy = false; } })
      .to(outEl, { rotationY: -16 * dir, scale: 0.94, duration: 0.45, ease: "power2.in" }, 0)
      .to(blocks, { scale: 1.02, duration: 0.3, ease: "steps(3)", stagger: { ...grid, from: "center" } }, 0)
      .add(() => { gsap.set(outEl, { clearProps: "transform" }); mid(); }, ">")
      .to(blocks, { scale: 0, duration: 0.3, ease: "steps(3)", stagger: { ...grid, from: "edges" } }, ">+0.05");
  }

  /* ================= NAVIGATION ================= */
  function renderSection(i) {
    const s = SEC[i]; cur = i; typeTok++;
    document.documentElement.style.setProperty("--accent", s.accent);
    sec.style.background = (imgInfo[s.img] || {}).col || "#34084a";
    split.classList.toggle("flip", i % 2 === 1);
    $("#crumb").textContent = "▶ " + s.label;
    $("#sectabs").innerHTML = SEC.map((x, k) => `<button class="stab ${k === i ? "on" : ""}" data-k="${k}" aria-label="${x.label}" title="${x.label}"></button>`).join("");
    $("#sectabs").querySelectorAll(".stab").forEach((b) => b.addEventListener("click", () => { if (+b.dataset.k !== cur) { sfx.ok(); open(+b.dataset.k); } }));
    heroimg.src = s.img; spots.innerHTML = "";
    panel.className = "panel pxbox"; panel.innerHTML = T[s.id](s);
    bindSection(s, i);
    try { history.replaceState(null, "", "#" + s.id); } catch {}
    if (!visited.has(s.id)) { visited.add(s.id); ls.set("sr_visited2", JSON.stringify([...visited])); drawExp(); toast(`<b>NEW AREA UNLOCKED</b><br>${s.label}`); sfx.win(); }
  }
  function sectionIntro(dir) {
    if (reduce) return;
    const flip = split.classList.contains("flip") ? -1 : 1;
    gsap.fromTo(hero, { x: -140 * flip * dir, rotationY: 40 * flip * dir, opacity: 0 }, { x: 0, rotationY: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
    gsap.fromTo(panel, { x: 160 * flip * dir, rotationY: -24 * flip * dir, opacity: 0 }, { x: 0, rotationY: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.08 });
    gsap.fromTo(panel.querySelectorAll(".rv"), { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: "steps(4)", delay: 0.35, clearProps: "opacity,transform" });
    gsap.fromTo(".topbar", { y: -60 }, { y: 0, duration: 0.5, ease: "steps(5)", delay: 0.2 });
    gsap.killTweensOf(heroimg); gsap.set(heroimg, { y: 0 }); gsap.to(heroimg, { y: -10, duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.9 });
  }
  function open(i) {
    i = (i + N) % N; if (busy || (view === "sec" && i === cur)) return;
    const dir = view === "sec" && i < cur ? -1 : 1;
    transition(() => {
      menu.classList.remove("on"); sec.classList.add("on"); view = "sec";
      renderSection(i); sectionIntro(dir); sel = i; $("#hint").style.opacity = ".85";
    }, dir);
  }
  function toMenu() {
    if (busy || view === "menu") return; sfx.back();
    transition(() => { sec.classList.remove("on"); menu.classList.add("on"); view = "menu"; typeTok++; gsap.killTweensOf(heroimg); sel = cur >= 0 ? cur : 0; menuIntro(); try { history.replaceState(null, "", location.pathname); } catch {} }, -1);
  }
  $("#back").addEventListener("click", toMenu);
  $("#prev").addEventListener("click", () => { sfx.move(); open(cur - 1); });
  $("#next").addEventListener("click", () => { sfx.move(); open(cur + 1); });

  addEventListener("keydown", (e) => {
    if (busy) return; const k = e.key;
    if (view === "menu") {
      if (k === "ArrowDown" || k === "s" || k === "S") { e.preventDefault(); setSel((sel + 1) % N); }
      else if (k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); setSel((sel - 1 + N) % N); }
      else if ((k === "Enter" || k === " ") && document.activeElement.tagName !== "BUTTON") { e.preventDefault(); sfx.ok(); open(sel); }
      else if (/^[1-9]$/.test(k) && +k <= N) { setSel(+k - 1); sfx.ok(); open(+k - 1); }
    } else {
      if (k === "Escape" || k === "Backspace") toMenu();
      else if (k === "ArrowRight" || k === "d" || k === "D") { sfx.move(); open(cur + 1); }
      else if (k === "ArrowLeft" || k === "a" || k === "A") { sfx.move(); open(cur - 1); }
      else if (/^[1-9]$/.test(k) && +k <= N) open(+k - 1);
    }
  });

  /* ================= EXP + TOAST ================= */
  function drawExp() { $("#expfill").style.width = (visited.size / N) * 100 + "%"; $("#exptxt").textContent = visited.size + "/" + N; }
  drawExp();
  function toast(html) { const t = $("#toast"); t.innerHTML = html; gsap.killTweensOf(t); gsap.fromTo(t, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: "steps(4)" }); gsap.to(t, { opacity: 0, delay: 2.2, duration: 0.3 }); }

  /* ================= 3D MOUSE TILT ================= */
  const q = { my: gsap.quickTo(mstage, "rotationY", { duration: 0.5, ease: "power2.out" }), mx: gsap.quickTo(mstage, "rotationX", { duration: 0.5, ease: "power2.out" }),
              hy: gsap.quickTo(hero, "rotationY", { duration: 0.6, ease: "power2.out" }), hx: gsap.quickTo(hero, "rotationX", { duration: 0.6, ease: "power2.out" }) };
  addEventListener("pointermove", (e) => {
    if (reduce || busy) return; const nx = (e.clientX / innerWidth - 0.5) * 2, ny = (e.clientY / innerHeight - 0.5) * 2;
    if (view === "menu") { q.my(nx * 2.2); q.mx(-ny * 1.4); } else { q.hy(nx * 12); q.hx(-ny * 7); }
  });

  /* ================= PIXEL PARTICLES + CLICK BURST ================= */
  const cv = $("#fx"), cx = cv.getContext("2d"); let parts = [], burst = [];
  function fit() { cv.width = innerWidth; cv.height = innerHeight; } fit(); addEventListener("resize", fit);
  const COLS = ["#ffd36e", "#ff7ab8", "#7ae0ff", "#fff"];
  for (let i = 0; i < 46; i++) parts.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, s: 3 + Math.floor(Math.random() * 2) * 2, v: 0.2 + Math.random() * 0.6, p: Math.random() * 6, c: COLS[i % 4] });
  addEventListener("pointerdown", (e) => { if (reduce) return; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; burst.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * (2 + Math.random() * 3), vy: Math.sin(a) * (2 + Math.random() * 3), l: 22, c: COLS[i % 4] }); } });
  let last = 0;
  function loop(t) {
    requestAnimationFrame(loop); if (document.hidden || reduce || t - last < 33) return; last = t;
    cx.clearRect(0, 0, cv.width, cv.height);
    for (const p of parts) { p.y -= p.v; p.x += Math.sin(t / 900 + p.p) * 0.4; if (p.y < -8) { p.y = cv.height + 8; p.x = Math.random() * cv.width; } cx.globalAlpha = 0.45 + 0.4 * Math.sin(t / 400 + p.p); cx.fillStyle = p.c; cx.fillRect(Math.round(p.x / 4) * 4, Math.round(p.y / 4) * 4, p.s, p.s); }
    burst = burst.filter((b) => b.l > 0); for (const b of burst) { b.x += b.vx; b.y += b.vy; b.vy += 0.12; b.l--; cx.globalAlpha = b.l / 22; cx.fillStyle = b.c; cx.fillRect(Math.round(b.x / 4) * 4, Math.round(b.y / 4) * 4, 6, 6); }
    cx.globalAlpha = 1;
  }
  requestAnimationFrame(loop);

  /* ================= BOOT ================= */
  (async function boot() {
    const srcs = [...new Set(["assets/menu.png", ...SEC.flatMap((s) => [s.img])])];
    let done = 0; const bar = $("#bootbar");
    const imgs = await Promise.all(srcs.map((s) => load(s).then((im) => { done++; bar.style.width = (done / srcs.length) * 100 + "%"; return im; })));
    if (imgs[0]) {
      patchMenu(imgs[0]);
      try { const c = document.createElement("canvas"); c.width = 64; c.height = 36; c.getContext("2d").drawImage(imgs[0], 0, 0, 64, 36); $("#bgblur").style.backgroundImage = `url(${c.toDataURL()})`; } catch {}
    }
    await new Promise((r) => setTimeout(r, reduce ? 0 : 350));
    const b = $("#boot"); b.style.transition = "opacity .4s"; b.style.opacity = 0; setTimeout(() => (b.style.display = "none"), 450);
    const h = SEC.findIndex((s) => "#" + s.id === location.hash);
    if (h >= 0) { menu.classList.remove("on"); sec.classList.add("on"); view = "sec"; renderSection(h); sectionIntro(1); }
    else menuIntro();
  })();
})();
