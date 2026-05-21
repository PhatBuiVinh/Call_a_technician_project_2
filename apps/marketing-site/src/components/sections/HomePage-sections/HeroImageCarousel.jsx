import { useEffect, useMemo, useRef, useState } from "react";
import heroImg1 from "../../../assets/hero-team1.webp";
import heroImg2 from "../../../assets/hero-team2.webp";


const BASE_IMAGES = [
  { src: heroImg1, alt: "Technician team collaborating in the office" },
  { src: heroImg2, alt: "Technician performing on-site support" },
];

export default function HeroImageCarousel({
  imageUrl,
  imageTrackRef,
  reduceMotion = false,
  className = "",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  const images = useMemo(() => {
    if (!imageUrl) return BASE_IMAGES;
    return [
      { src: imageUrl, alt: "Featured technician team" },
      BASE_IMAGES[1],
    ];
  }, [imageUrl]);

  useEffect(() => {
    if (reduceMotion || isPaused || images.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [reduceMotion, isPaused, images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    const preloaded = new Image();
    preloaded.src = images[nextIndex].src;
  }, [currentIndex, images]);

  const goTo = (index) => setCurrentIndex(index);

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);

  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const onTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const onTouchEnd = (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goNext();
    if (delta > 0) goPrev();
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`.trim()}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Technician gallery"
    >
      <div ref={imageTrackRef} className="absolute inset-0 will-change-transform">
        {images.map((image, index) => {
          const active = index === currentIndex;
          return (
            <div
              key={`${image.src}-${index}`}
              className={`absolute inset-0 motion-standard will-change-[opacity,transform] ${
                active ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transitionDuration: reduceMotion ? "220ms" : "650ms",
              }}
              aria-hidden={!active}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
                style={{ transition: "opacity 220ms ease" }}
              />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/50 via-brand-navy/5 to-transparent" />

      <div className="absolute bottom-1 left-0 right-0 z-20 flex items-center justify-center gap-2 pb-1">
        {images.map((_, index) => {
          const active = index === currentIndex;
          return (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2 rounded-full transition-all duration-300 focus-brand ${
                active ? "w-6 bg-brand-navy" : "w-2 bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={active ? "true" : "false"}
            />
          );
        })}
      </div>
    </div>
  );
}
