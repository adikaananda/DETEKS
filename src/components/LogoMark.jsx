const src = `${import.meta.env.BASE_URL}deteks.png`;

export default function LogoMark({ size = 36, className = "" }) {
  return (
    <img
      src={src}
      alt="Logo DETEKS"
      className={`block object-contain ${className}`}
      style={{
        height: `${size}px`,
        width: "auto",
        padding: 0,
        margin: 0,
      }}
    />
  );
}

export function LogoLockup({ size = 36, dark = false }) {
  return (
    <LogoMark
      size={size}
      className="p-0 m-0"
    />
  );
}