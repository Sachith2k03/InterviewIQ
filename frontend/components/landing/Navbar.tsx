"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import logo from "../../public/images/logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071126]/95 backdrop-blur-md">
      <div className="relative mx-auto max-w-7xl">
        {/* Main navbar */}
        <div className="flex h-15 items-center justify-between px-5 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center"
            aria-label="Go to InterviewIQ home page"
          >
            <Image
              src={logo}
              alt="InterviewIQ"
              priority
              className="h-auto w-[155px] object-contain sm:w-[175px]"
            />
          </Link>

          {/* Desktop buttons */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="absolute left-0 right-0 top-full border-b border-white/10 bg-[#071126] px-5 py-5 shadow-2xl shadow-black/30 lg:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}