import { useState } from "react";
import { MessageSquare, LayoutDashboard, Package, Activity, Bell, Pill, Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "consumer-chat" | "admin-dashboard" | "admin-inventory" | "admin-alerts" | "admin-disease";

const navItems = [
  { id: "consumer-chat" as View, label: "AI Pharmacist", icon: MessageSquare, section: "Consumer" },
  { id: "admin-dashboard" as View, label: "Dashboard", icon: LayoutDashboard, section: "Admin" },
  { id: "admin-inventory" as View, label: "Inventory", icon: Package, section: "Admin" },
  { id: "admin-alerts" as View, label: "Refill Alerts", icon: Bell, section: "Admin" },
  { id: "admin-disease" as View, label: "Disease Matrix", icon: Activity, section: "Admin" },
];

interface AppLayoutProps {
  currentView: View;
  onViewChange: (view: View) => void;
  children: React.ReactNode;
}

export default function AppLayout({ currentView, onViewChange, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = ["Consumer", "Admin"];

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 gradient-primary flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
            <Pill className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-primary-foreground text-lg leading-tight">PharmaCare</h1>
            <p className="text-xs text-sidebar-foreground/70">Agentic AI System</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {sections.map(section => (
            <div key={section}>
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-2">{section}</p>
              <div className="space-y-1">
                {navItems.filter(n => n.section === section).map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onViewChange(item.id); setSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      currentView === item.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                    {currentView === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-sidebar-foreground/60">AI Agent Active</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3 border-b border-border bg-card/50">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {navItems.find(n => n.id === currentView)?.label}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="pulse-dot">
              <span className="text-xs text-muted-foreground hidden sm:inline">System Online</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

export type { View };
