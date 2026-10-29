// Logo officiel WhatsApp (public/icones/whatsapp.png, 512 × 512), décoratif : le texte du lien dit « WhatsApp ».
import Image from "next/image";

type WhatsAppLogoProps = {
  /** Côté en pixels. */
  size?: number;
  className?: string;
};

export function WhatsAppLogo({ size = 24, className = "" }: WhatsAppLogoProps) {
  return (
    <Image
      src="/icones/whatsapp.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`shrink-0 rounded-[22%] ${className}`}
    />
  );
}
