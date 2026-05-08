"use client";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";
import { Fragment, useState, useEffect, useRef } from "react";
import Link from "./Link";
import {
  LayoutGrid,
  BookOpen,
  Flame,
  Calendar,
  Newspaper,
  ArrowRight,
} from "lucide-react";

type NavSubLink = { href: string; label: string };
type NavItem = {
  icon: React.ReactNode;
  href: string;
  title: string;
  subtitle?: string;
  subLinks?: NavSubLink[];
};

const resourceItems: NavItem[] = [
  {
    icon: <LayoutGrid className="w-5 h-5" />,
    href: "/programs/fourth-trimester",
    title: "Fourth Trimester Program",
    subtitle: "Your neighborhood support system in the first months postpartum",
  },
  {
    icon: <Newspaper className="w-5 h-5" />,
    href: "/newsletter",
    title: "Newsletter: Just a Phase",
    subtitle: "Local events & expert advice sent every other Monday",
    subLinks: [{ href: "/newsletter", label: "Read past issues" }],
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    href: "/advice",
    title: "Dear Dr. Mom",
    subtitle: "You ask, a local expert answers",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    href: "/calendar",
    title: "Community Calendar",
    subtitle: "Local events for babies, toddlers, and their parents",
    subLinks: [{ href: "/calendar/submit-event", label: "Add your own event" }],
  },
  {
    icon: <Flame className="w-5 h-5" />,
    href: "/programs/burnout",
    title: "Burnout Support Program",
    subtitle: "Tackle parental burnout, together",
  },
];

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false);
  const navRef = useRef(null);

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        enableBodyScroll(navRef.current);
      } else {
        disableBodyScroll(navRef.current);
      }
      return !status;
    });
  };

  useEffect(() => {
    return clearAllBodyScrollLocks;
  });

  return (
    <>
      <button
        aria-label="Toggle Menu"
        onClick={onToggleNav}
        className="md:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod h-8 w-8 sm:mr-4"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <Transition appear show={navShow} as={Fragment} unmount={false}>
        <Dialog as="div" onClose={onToggleNav} unmount={false}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            unmount={false}
          >
            <div className="fixed inset-0 z-60 bg-black/25" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full opacity-0"
            enterTo="translate-x-0 opacity-95"
            leave="transition ease-in duration-200 transform"
            leaveFrom="translate-x-0 opacity-95"
            leaveTo="translate-x-full opacity-0"
            unmount={false}
          >
            <DialogPanel className="fixed top-0 left-0 z-70 h-full w-full bg-brand-white/95 duration-300 dark:bg-gray-950/98">
              <nav
                ref={navRef}
                className="mt-8 flex h-full basis-0 flex-col overflow-y-auto pt-2 px-8 pb-8"
              >
                <div className="space-y-6">
                  {resourceItems.map((item) => (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onToggleNav}
                        className="flex gap-4 group"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-soft-green dark:bg-brand-soft-charcoal flex items-center justify-center text-brand-white group-hover:text-brand-goldenrod dark:group-hover:text-brand-violet transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-bold text-brand-soft-green dark:text-brand-goldenrod group-hover:text-brand-goldenrod dark:group-hover:text-brand-violet transition-colors">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-sm text-brand-soft-charcoal dark:text-brand-sand">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </Link>
                      {item.subLinks && item.subLinks.length > 0 && (
                        <div className="ml-14 mt-2 space-y-1.5">
                          {item.subLinks.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={onToggleNav}
                              className="flex items-start gap-1 text-sm text-brand-soft-green dark:text-brand-white hover:text-brand-goldenrod dark:hover:text-brand-violet transition-colors"
                            >
                              <ArrowRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                              <span>{sub.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <hr className="border-brand-sand my-6" />

                <div className="space-y-4">
                  <Link
                    href="/about"
                    onClick={onToggleNav}
                    className="block font-bold text-brand-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-goldenrod transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="/donate"
                    onClick={onToggleNav}
                    className="block font-bold text-brand-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-goldenrod transition-colors"
                  >
                    Donate
                  </Link>
                </div>
              </nav>

              <button
                className="hover:text-brand-soft-green dark:hover:text-brand-goldenrod fixed top-7 right-4 z-80 h-16 w-16 p-4 text-brand-charcoal dark:text-brand-white"
                aria-label="Toggle Menu"
                onClick={onToggleNav}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
};

export default MobileNav;
