import Image from "next/image";

function Logo({ size, style }: { size: string; style?: string }) {
  const dimension = Number(size);

  return (
    <div
      className={`relative ${style}`}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src="/static/images/logo/light.png"
        width={dimension}
        height={dimension}
        alt="Amsterdam Parent Project Logo"
        priority
        className="dark:hidden"
      />

      <Image
        src="/static/images/logo/dark.png"
        width={dimension}
        height={dimension}
        alt="Amsterdam Parent Project Logo"
        priority
        className="hidden dark:block"
      />
    </div>
  );
}

export default Logo;
