import { useAuth } from "@/contexts/AuthContext";

const navList: { name: string; href: string; openInNewTab?: boolean }[] = [
  { name: "Home", href: "/" },
  { name: "Docs", href: "/docs" },
  { name: "GitHub", href: "https://github.com/taiatiniyara/MANTIS.git", openInNewTab: true },
];

export default function HomeNav() {
  const { user } = useAuth();
  return (
    <nav className="bg-white shadow p-2">
      <a href="/">
        <img
          alt="MANTIS Logo"
          src="/logo.svg"
          className="w-42"
        />
      </a>

      <ul>
        {navList.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
            >
              {item.name}
            </a>
          </li>
        ))}
      </ul>

      {user ? (
        <a href="/dashboard">Dashboard</a>
      ) : (
        <a href="/auth/login">Login</a>
      )}
    </nav>
  );
}
