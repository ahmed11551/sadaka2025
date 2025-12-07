import { MobileNav } from "./mobile-nav";
import pattern from "@assets/generated_images/subtle_background_pattern.png";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      <div 
        className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url(${pattern})`, backgroundSize: 'cover' }}
      />
      <main className="max-w-md mx-auto min-h-screen relative bg-background/50 flex flex-col">
        {children}
      </main>
      <div className="max-w-md mx-auto">
        <MobileNav />
      </div>
    </div>
  );
}
