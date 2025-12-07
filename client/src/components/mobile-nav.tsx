import { Link, useLocation } from "wouter";
import { Home, Heart, HandCoins, Calculator, History, LayoutGrid, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();

  const items = [
    { href: "/", icon: Home, label: "Главная" },
    { href: "/campaigns", icon: LayoutGrid, label: "Кампании" },
    { href: "/partners", icon: HandCoins, label: "Фонды" },
    { href: "/rating", icon: Trophy, label: "Рейтинг" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-primary/70"
              )}>
                <item.icon className={cn("w-6 h-6 mb-1", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
