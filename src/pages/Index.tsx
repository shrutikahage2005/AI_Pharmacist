import { useState } from "react";
import AppLayout, { type View } from "@/components/AppLayout";
import ChatInterface from "@/components/ChatInterface";
import AdminDashboard from "@/components/AdminDashboard";
import InventoryTable from "@/components/InventoryTable";
import RefillAlerts from "@/components/RefillAlerts";
import DiseaseMatrix from "@/components/DiseaseMatrix";
import AgentTraceViewer from "@/components/AgentTraceViewer";
import WorkflowAutomation from "@/components/WorkflowAutomation";
import ConsumerHistory from "@/components/consumer/ConsumerHistory";
import PrescriptionUpload from "@/components/consumer/PrescriptionUpload";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";

const Index = () => {
  const { role } = useAuth();
  const { t } = useLanguage();
  const defaultView: View = role === "admin" ? "admin-dashboard" : "consumer-chat";
  const [view, setView] = useState<View>(defaultView);

  const handleViewChange = (newView: View) => {
    if (newView.startsWith("admin-") && role !== "admin") return;
    if (newView.startsWith("consumer-") && role === "admin") return;
    setView(newView);
  };

  const renderView = () => {
    switch (view) {
      case "consumer-chat":
        return <ChatInterface />;
      case "consumer-history":
        return <ConsumerHistory />;
      case "consumer-prescription":
        return <PrescriptionUpload />;
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
                <h3 className="text-lg font-semibold mb-1">{t("admin.refillPredictions")}</h3>
                <p className="text-sm text-muted-foreground">{t("admin.refillDesc")}</p>
              </div>
              <RefillAlerts />
            </div>
          </div>
        );
      case "admin-disease":
        return (
          <div className="p-4 lg:p-6 overflow-y-auto h-full scrollbar-thin">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">{t("admin.diseaseTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("admin.diseaseDesc")}</p>
            </div>
            <div className="glass-card rounded-xl p-5">
              <DiseaseMatrix />
            </div>
          </div>
        );
      case "admin-traces":
        return <AgentTraceViewer />;
      case "admin-workflows":
        return <WorkflowAutomation />;
    }
  };

  return (
    <AppLayout currentView={view} onViewChange={handleViewChange}>
      {renderView()}
    </AppLayout>
  );
};

export default Index;
