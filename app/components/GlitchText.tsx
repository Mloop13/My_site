"use client";

import { useRef } from "react";

/**
 * Заголовок с glitch-эффектом на наведение. Два разных характера:
 *  - "scramble" — символы «декодируются»: слева направо проявляется оригинал,
 *    остальные мигают случайными знаками (буквы заменяются на знаки);
 *  - "swap"     — соседние буквы дёргано меняются местами и успокаиваются.
 * Текст рендерится как есть (SSR-safe), анимация — только на клиенте по наведению.
 * При prefers-reduced-motion эффект не запускается.
 */
const GLYPHS = "!<>-_\\/[]{}=+*#%0123456789ΔΣΩ▚▞█░↯".split("");
const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

type Line = { text: string; accent?: boolean };

export function GlitchText({
  lines,
  mode,
}: {
  lines: Line[];
  mode: "scramble" | "swap";
}) {
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  const run = () => {
    if (runningRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    runningRef.current = true;
    const start = performance.now();
    const DUR = mode === "scramble" ? 640 : 520;

    const settle = () => {
      lines.forEach((line, li) => {
        const span = spansRef.current[li];
        if (span) span.textContent = line.text;
      });
      runningRef.current = false;
    };

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      lines.forEach((line, li) => {
        const span = spansRef.current[li];
        if (!span) return;
        const orig = line.text;
        if (mode === "scramble") {
          const reveal = Math.floor(orig.length * t);
          let out = "";
          for (let i = 0; i < orig.length; i++) {
            const ch = orig[i];
            out += ch === " " || i < reveal ? ch : rnd();
          }
          span.textContent = out;
        } else {
          const chars = orig.split("");
          const swaps = Math.round((1 - t) * Math.min(6, Math.floor(orig.length / 2)));
          for (let s = 0; s < swaps; s++) {
            const j = Math.floor(Math.random() * (chars.length - 1));
            if (chars[j] === " " || chars[j + 1] === " ") continue;
            const tmp = chars[j];
            chars[j] = chars[j + 1];
            chars[j + 1] = tmp;
          }
          span.textContent = chars.join("");
        }
      });
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else settle();
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <span className="glitch-text" onPointerEnter={run}>
      {lines.map((line, i) => (
        <span
          key={line.text + i}
          ref={(el) => {
            spansRef.current[i] = el;
          }}
          className={`glitch-line${line.accent ? " h-accent" : ""}`}
        >
          {line.text}
        </span>
      ))}
    </span>
  );
}
