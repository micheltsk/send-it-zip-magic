import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
  /** Si true, oculta la nav (ej. en el reproductor inmersivo) */
  hideNav?: boolean;
}

export const AppShell = ({ children, hideNav }: AppShellProps) => (
  <div className="min-h-screen bg-background bg-gradient-glow">
    <main className={`max-w-md mx-auto safe-top ${hideNav ? "" : "pb-24"}`}>
      {children}
    </main>
    {!hideNav && <BottomNav />}
  </div>
);
