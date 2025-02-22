"use client";

import Image from "@/components/Image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

function Logo(Props) {
  const { size, style } = Props;
  const { resolvedTheme } = useTheme();
  let src;

  switch (resolvedTheme) {
    case "light":
      src = "light.png";
      break;
    case "dark":
      src = "dark.png";
      break;
    default:
      src = "light.png";
      break;
  }
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Image
      src={`/static/images/logo/${src}`}
      width={Number(size)}
      height={Number(size)}
      alt="Logo"
      className={style}
    />
  );
}

export default Logo;
