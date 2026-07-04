"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "記録", icon: "📊" },
  { href: "/courses", label: "教材", icon: "📚" },
  { href: "/calendar", label: "カレンダー", icon: "🗓️" },
  { href: "/goals", label: "目標", icon: "🎯" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex border-t border-slate-200 bg-white">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
              active ? "text-blue-600" : "text-slate-500"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
