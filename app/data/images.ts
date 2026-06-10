/** Curated luxury estate photography — all URLs verified against images.unsplash.com */

/** Local founder portrait — enhanced in /public/images (regenerate via scripts/enhance-founder-image.mjs) */
export const founderPortrait = "/images/ernest-ofori-sarpong.jpg";

export function estatePhoto(id: string, width = 1400) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;
}

export function estatePortrait(id: string, size = 400) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${size}&h=${size}&q=82`;
}

export const estateImages = {
  heroHome: estatePhoto("photo-1600596542815-ffad4c1539a9", 1600),
  heroInterior: estatePhoto("photo-1600607688969-a5bfcd646154", 1600),
  gardenWalkway: estatePhoto("photo-1600047509358-9dc75507daeb"),
  villaPool: estatePhoto("photo-1512917774080-9991f1c4c750"),
  modernVilla: estatePhoto("photo-1600607687939-ce8a6c25118c"),
  whiteEstate: estatePhoto("photo-1564013799919-ab600027ffc6"),
  gatedEntrance: estatePhoto("photo-1645005049035-c35644b627ba"),
  contemporaryHome: estatePhoto("photo-1600585154340-be6161a56a0c"),
  luxuryExterior: estatePhoto("photo-1600047509807-ba8f99d2cdde"),
  duskResidence: estatePhoto("photo-1600585154526-990dced4db0d"),
  tropicalVilla: estatePhoto("photo-1613490493576-7fde63acd811"),
  livingRoom: estatePhoto("photo-1600566753190-17f0baa2a6c3"),
  brightLiving: estatePhoto("photo-1502672260266-1c1ef2d93688"),
  apartmentInterior: estatePhoto("photo-1513584684374-8bab748fbf90"),
  ensuiteBath: estatePhoto("photo-1600210491369-e753d80a41f3"),
  kitchen: estatePhoto("photo-1617104429585-96ca815824ac"),
  estateInterior: estatePhoto("photo-1600566753151-384129cf4e3e"),
  patioHome: estatePhoto("photo-1600566753086-00f18fb6b3ea"),
  duplexExterior: estatePhoto("photo-1643297551340-19d8ad4f20ad"),
  communityLobby: estatePhoto("photo-1600607687920-4e2a09cf159d", 1600),
  estateAerial: estatePhoto("photo-1600607688066-890987f18a86"),
  keysHandover: estatePhoto("photo-1560518883-ce09059eeffa"),
  maintenance: estatePhoto("photo-1621905251189-08b45d6a269e"),
  cleaningSession: estatePhoto("photo-1686178827149-6d55c72d81df"),
  serviceGardening: estatePhoto("photo-1416879595882-3373a0480b5b"),
  servicePlumbing: estatePhoto("photo-1581578731548-c64695cc6952"),
  serviceHvac: estatePhoto("photo-1558618666-fcd25c85cd64"),
  skylineEstate: estatePhoto("photo-1600596542815-ffad4c1539a9", 1200),
  oakwoodEstate: estatePhoto("photo-1613490493576-7fde63acd811", 1200),
  grandDevelopment: estatePhoto("photo-1605146769289-440113cc3d00", 1200),
  networking: estatePhoto("photo-1511795409834-ef04bbd61622", 1200),
  communityGathering: estatePhoto("photo-1529156069898-49953e39b3ac", 1200),
  familyParks: estatePhoto("photo-1573493380834-bcfa84766e2e"),
  briefing: estatePhoto("photo-1556761175-5973dc0f32e7", 1200),
  testimonialKwame: estatePortrait("photo-1769636929354-59165ba73c7e"),
  testimonialElena: estatePortrait("photo-1573496359142-b8d87734a5a2"),
  testimonialSamuel: estatePortrait("photo-1582750433449-648ed127bb54"),
} as const;
