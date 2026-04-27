import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      const next = max > 0 ? (scrollTop / max) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, next)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-[76px] z-[60] h-1 md:top-[86px]" aria-hidden="true">
      <div
        className="h-full origin-left bg-brand-green motion-standard motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
