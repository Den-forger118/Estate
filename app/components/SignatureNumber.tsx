interface SignatureNumberProps {
  number: string;
  side?: "left" | "right";
}

export function SignatureNumber({ number, side = "left" }: SignatureNumberProps) {
  return (
    <div
      className="signature-number"
      aria-hidden="true"
      style={{
        [side === "left" ? "left" : "right"]: "-20px",
      }}
    >
      {number}
    </div>
  );
}
