"use client";

import Image from "@/components/Image";
import { useTheme } from "next-themes";

const Logo = () => {
  const { theme } = useTheme();

  return (
    <Image
      src={`/static/images/logo/${theme}.png`}
      width={50}
      height={50}
      alt="Logo"
    />
  );
};

export default Logo;
