import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";

// import local logo assets (replace with your real files)
import logoMicrosoft from "../../../assets/logos/microsoft.png";
import logoApple from "../../../assets/logos/apple.png";
import logoDell from "../../../assets/logos/dell.png";
import logoHP from "../../../assets/logos/hp.png";
import logoKaspersky from "../../../assets/logos/kaspersky.webp";

import logoAcer from "../../../assets/logos/Acer.png";
import logoRazer from "../../../assets/logos/Razer.png";
import logoMSI from "../../../assets/logos/MSI.png";





const LOGOS = [
  { src: logoMicrosoft, alt: "Microsoft Partner" },
  { src: logoApple, alt: "Apple Support" },
  { src: logoDell, alt: "Dell Partner" },
  { src: logoHP, alt: "HP Service" },
  { src: logoKaspersky, alt: "Kaspersky" },
  
  { src: logoAcer, alt: "Acer" },
  { src: logoRazer, alt: "Razer" },
  { src: logoMSI, alt: "MSI" },
  // you can add more logos here
];

export default function LogosCarousel() {
  return (
    <Section>
      <div className="container-app">
        <div className="text-center mb-6">
          <H2 className="!text-xl md:!text-2xl">Trusted by homes & small businesses</H2>
          <p className="mt-2 text-slate-600">Proudly supporting Adelaide with reliable tech services</p>
        </div>

        <Swiper
          modules={[Autoplay, FreeMode]}
          freeMode
          loop
          autoplay={{ delay: 0, disableOnInteraction: false }}
          speed={3000}
          slidesPerView={2}
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
          className="select-none"
        >
          {LOGOS.map((l, i) => (
            <SwiperSlide key={i}>
              <div className="h-16 md:h-20 flex items-center justify-center">
                <img
                  src={l.src}
                  alt={l.alt}
                  className="max-h-full object-contain opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Section>
  );
}
