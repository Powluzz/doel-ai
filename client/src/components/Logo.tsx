import doeliKleur from "../assets/doelio-kleur.png";
import doeliWit from "../assets/doelio-wit.png";
import doeliZwart from "../assets/doelio-zwart.png";
import logoKlein from "../assets/logo-klein-kleur.png";
import logoKleinWit from "../assets/logo-klein-wit.png";
import logoKleinZwart from "../assets/logo-klein-zwart.png";

type LogoVariant = "kleur" | "wit" | "zwart";
type LogoSize = "full" | "klein";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  height?: number;
}

const srcMap: Record<LogoSize, Record<LogoVariant, string>> = {
  full: {
    kleur: doeliKleur,
    wit: doeliWit,
    zwart: doeliZwart,
  },
  klein: {
    kleur: logoKlein,
    wit: logoKleinWit,
    zwart: logoKleinZwart,
  },
};

export default function Logo({
  variant = "kleur",
  size = "full",
  className = "",
  height = 32,
}: LogoProps) {
  return (
    <img
      src={srcMap[size][variant]}
      alt="doel.io logo"
      height={height}
      style={{ height }}
      className={className}
    />
  );
}
