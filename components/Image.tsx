import NextImage, { ImageProps } from "next/image";

const basePath = process.env.BASE_PATH;

const Image = ({ src, ...rest }: ImageProps) => {
  const isExternal = typeof src === "string" && src.startsWith("http");

  // If external, use src as is. If internal, append the basePath.
  const finalSrc = isExternal ? src : `${basePath || ""}${src}`;

  return <NextImage src={finalSrc} {...rest} unoptimized={isExternal} />;
};

export default Image;
