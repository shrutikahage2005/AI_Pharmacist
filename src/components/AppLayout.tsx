import { useState } from "react";
import { MessageSquare, LayoutDashboard, Package, Activity, Bell, Pill, Menu, X, ChevronRight, LogOut, Brain, Zap, History, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

type View = "consumer-chat" | "consumer-history" | "consumer-prescription" | "admin-dashboard" | "admin-inventory" | "admin-alerts" | "admin-disease" | "admin-traces" | "admin-workflows";

const consumerNavItems = [
  { id: "consumer-chat" as View, label: "AI Pharmacist", icon: MessageSquare },
  { id: "consumer-history" as View, label: "My Orders", icon: History },
  { id: "consumer-prescription" as View, label: "Upload Rx", icon: FileImage },
];

const adminNavItems = [
  { id: "admin-dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  { id: "admin-inventory" as View, label: "Inventory", icon: Package },
  { id: "admin-alerts" as View, label: "Refill Alerts", icon: Bell },
  { id: "admin-disease" as View, label: "Disease Matrix", icon: Activity },
  { id: "admin-traces" as View, label: "Agent Traces", icon: Brain },
  { id: "admin-workflows" as View, label: "Workflows", icon: Zap },
];

interface AppLayoutProps {
  currentView: View;
  onViewChange: (view: View) => void;
  children: React.ReactNode;
}

export default function AppLayout({ currentView, onViewChange, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, signOut } = useAuth();

  const allItems = [...consumerNavItems, ...(role === "admin" ? adminNavItems : [])];

  const sections = role === "admin"
    ? [{ label: "Consumer", items: consumerNavItems }, { label: "Admin", items: adminNavItems }]
    : [{ label: "Menu", items: consumerNavItems }];

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 gradient-primary flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
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

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {sections.map(section => (
            <div key={section.label}>
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-2">{section.label}</p>
              <div className="space-y-1">
                {section.items.map(item => (
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

        <div className="px-5 py-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>AI Agent Active</span>
            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">{role || "user"}</Badge>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3 border-b border-border bg-card/50">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {allItems.find(n => n.id === currentView)?.label}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            <div className="pulse-dot">
              <span className="text-xs text-muted-foreground hidden sm:inline">Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

export type { View };
