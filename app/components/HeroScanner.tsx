"use client";

import { useEffect, useRef } from "react";

type HeroScannerProps = {
  basePath: string;
};

const PHASE_DURATION = 2600;

export function HeroScanner({ basePath }: HeroScannerProps) {
  const squareRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const square = squareRef.current;
    const canvas = canvasRef.current;
    const line = lineRef.current;
    const heroArt = square?.parentElement;
    if (!square || !canvas || !line || !heroArt) return;

    const urls = [
      `${basePath}/ithaka-hero.webp`,
      `${basePath}/ithaka-hero-xray.webp`,
      `${basePath}/ithaka-hero-statue.webp`,
      `${basePath}/ithaka-hero-digital.webp`,
    ];
    const images = urls.map((url) => {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      return image;
    });

    let frameId = 0;
    let startTime = 0;
    let width = 0;
    let height = 0;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = 0;
    let sourceHeight = 0;

    const updateGeometry = () => {
      const squareRect = square.getBoundingClientRect();
      const artRect = heroArt.getBoundingClientRect();
      const source = images[0];
      if (!source.naturalWidth || !source.naturalHeight) return;

      width = squareRect.width;
      height = squareRect.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const imageScale = Math.min(
        artRect.width / source.naturalWidth,
        artRect.height / source.naturalHeight,
      );
      const renderedWidth = source.naturalWidth * imageScale;
      const renderedHeight = source.naturalHeight * imageScale;
      const imageLeft = (artRect.width - renderedWidth) / 2;
      const imageTop = artRect.height - renderedHeight;

      sourceX = (squareRect.left - artRect.left - imageLeft) / imageScale;
      sourceY = (squareRect.top - artRect.top - imageTop) / imageScale;
      sourceWidth = width / imageScale;
      sourceHeight = height / imageScale;
    };

    const drawCrop = (context: CanvasRenderingContext2D, image: HTMLImageElement) => {
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        width,
        height,
      );
    };

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const cycleDuration = PHASE_DURATION * images.length;
      const cycleTime = (time - startTime) % cycleDuration;
      const phase = Math.floor(cycleTime / PHASE_DURATION);
      const progress = (cycleTime % PHASE_DURATION) / PHASE_DURATION;
      const downward = phase % 2 === 0;
      const lineY = downward ? progress * height : (1 - progress) * height;
      const context = canvas.getContext("2d");

      if (context && width && height) {
        const pixelRatio = canvas.width / width;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, width, height);
        drawCrop(context, images[phase]);

        context.save();
        if (downward) {
          context.beginPath();
          context.rect(0, 0, width, lineY);
        } else {
          context.beginPath();
          context.rect(0, lineY, width, height - lineY);
        }
        context.clip();
        drawCrop(context, images[(phase + 1) % images.length]);
        context.restore();
      }

      line.style.transform = `translate3d(0, ${lineY}px, 0) translateY(-50%)`;
      frameId = requestAnimationFrame(animate);
    };

    const ready = Promise.all(
      images.map((image) =>
        image.complete && image.naturalWidth
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
    const resizeObserver = new ResizeObserver(updateGeometry);
    resizeObserver.observe(heroArt);

    ready.then(() => {
      updateGeometry();
      frameId = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [basePath]);

  return (
    <div className="scan-square" ref={squareRef}>
      <canvas className="scan-canvas" ref={canvasRef} />
      <div className="scan-tint" />
      <div className="scan-line" ref={lineRef} />
      <div className="scan-crosshair">+</div>
      <div className="scan-meta">
        <span>SCULPT.EXE</span>
        <span>RENDER PASS_09</span>
        <span>STATUS: SYNC</span>
      </div>
    </div>
  );
}
