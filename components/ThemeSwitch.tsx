"use client";

import { Fragment, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Radio,
  RadioGroup,
  Transition,
} from "@headlessui/react";

const Sun = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="group:hover:text-gray-100 h-4 w-4"
  >
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
      clipRule="evenodd"
    />
  </svg>
);
const Moon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-4 w-4"
  >
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

const Blank = () => <svg className="h-4 w-4" />;

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      type="button"
      className="cursor-pointer items-center justify-center text-brand-soft-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod focus:outline-none"
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <div className="inline-flex">
            <span className="whitespace-nowrap leading-4">
              Switch to light mode:&nbsp;
            </span>
            <Sun />
          </div>
        ) : (
          <div className="inline-flex">
            <span className="whitespace-nowrap leading-4">
              Switch to dark mode:&nbsp;
            </span>
            <Moon />
          </div>
        )
      ) : (
        <Blank />
      )}
    </button>
  );
};

export default ThemeSwitch;
