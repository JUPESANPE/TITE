"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/home", label: "Hoy", icon: "🏠" },
  { href: "/wardrobe", label: "Armario", icon: "👕" },
  { href: "/outfit", label: "Outfit", icon: "✨" },
  { href: "/favorites", label: "Favoritos", icon: "♡" },
] as const;

/** Nav inferior en mobile, sidebar en desktop (punto 7 — mobile first). */
export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-line bg-paper-raised px-2 py-2 md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-xl px-3 text-xs ${
                active ? "text-ink font-medium" : "text-ink-soft"
              }`}
            >
              <span aria-hidden="true" className="text-lg">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <aside
        aria-label="Navegación principal"
        className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col gap-1 border-r border-line bg-paper-raised p-4 md:flex"
      >
        <p className="mb-6 px-2 text-lg font-semibold tracking-tight">TITE</p>
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm ${
                active ? "bg-clay-50 font-medium text-ink" : "text-ink-soft hover:bg-clay-50"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </aside>
    </>
  );
}
