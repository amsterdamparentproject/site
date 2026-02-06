import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageTitle({ children }: Props) {
  return (
    <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-brand-soft-green sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 dark:text-brand-goldenrod">
      {children}
    </h1>
  );
}
