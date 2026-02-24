import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Wrench, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Trace {
  id: string;
  session_id: string;
  trace_type: string;
  agent_name: string;
  input: string | null;
  output: string | null;
  tool_calls: any[];
  duration_ms: number | null;
  status: string | null;
  metadata: any;
  created_at: string;
}

export default function AgentTraceViewer() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraces = async () => {
      const { data } = await supabase
        .from("agent_traces")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setTraces((data as Trace[]) || []);
      setLoading(false);
    };
    fetchTraces();
    const interval = setInterval(fetchTraces, 5000);
    return () => clearInterval(interval);
  }, []);

  const typeIcon = (type: string) => {
    switch (type) {
      case "thought": return <Brain className="w-4 h-4 text-info" />;
      case "tool_call": return <Wrench className="w-4 h-4 text-warning" />;
      case "response": return <CheckCircle className="w-4 h-4 text-primary" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading traces...</div>;

  return (
    <div className="p-4 lg:p-6 overflow-y-auto h-full scrollbar-thin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">🔍 Agent Observability</h3>
          <p className="text-sm text-muted-foreground">Chain of Thought traces • Real-time agent decisions</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </Badge>
      </div>

      {traces.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No traces yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start a conversation with the AI Pharmacist to see agent traces here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {traces.map(trace => {
            const expanded = expandedId === trace.id;
            return (
              <div
                key={trace.id}
                className="glass-card rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md"
                onClick={() => setExpandedId(expanded ? null : trace.id)}
              >
                <div className="flex items-center gap-3 p-4">
                  {typeIcon(trace.trace_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{trace.trace_type.replace("_", " ")}</span>
                      <Badge variant="secondary" className="text-xs">{trace.agent_name}</Badge>
                      {trace.status === "success" ? (
                        <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {trace.input?.substring(0, 100) || "No input"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {trace.duration_ms && <span>{trace.duration_ms}ms</span>}
                    <span>{new Date(trace.created_at).toLocaleTimeString()}</span>
                    {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
                {expanded && (
                  <div className="border-t border-border p-4 bg-muted/30 space-y-3 text-sm">
                    {trace.input && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">INPUT</p>
                        <p className="bg-background rounded p-2 text-xs whitespace-pre-wrap">{trace.input}</p>
                      </div>
                    )}
                    {trace.tool_calls && (trace.tool_calls as any[]).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">TOOL CALLS</p>
                        <div className="space-y-1">
                          {(trace.tool_calls as any[]).map((tc, i) => (
                            <div key={i} className="bg-background rounded p-2 text-xs">
                              <span className="font-mono text-warning">{tc.name}</span>
                              {tc.args && <span className="text-muted-foreground ml-2">({JSON.stringify(tc.args)})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {trace.output && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">OUTPUT</p>
                        <p className="bg-background rounded p-2 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{trace.output}</p>
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Session: <code className="text-foreground">{trace.session_id.slice(0, 8)}</code></span>
                      {trace.duration_ms && <span>Duration: {trace.duration_ms}ms</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
