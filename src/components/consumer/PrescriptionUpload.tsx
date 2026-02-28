import { useState, useRef } from "react";
import { Upload, FileImage, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";

interface OcrResult {
  medicines: Array<{ name: string; dosage: string; frequency: string }>;
  doctor_name: string;
  patient_name: string;
  date: string;
  raw_text: string;
  summary: string;
}

export default function PrescriptionUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      setError("Please upload an image or PDF file");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const analyze = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError(null);

    try {
      // Upload to storage
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("prescriptions")
        .upload(path, file);
      if (uploadErr) throw uploadErr;

      // Convert to base64 for AI analysis
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.readAsDataURL(file);
      });

      // Call OCR edge function
      const { data, error: fnErr } = await supabase.functions.invoke("prescription-ocr", {
        body: { image_base64: base64, mime_type: file.type, user_id: user.id },
      });

      if (fnErr) throw fnErr;
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to analyze prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 overflow-y-auto h-full scrollbar-thin">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Upload Prescription</h3>
        <p className="text-sm text-muted-foreground">
          Upload a doctor's prescription and our AI will extract medicine details automatically
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Upload area */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          className="glass-card rounded-xl p-8 border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors text-center"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {preview ? (
            <img src={preview} alt="Prescription preview" className="max-h-64 mx-auto rounded-lg mb-3" />
          ) : (
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          )}
          <p className="text-sm font-medium">{file ? file.name : "Click or drag to upload prescription"}</p>
          <p className="text-xs text-muted-foreground mt-1">Supports images (JPG, PNG) and PDF</p>
        </div>

        {file && !result && (
          <Button onClick={analyze} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileImage className="w-4 h-4" />}
            {loading ? "Analyzing with AI Vision..." : "Analyze Prescription"}
          </Button>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="glass-card rounded-xl p-5 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <CheckCircle className="w-5 h-5" />
              Prescription Analyzed Successfully
            </div>

            {result.doctor_name && (
              <p className="text-sm"><span className="text-muted-foreground">Doctor:</span> {result.doctor_name}</p>
            )}
            {result.patient_name && (
              <p className="text-sm"><span className="text-muted-foreground">Patient:</span> {result.patient_name}</p>
            )}
            {result.date && (
              <p className="text-sm"><span className="text-muted-foreground">Date:</span> {result.date}</p>
            )}

            {result.medicines.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Prescribed Medicines:</p>
                <div className="space-y-2">
                  {result.medicines.map((med, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-accent/50 rounded-lg text-sm">
                      <span className="font-medium">{med.name}</span>
                      <span className="text-muted-foreground">{med.dosage}</span>
                      <span className="text-muted-foreground">{med.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.summary && (
              <div className="prose prose-sm max-w-none dark:prose-invert border-t border-border pt-3">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => { setFile(null); setPreview(null); setResult(null); }}
              className="w-full"
            >
              Upload Another Prescription
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
