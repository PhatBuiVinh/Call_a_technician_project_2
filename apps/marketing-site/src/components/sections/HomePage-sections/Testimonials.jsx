import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Star } from "lucide-react";


import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Small Business Owner, Adelaide",
    quote:
      "Call-a-Technician fixed our office Wi-Fi the same day. Friendly, professional, and no jargon!",
    img: "https://i.pravatar.cc/80?img=47",
  },
  {
    name: "James P.",
    role: "Home User, Glenelg",
    quote:
      "My laptop was painfully slow. They tuned it up and it feels brand new. Highly recommended.",
    img: "https://i.pravatar.cc/80?img=12",
  },
  {
    name: "Linda K.",
    role: "Freelancer, Norwood",
    quote:
      "Excellent service — they recovered files I thought were lost forever. Worth every cent.",
    img: "https://i.pravatar.cc/80?img=28",
  },
];

export default function Testimonials() {
  return (
    <Section muted>
      <H2 className="text-center">What Our Customers Say</H2>

      <div className="mt-8 max-w-4xl mx-auto">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
        >
          {TESTIMONIALS.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="relative mx-auto max-w-2xl rounded-[40px] border border-slate-200/60 bg-white p-6 text-center transition-transform duration-200 motion-safe:hover:-translate-y-1 md:p-8">
  <div className="pointer-events-none absolute left-5 top-2 text-7xl leading-none text-brand-lightblue/20">“</div>
  <img
    src={t.img}
    alt={t.name}
    className="w-16 h-16 rounded-full mx-auto"
  />
  <p className="mt-4 italic text-slate-700">{t.quote}</p>

  {/* ⭐️ Stars */}
  <div className="mt-3 flex justify-center gap-1 text-brand-green">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={18}
        fill="currentColor"
        stroke="none"
      />
    ))}
  </div>

  <div className="mt-4 text-sm font-semibold text-brand-navy">{t.name}</div>
  <div className="text-sm text-slate-500">{t.role}</div>
</div>

            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Section>
  );
}
