"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/timer", label: "番茄钟" },
  { href: "/tree", label: "科技树" },
  { href: "/chronicle", label: "编年史" },
  { href: "/settings", label: "设置" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b px-4 py-2">
      <div className="mx-auto flex max-w-4xl items-center gap-6">
        <Link href="/timer" className="text-lg font-bold">
          CivilPomo
        </Link>
        <div className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
