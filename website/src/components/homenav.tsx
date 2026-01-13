import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navList: { name: string; href: string; openInNewTab?: boolean }[] = [
  { name: "Home", href: "/" },
  { name: "Docs", href: "/docs" },
  {
    name: "GitHub",
    href: "https://github.com/taiatiniyara/MANTIS.git",
    openInNewTab: true,
  },
];

export default function HomeNav() {
  const { userMetadata } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <a
              href="/"
              onClick={closeMenu}
            >
              <img
                alt="MANTIS Logo"
                src="/logo.svg"
                className="h-8 w-auto"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <ul className="flex space-x-8">
              {navList.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="text-neutral-700 hover:text-neutral-900 transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            {userMetadata ? (
              <Button asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
              >
                <a href="/auth/login">Login</a>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navList.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.openInNewTab ? "_blank" : undefined}
                rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                onClick={closeMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
            <div className="px-3 py-2">
              {userMetadata ? (
                <Button
                  asChild
                  className="w-full"
                >
                  <a
                    href={`${userMetadata.role.split(" ").join("-").toLowerCase()}`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </a>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a
                    href="/auth/login"
                    onClick={closeMenu}
                  >
                    Login
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
