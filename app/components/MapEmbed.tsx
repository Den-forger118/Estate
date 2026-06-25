type MapEmbedProps = {
  lat: number;
  lng: number;
  label: string;
  variant?: "sidebar" | "content";
  zoom?: number;
};

function buildEmbedSrc(lat: number, lng: number, zoom: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=${zoom}&output=embed`;
}

export function MapEmbed({
  lat,
  lng,
  label,
  variant = "content",
  zoom = 15,
}: MapEmbedProps) {
  const src = buildEmbedSrc(lat, lng, zoom);

  return (
    <div className={`map-embed map-embed--${variant}`}>
      <iframe
        title={`Map showing ${label}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
