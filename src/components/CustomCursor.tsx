import { useEffect, useState } from "react";

const interactiveSelector =
  "a, button, input, textarea, select, [role='button'], [data-cursor='interactive']";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reduceMotion.matches) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-enabled");

    function onMove(event: MouseEvent) {
      setPos({ x: event.clientX, y: event.clientY });
      setVisible(true);
      setActive(Boolean((event.target as Element | null)?.closest(interactiveSelector)));
    }

    function onLeave() {
      setVisible(false);
    }

    function onDown() {
      setActive(true);
    }

    function onUp(event: MouseEvent) {
      setActive(Boolean((event.target as Element | null)?.closest(interactiveSelector)));
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.documentElement.classList.remove("custom-cursor-enabled");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <span
        aria-hidden="true"
        className={`modern-cursor-ring ${visible ? "is-visible" : ""} ${active ? "is-active" : ""}`}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      />
      <span
        aria-hidden="true"
        className={`modern-cursor-dot ${visible ? "is-visible" : ""} ${active ? "is-active" : ""}`}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      />
    </>
  );
}
