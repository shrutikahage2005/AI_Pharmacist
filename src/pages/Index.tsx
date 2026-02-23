import { useState } from "react";
import AppLayout, { type View } from "@/components/AppLayout";
import ChatInterface from "@/components/ChatInterface";
import AdminDashboard from "@/components/AdminDashboard";
import InventoryTable from "@/components/InventoryTable";
import RefillAlerts from "@/components/RefillAlerts";
import DiseaseMatrix from "@/components/DiseaseMatrix";

const Index = () => {
  const [view, setView] = useState<View>("consumer-chat");

  const renderView = () => {
    switch (view) {
      case "consumer-chat":
        return <ChatInterface />;
      case "admin-dashboard":
        return <AdminDashboard />;
      case "admin-inventory":
        return (
          <div className="p-4 lg:p-6 overflow-y-auto h-full scrollbar-thin">
            <InventoryTable />
          </div>
        );
      case "admin-alerts":
        return (
          <div className="p-4 lg:p-6 overflow-y-auto h-full scrollbar-thin">
            <div className="max-w-3xl">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Proactive Refill Predictions</h3>
                <p className="text-sm text-muted-foreground">AI-predicted refill needs based on purchase history and dosage patterns</p>
              </div>
              <RefillAlerts />
            </div>
          </div>
        );
      case "admin-disease":
        return (
          <div className="p-4 lg:p-6 overflow-y-auto h-full scrollbar-thin">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Disease Prediction Matrix</h3>
              <p className="text-sm text-muted-foreground">Patient health condition distribution by age group based on purchase patterns</p>
            </div>
            <div className="glass-card rounded-xl p-5">
              <DiseaseMatrix />
            </div>
          </div>
        );
    }
  };

  return (
    <AppLayout currentView={view} onViewChange={setView}>
      {renderView()}
    </AppLayout>
  );
};

export default Index;
