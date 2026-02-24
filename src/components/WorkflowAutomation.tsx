import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Webhook, Mail, MessageSquare, CheckCircle, Clock, XCircle, Settings, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface WebhookLog {
  id: string;
  order_id: string | null;
  webhook_type: string;
  webhook_url: string | null;
  payload: any;
  response_status: number | null;
  status: string | null;
  created_at: string;
}

export default function WorkflowAutomation() {
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem("zapier_webhook_url") || "");
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      setLogs((data as WebhookLog[]) || []);
      setLoading(false);
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveWebhookUrl = () => {
    localStorage.setItem("zapier_webhook_url", webhookUrl);
    toast({ title: "Saved", description: "Zapier webhook URL saved." });
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast({ title: "Error", description: "Enter a Zapier webhook URL first.", variant: "destructive" });
      return;
    }
    setTesting(true);
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          event: "test_webhook",
          timestamp: new Date().toISOString(),
          source: "PharmaCare AI",
          message: "Test webhook from PharmaCare Agentic System",
        }),
      });

      await supabase.from("webhook_logs").insert({
        webhook_type: "zapier_test",
        webhook_url: webhookUrl,
        payload: { event: "test_webhook" },
        response_status: 200,
        status: "sent",
      });

      toast({ title: "Test sent!", description: "Check your Zapier dashboard to confirm." });
    } catch {
      toast({ title: "Error", description: "Failed to send test webhook.", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const statusIcon = (status: string | null) => {
    if (status === "sent" || status === "success") return <CheckCircle className="w-4 h-4 text-primary" />;
    if (status === "failed") return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-warning" />;
  };

  const typeIcon = (type: string) => {
    if (type.includes("email")) return <Mail className="w-4 h-4 text-info" />;
    if (type.includes("whatsapp")) return <MessageSquare className="w-4 h-4 text-primary" />;
    return <Webhook className="w-4 h-4 text-warning" />;
  };

  return (
    <div className="p-4 lg:p-6 overflow-y-auto h-full scrollbar-thin space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">⚡ Workflow Automation</h3>
        <p className="text-sm text-muted-foreground">Webhooks, email & WhatsApp notifications triggered on order events</p>
      </div>

      {/* Zapier Config */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Zapier / n8n Webhook</h4>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Connect your Zapier/n8n webhook URL. Order events will be POSTed here automatically.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" onClick={saveWebhookUrl}>Save</Button>
          <Button onClick={testWebhook} disabled={testing}>
            <Send className="w-4 h-4 mr-1" />
            {testing ? "Sending..." : "Test"}
          </Button>
        </div>
      </div>

      {/* Mock notification channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-info" />
            <h4 className="font-semibold">Email Notifications</h4>
            <Badge variant="secondary" className="text-xs">Mock</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Order confirmations are logged as mock email events in the webhook log below.</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">WhatsApp Alerts</h4>
            <Badge variant="secondary" className="text-xs">Mock</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Refill reminders and order updates are logged as mock WhatsApp events below.</p>
        </div>
      </div>

      {/* Webhook Logs */}
      <div className="glass-card rounded-xl p-5">
        <h4 className="font-semibold mb-3">📋 Event Log</h4>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet. Place an order via AI chat to trigger workflows.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {logs.map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                {typeIcon(log.webhook_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{log.webhook_type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {log.webhook_url || JSON.stringify(log.payload).substring(0, 80)}
                  </p>
                </div>
                {statusIcon(log.status)}
                <span className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
