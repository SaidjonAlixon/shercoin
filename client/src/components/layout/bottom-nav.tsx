import { Link, useLocation } from "wouter";
import { Swords, CheckSquare, BookOpen, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Swords, label: "Arena" },
  { path: "/topshiriqlar", icon: CheckSquare, label: "Topshiriqlar" },
  { path: "/shermaktab", icon: BookOpen, label: "SherMaktab" },
  { path: "/dostlar", icon: Users, label: "Do'stlar" },
  { path: "/xazina", icon: Wallet, label: "Xazina" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors",
                "hover-elevate active-elevate-2",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
