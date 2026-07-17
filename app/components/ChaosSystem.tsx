"use client";

import { useEffect, useRef, useState } from "react";

/**
 * «Из хаоса — в систему» — интерактивное поле частиц для панели About.
 * Точки дрейфуют хаосом; курсором их нужно СОБРАТЬ в древнегреческий символ (Δ).
 * Призрачный контур цели всегда виден — он показывает «путь до порядка». Радиус
 * сбора небольшой, а собранные точки не разбегаются, поэтому символ нужно
 * «прорисовать» целиком. «Сброс» рассыпает прогресс, «Песочница» снимает фиксацию
 * и даёт свободно лепить (точки мягко возвращаются в хаос, символ не защёлкивается).
 * Пауза вне вида; статичный символ при reduced-motion.
 */
const GLYPH = "Δ";
const HINT_DEFAULT = "веди курсором — собери Δ";
const HINT_SOLVED = "Δ · система собрана";

export function ChaosSystem() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sandboxRef = useRef(false);
  const resetRef = useRef<() => void>(() => {});
  const [sandboxOn, setSandboxOn] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = 110;

    type P = { hx: number; hy: number; cx: number; cy: number; x: number; y: number; ph: number; order: number };
    let particles: P[] = [];
    let W = 0;
    let H = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    let raf = 0;
    let visible = false;
    let solved = false;

    // Сэмплируем форму символа: рисуем его в offscreen и берём заполненные пиксели.
    const sampleGlyph = (count: number) => {
      const oc = document.createElement("canvas");
      const s = 200;
      oc.width = s;
      oc.height = s;
      const octx = oc.getContext("2d");
      if (!octx) return [];
      octx.fillStyle = "#fff";
      octx.font = `800 ${Math.round(s * 0.82)}px "Arial Narrow", Arial, sans-serif`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText(GLYPH, s / 2, s / 2 + s * 0.02);
      const data = octx.getImageData(0, 0, s, s).data;
      const pts: { x: number; y: number }[] = [];
      for (let y = 0; y < s; y += 2) {
        for (let x = 0; x < s; x += 2) {
          if (data[(y * s + x) * 4 + 3] > 128) pts.push({ x: x / s, y: y / s });
        }
      }
      const out: { x: number; y: number }[] = [];
      if (pts.length === 0) return out;
      const step = pts.length / count;
      for (let i = 0; i < count; i++) out.push(pts[Math.floor(i * step)]);
      return out;
    };

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (W < 2 || H < 2) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const glyph = sampleGlyph(N);
      const side = Math.min(W, H) * 0.74;
      const ox = (W - side) / 2;
      const oy = (H - side) / 2;
      const next: P[] = [];
      for (let i = 0; i < glyph.length; i++) {
        const g = glyph[i];
        const prev = particles[i];
        next.push({
          hx: ox + g.x * side,
          hy: oy + g.y * side,
          cx: Math.random() * W,
          cy: Math.random() * H,
          x: prev ? prev.x : Math.random() * W,
          y: prev ? prev.y : Math.random() * H,
          ph: Math.random() * Math.PI * 2,
          order: prev ? prev.order : 0,
        });
      }
      particles = next;
      if (reduce) drawStatic();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(1,222,130,.85)";
      for (const p of particles) ctx.fillRect(p.hx - 2, p.hy - 2, 4, 4);
    };

    const frame = (ts: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      const rad = Math.min(W, H) * 0.14;
      ctx.clearRect(0, 0, W, H);
      // призрачный контур цели — показывает, куда вести точки («путь до порядка»);
      // мягко «дышит», чтобы цель считывалась и притягивала взгляд
      if (!solved) {
        const pulse = 0.13 + 0.06 * (0.5 + 0.5 * Math.sin(ts / 900));
        ctx.fillStyle = `rgba(1,222,130,${pulse})`;
        for (const p of particles) ctx.fillRect(p.hx - 1.4, p.hy - 1.4, 2.8, 2.8);
      }
      let ordered = 0;
      for (const p of particles) {
        const dcx = p.cx + Math.cos(ts / 1400 + p.ph) * (W * 0.035);
        const dcy = p.cy + Math.sin(ts / 1600 + p.ph) * (H * 0.035);
        let want = 0;
        if (solved) want = 1;
        else if (mouse.active) {
          const d = Math.hypot(mouse.x - p.hx, mouse.y - p.hy);
          want = 1 - Math.min(1, d / rad);
        }
        // притягиваются быстро; в обычном режиме собранные держатся (нужно
        // прорисовать символ целиком), в песочнице — мягко возвращаются в хаос
        const ease = want > p.order ? 0.45 : (sandboxRef.current ? 0.05 : 0);
        p.order += (want - p.order) * ease;
        if (p.order > 0.7) ordered++;
        const o = p.order;
        p.x = dcx + (p.hx - dcx) * o;
        p.y = dcy + (p.hy - dcy) * o;
        const size = 1.8 + o * 2.6;
        ctx.fillStyle = `rgba(1,222,130,${0.3 + o * 0.62 + (solved ? 0.08 : 0)})`;
        if (o > 0.6) ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // в песочнице символ не защёлкивается — это свободная лепка
      if (!sandboxRef.current && !solved && particles.length && ordered / particles.length >= 0.93) {
        solved = true;
        wrap.classList.add("is-solved");
        const hint = wrap.querySelector(".chaos-hint");
        if (hint) hint.textContent = HINT_SOLVED;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!reduce && !raf && visible) raf = requestAnimationFrame(frame);
    };

    // рассыпать прогресс и начать заново
    const doReset = () => {
      for (const p of particles) {
        p.order = 0;
        p.cx = Math.random() * W;
        p.cy = Math.random() * H;
        p.x = p.cx;
        p.y = p.cy;
      }
      solved = false;
      wrap.classList.remove("is-solved");
      const hint = wrap.querySelector(".chaos-hint");
      if (hint) hint.textContent = HINT_DEFAULT;
      if (reduce) drawStatic();
      else start();
    };
    resetRef.current = doReset;

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    build();

    const ro = new ResizeObserver(() => build());
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (reduce) drawStatic();
          else start();
        }
      },
      { threshold: 0.04 }
    );
    io.observe(wrap);

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const toggleSandbox = () => {
    const on = !sandboxRef.current;
    sandboxRef.current = on;
    setSandboxOn(on);
    resetRef.current();
  };

  return (
    <div ref={wrapRef} className="chaos-field">
      <canvas ref={canvasRef} />
      <div className="chaos-controls">
        <button type="button" className="chaos-btn" onClick={() => resetRef.current()}>
          Сброс
        </button>
        <button
          type="button"
          className={`chaos-btn${sandboxOn ? " is-on" : ""}`}
          onClick={toggleSandbox}
          aria-pressed={sandboxOn}
        >
          Песочница
        </button>
      </div>
      <span className="chaos-hint">{HINT_DEFAULT}</span>
    </div>
  );
}
