import { Music2, Library, HelpCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", icon: Music2, label: "Importar" },
  { to: "/library", icon: Library, label: "Biblioteca" },
  { to: "/help", icon: HelpCircle, label: "Ayuda" },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border safe-bottom">
    <div className="grid grid-cols-3 max-w-md mx-auto">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-3 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <Icon className="w-5 h-5" />
          <span className="text-[11px] font-medium">{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);
