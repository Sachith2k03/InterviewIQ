import Link from "next/link";

const footerLinks = [
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Terms of Service",
    href: "/terms",
  },
  {
    label: "Contact Us",
    href: "mailto:interviewiq@example.com",
  },
  {
    label: "FAQ",
    href: "#faq",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#050d1d] px-5 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-3 sm:items-center">
            {/* Brand */}
            <div className="order-1 justify-self-start">
            <Link
                href="/"
                className="text-lg font-semibold tracking-tight text-blue-300 transition-colors duration-300 hover:text-blue-200"
            >
                InterviewIQ
            </Link>
            </div>

            {/* Footer links */}
            <nav
            aria-label="Footer navigation"
            className="order-2 flex flex-wrap items-center gap-x-5 gap-y-2 sm:order-3 sm:justify-self-end"
            >
            {footerLinks.map((link) => (
                <Link
                key={link.label}
                href={link.href}
                className="text-xs text-slate-500 transition-colors duration-300 hover:text-blue-300"
                >
                {link.label}
                </Link>
            ))}
            </nav>

            {/* Copyright */}
            <p className="order-3 text-center text-xs text-slate-500 sm:order-2 sm:justify-self-center">
            © {currentYear} InterviewIQ. All rights reserved.
            </p>     
      </div>
    </footer>
  );
}