import { SUBURB_POSTCODES } from "./suburbPostcodes";

function getRegion(postcode) {
  const pc = parseInt(postcode, 10);
  if (pc >= 5000 && pc <= 5009) return "cbd";
  if (pc >= 5010 && pc <= 5025) return "west";
  if (pc >= 5031 && pc <= 5052) return "southwest";
  if (pc >= 5060 && pc <= 5072) return "east";
  if (pc >= 5073 && pc <= 5099) return "northeast";
  if (pc >= 5100 && pc <= 5131) return "north";
  if (pc >= 5140 && pc <= 5156) return "hills";
  if (pc >= 5157 && pc <= 5174) return "south";
  return "metro";
}

// Deterministic variation selector — same suburb always gets same template
function pick(name, arr) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return arr[h % arr.length];
}

const TEMPLATES = {
  cbd: [
    (n, pc) => `${n} is in the heart of greater Adelaide, just minutes from the CBD. Residents and businesses in ${n} ${pc} rely on fast, dependable technology every day. Call-a-Technician provides same-day onsite computer repairs and IT support across ${n}, reaching most addresses within hours of your call. Whether you have a slow laptop, a virus, or a Wi-Fi issue, we come to you — no need to hand over your device or travel anywhere.`,
    (n, pc) => `Located in Adelaide's inner area, ${n} ${pc} is home to a mix of households and small businesses that count on their computers for work and daily life. Call-a-Technician technicians service all streets throughout ${n}, offering professional onsite repairs for laptops, desktops, printers, and home networks. We offer same-day bookings seven days a week with no fix, no fee.`,
    (n, pc) => `${n} ${pc} sits at the core of Adelaide and attracts both residents and businesses looking for premium inner-city living. When technology lets you down, Call-a-Technician brings expert computer and IT support directly to your door in ${n}. Our technicians are available same-day, every day of the year, and only charge if we fix the problem.`,
  ],
  west: [
    (n, pc) => `${n} ${pc} is a western suburb of Adelaide with a strong community of families and local businesses. Call-a-Technician brings professional computer repair and IT support directly to your door in ${n}, eliminating the need to transport your equipment to a shop. We service all streets and estates throughout ${n} with same-day availability seven days a week.`,
    (n, pc) => `Situated in Adelaide's western corridor, ${n} ${pc} is a vibrant suburb where residents and businesses depend on reliable technology. Call-a-Technician provides fast onsite computer repairs for homes and offices across ${n}, covering everything from virus removal and slow PC tune-ups to Wi-Fi setup and data recovery. No fix, no fee.`,
    (n, pc) => `${n} is one of Adelaide's established western suburbs, offering a relaxed lifestyle close to the city and the coast. When your computer or laptop needs attention, Call-a-Technician can be at your door in ${n} ${pc} the same day. We cover all residential and business addresses across ${n} with clear, honest pricing.`,
  ],
  southwest: [
    (n, pc) => `${n} ${pc} is a well-established suburb in Adelaide's south-western area, home to families and local businesses who rely on their technology every day. Call-a-Technician provides fast onsite computer and laptop repairs throughout ${n}, with same-day availability and a no fix, no fee guarantee for every job.`,
    (n, pc) => `Located south-west of Adelaide's CBD, ${n} ${pc} is a growing community where residents and small businesses need reliable IT support. Call-a-Technician technicians service all streets in ${n}, providing professional computer repairs, virus removal, Wi-Fi troubleshooting, and IT setup without the need to leave your home or office.`,
    (n, pc) => `${n} is a popular south-western suburb of Adelaide with a mix of residential streets, schools, and local businesses. If your computer is running slow, showing errors, or has been infected with malware, Call-a-Technician can reach ${n} ${pc} the same day. We fix laptops, desktops, and home networks — onsite, at your convenience.`,
  ],
  east: [
    (n, pc) => `${n} is one of Adelaide's sought-after eastern suburbs, known for its tree-lined streets and proximity to both the CBD and the Adelaide Hills. Call-a-Technician provides convenient onsite computer and laptop repairs for homes and businesses across ${n} ${pc}, with same-day availability seven days a week. We come to you — no device handover needed.`,
    (n, pc) => `Located in Adelaide's inner-east, ${n} ${pc} is a vibrant suburb with a strong residential and professional community. When your computer, laptop, or home network needs expert attention, Call-a-Technician can be at your door in ${n} the same day. Our technicians are experienced in all types of PC and Mac repairs, network setup, and data recovery.`,
    (n, pc) => `${n} ${pc} is an established eastern suburb of Adelaide with excellent access to the city and the Hills. Call-a-Technician technicians service all properties throughout ${n}, offering professional IT support for households and small businesses alike. Same-day bookings available, with a no fix, no fee policy on every job.`,
  ],
  northeast: [
    (n, pc) => `${n} ${pc} is a well-connected north-eastern suburb of Adelaide, popular with families and professionals. Call-a-Technician provides same-day onsite computer repairs and IT support for all homes and businesses in ${n}. From slow laptops and virus removal to Wi-Fi dropouts and hardware upgrades — we fix it at your door.`,
    (n, pc) => `Situated in Adelaide's north-eastern corridor, ${n} ${pc} is a growing community with a broad range of residential and business technology needs. Call-a-Technician technicians cover all streets in ${n}, offering professional computer repair and IT support with same-day response. No fix, no fee on every job.`,
    (n, pc) => `${n} is a popular suburb in Adelaide's north-east, offering a great balance of community living and easy city access. When your computer or network is giving you trouble, Call-a-Technician can reach ${n} ${pc} the same day. We cover Mac and PC repairs, network troubleshooting, data recovery, and all home and small business IT needs.`,
  ],
  north: [
    (n, pc) => `${n} is located in Adelaide's northern suburbs, a large and growing region where households and small businesses rely on their computers every day. Call-a-Technician provides same-day onsite computer and laptop repairs across ${n} ${pc}, covering everything from virus removal and slow PC fix-ups to Wi-Fi setup and hardware upgrades.`,
    (n, pc) => `${n} ${pc} is part of Adelaide's northern corridor, home to a large residential community and many local businesses. Call-a-Technician technicians service all areas of ${n}, offering professional IT support without the need to hand over your device or drive to a repair centre. Available same-day, 7 days a week.`,
    (n, pc) => `Located in the northern suburbs of Adelaide, ${n} ${pc} is a diverse and active community where reliable technology matters. Call-a-Technician provides fast onsite computer repairs for homes and businesses in ${n}, with same-day bookings available every day of the year. Our no fix, no fee guarantee means you only pay if we solve the problem.`,
  ],
  hills: [
    (n, pc) => `${n} is nestled in the Adelaide Hills, where reliable technology support can sometimes be harder to access. Call-a-Technician extends its same-day onsite service into ${n} ${pc} and surrounding Hills areas, bringing expert computer repairs and IT support directly to homes and businesses without the need to drive into the city.`,
    (n, pc) => `${n} ${pc} is a picturesque Adelaide Hills community where residents and local businesses value personalised, trustworthy service. Call-a-Technician provides professional onsite computer and laptop repairs throughout ${n}, covering slow PCs, virus removal, data recovery, and home network issues — all at your door, same day.`,
    (n, pc) => `Located in the beautiful Adelaide Hills, ${n} ${pc} is home to a community that values quality and reliability in every service they use. Call-a-Technician brings that same standard to computer repairs and IT support in ${n}, providing onsite visits with same-day availability and a no fix, no fee commitment.`,
  ],
  south: [
    (n, pc) => `${n} is part of Adelaide's expanding southern suburbs, a region of growing families and businesses who depend on their computers and devices daily. Call-a-Technician technicians service all streets and estates throughout ${n} ${pc}, providing fast onsite computer repairs and IT support when you need it most — same-day, every day.`,
    (n, pc) => `${n} ${pc} is a popular southern suburb of Adelaide, attracting families and professionals who want space, lifestyle, and convenience. When your computer or network needs expert attention, Call-a-Technician can reach ${n} the same day. We cover laptop repairs, virus removal, Wi-Fi fix, and all home and business IT needs.`,
    (n, pc) => `Located in Adelaide's southern corridor, ${n} ${pc} is a vibrant community with a growing demand for reliable onsite IT support. Call-a-Technician provides professional computer repairs and IT services throughout ${n}, operating seven days a week with same-day availability. No fix, no fee — you only pay when we solve the problem.`,
  ],
  metro: [
    (n, pc) => `${n} ${pc} is a suburb of greater Adelaide where Call-a-Technician provides same-day onsite computer repairs and IT support. Whether you need help with a slow laptop, a virus infection, Wi-Fi issues, or a hardware upgrade, our technicians come directly to your home or business in ${n}. No fix, no fee.`,
    (n, pc) => `Call-a-Technician services ${n} ${pc} as part of its 420+ Adelaide suburb coverage. Our technicians provide fast, professional onsite computer and laptop repairs for homes and businesses across ${n}, available same-day every day of the week. We come to you — no need to hand over your device or visit a repair centre.`,
  ],
};

export function getSuburbDescription(displayName, postcode) {
  const region = getRegion(postcode);
  const templates = TEMPLATES[region] || TEMPLATES.metro;
  const fn = pick(displayName, templates);
  return {
    short: `Fast, same-day computer repairs and IT support for homes and businesses in ${displayName} ${postcode}. We come to you — no fix, no fee.`,
    long: fn(displayName, postcode),
  };
}

export function getNearbySuburbs(displayName, count = 8) {
  const postcode = SUBURB_POSTCODES[displayName];
  if (!postcode) return [];
  const pc = parseInt(postcode, 10);

  return Object.entries(SUBURB_POSTCODES)
    .filter(([name, code]) => {
      if (name === displayName) return false;
      const diff = Math.abs(parseInt(code, 10) - pc);
      return diff > 0 && diff <= 10;
    })
    .slice(0, count)
    .map(([name, code]) => ({ name, postcode: code }));
}
