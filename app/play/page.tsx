"use client";

import { useMemo, useState } from "react";
import "./play.css";

const SYMBOLS = ["Σ", "Δ", "Ω", "Θ", "Φ", "Ψ"];
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 8;

type Guess = string[];
type ScoredGuess = { guess: Guess; exact: number; shifted: number };

function randomCode(): Guess {
  return Array.from({ length: CODE_LENGTH }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
}

function score(secret: Guess, guess: Guess): { exact: number; shifted: number } {
  let exact = 0;
  const secretRemain: string[] = [];
  const guessRemain: string[] = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === secret[i]) {
      exact++;
    } else {
      secretRemain.push(secret[i]);
      guessRemain.push(guess[i]);
    }
  }
  const counts: Record<string, number> = {};
  for (const s of secretRemain) counts[s] = (counts[s] ?? 0) + 1;
  let shifted = 0;
  for (const g of guessRemain) {
    if (counts[g] > 0) {
      shifted++;
      counts[g]--;
    }
  }
  return { exact, shifted };
}

export default function PlayPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const [secret, setSecret] = useState<Guess>(() => randomCode());
  const [current, setCurrent] = useState<Guess>([]);
  const [history, setHistory] = useState<ScoredGuess[]>([]);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");

  const attemptsLeft = MAX_ATTEMPTS - history.length;

  const startNewGame = () => {
    setSecret(randomCode());
    setCurrent([]);
    setHistory([]);
    setStatus("playing");
  };

  const addSymbol = (sym: string) => {
    if (status !== "playing" || current.length >= CODE_LENGTH) return;
    setCurrent((prev) => [...prev, sym]);
  };

  const removeLast = () => {
    if (status !== "playing") return;
    setCurrent((prev) => prev.slice(0, -1));
  };

  const submitGuess = () => {
    if (status !== "playing" || current.length !== CODE_LENGTH) return;
    const { exact, shifted } = score(secret, current);
    const nextHistory = [...history, { guess: current, exact, shifted }];
    setHistory(nextHistory);
    setCurrent([]);
    if (exact === CODE_LENGTH) {
      setStatus("won");
    } else if (nextHistory.length >= MAX_ATTEMPTS) {
      setStatus("lost");
    }
  };

  const slots = useMemo(() => {
    const filled = [...current];
    while (filled.length < CODE_LENGTH) filled.push("");
    return filled;
  }, [current]);

  return (
    <main className="play-shell">
      <header className="play-header">
        <a className="play-logo" href={`${basePath}/`}>ITHAKA_SYS</a>
        <div className="play-header-links">
          <a href={`${basePath}/`}>HOME</a>
          <a href={`${basePath}/archive/`}>ARCHIVE</a>
        </div>
        <div className="play-head-status">
          <span className="play-pulse" /> SYSTEM LOCK
        </div>
      </header>

      <section className="play-panel">
        <div className="play-kicker">/PLAY · S-002 · DECRYPT ACCESS CODE</div>
        <h1>CRACK<br />THE CODE</h1>
        <p className="play-rules">
          Guess the {CODE_LENGTH}-symbol access code in {MAX_ATTEMPTS} attempts.
          After each try: <b className="play-dot play-dot--exact" /> exact symbol in the right slot,
          {" "}<b className="play-dot play-dot--shifted" /> right symbol, wrong slot.
        </p>

        <div className="play-palette" aria-label="Available symbols">
          {SYMBOLS.map((sym) => (
            <button
              key={sym}
              type="button"
              className="play-symbol"
              onClick={() => addSymbol(sym)}
              disabled={status !== "playing" || current.length >= CODE_LENGTH}
            >
              {sym}
            </button>
          ))}
        </div>

        <div className="play-current">
          <div className="play-slots">
            {slots.map((sym, i) => (
              <span className={`play-slot ${sym ? "play-slot--filled" : ""}`} key={i}>{sym}</span>
            ))}
          </div>
          <div className="play-current-actions">
            <button type="button" onClick={removeLast} disabled={!current.length || status !== "playing"}>
              CLEAR
            </button>
            <button
              type="button"
              className="play-submit"
              onClick={submitGuess}
              disabled={current.length !== CODE_LENGTH || status !== "playing"}
            >
              SUBMIT ↵
            </button>
          </div>
        </div>

        {status === "playing" && (
          <div className="play-status-line">ATTEMPTS LEFT: {attemptsLeft} / {MAX_ATTEMPTS}</div>
        )}

        {status === "won" && (
          <div className="play-result play-result--won">
            <strong>ACCESS GRANTED</strong>
            <p>Code cracked in {history.length} attempt{history.length === 1 ? "" : "s"}. ITHAKA recognizes you.</p>
            <button type="button" onClick={startNewGame}>NEW CODE ↻</button>
          </div>
        )}

        {status === "lost" && (
          <div className="play-result play-result--lost">
            <strong>ACCESS DENIED</strong>
            <p>System locked. The code was: <span className="play-reveal">{secret.join(" ")}</span></p>
            <button type="button" onClick={startNewGame}>TRY AGAIN ↻</button>
          </div>
        )}

        <div className="play-history" aria-label="Attempt history">
          {history.length === 0 && <p className="play-history-empty">No attempts yet.</p>}
          {[...history].reverse().map((h, i) => (
            <div className="play-history-row" key={history.length - i}>
              <span className="play-history-index">{String(history.length - i).padStart(2, "0")}</span>
              <span className="play-history-guess">
                {h.guess.map((s, j) => <i key={j}>{s}</i>)}
              </span>
              <span className="play-history-score">
                {Array.from({ length: h.exact }).map((_, k) => <b className="play-dot play-dot--exact" key={`e${k}`} />)}
                {Array.from({ length: h.shifted }).map((_, k) => <b className="play-dot play-dot--shifted" key={`s${k}`} />)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="play-footer">
        <span>ITHAKA_SYS / PLAY MODE</span><span>FROM CHAOS TO SYSTEM</span><span>© 2026</span>
      </footer>
    </main>
  );
}
