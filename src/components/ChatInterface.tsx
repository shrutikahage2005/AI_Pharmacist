import { useState, useCallback, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Bot, User, Pill, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { medicines } from "@/data/medicines";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pharmacist-chat`;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "👋 Hello! I'm **PharmaCare AI**, your personal pharmacist assistant. I can help you:\n\n- 💊 Order medicines & check availability\n- 📋 Verify prescriptions\n- 🔄 Set up automatic refills\n- ❓ Answer health questions\n\nHow can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
  }, []);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const send = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to connect to AI");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > newMessages.length) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary text-secondary-foreground rounded-bl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full flex-shrink-0 ${isListening ? "bg-destructive text-destructive-foreground" : ""}`}
            onClick={isListening ? stopVoice : startVoice}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={isListening ? "🎤 Listening..." : "Ask about medicines, orders, or health..."}
            className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <Button
            size="icon"
            className="rounded-full flex-shrink-0"
            onClick={send}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
