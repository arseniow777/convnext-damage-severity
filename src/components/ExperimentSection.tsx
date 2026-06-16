import { useState, useCallback } from "react";
import { predictDamage } from "@/lib/api";

const LABEL_MAP: Record<string, string> = {
  severe_damage: "SEVERE",
  mild_damage: "MILD",
  little_or_no_damage: "LITTLE / NO DAMAGE",
};

const LABEL_COLOR: Record<string, string> = {
  severe_damage: "text-red-500",
  mild_damage: "text-yellow-500",
  little_or_no_damage: "text-green-500",
};

interface PredictResult {
  label: string;
  confidence: number;
  probabilities: {
    severe_damage: number;
    mild_damage: number;
    little_or_no_damage: number;
  };
}

export default function ExperimentSection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onExecute = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await predictDamage(file);
      setResult(res);
    } catch {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="experiment" className="min-h-screen bg-background px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-black tracking-widest text-foreground uppercase">
            Experiment
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Upload gambar untuk memprediksi tingkat kerusakan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-foreground uppercase mb-1">
                Upload File
              </h3>
              <p className="text-xs text-muted-foreground">
                Kirim file dalam bentuk .jpg / .png
              </p>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 min-h-[220px] flex flex-col items-center justify-center gap-3
                ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-muted/30"
                }`}
            >
              <div className="grid grid-cols-6 gap-1 absolute inset-0 opacity-10 pointer-events-none p-4">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-border rounded-sm" />
                ))}
              </div>

              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <p className="text-sm font-medium text-foreground relative z-10">
                Upload file
              </p>
              <p className="text-xs text-muted-foreground relative z-10">
                Drag or drop your files here or click to upload
              </p>

              {file && (
                <div className="relative z-10 w-full mt-4 flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                      {file.name}
                    </p>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                      {file.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-muted-foreground">
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {file && (
              <div className="flex justify-center">
                <button
                  onClick={onExecute}
                  disabled={loading}
                  className="relative px-10 py-3 font-bold text-sm tracking-widest uppercase rounded-xl overflow-hidden transition-all duration-300
                    bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-lg hover:shadow-primary/30"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    "Execute"
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-foreground uppercase mb-1">
                Hasil Eksperimen
              </h3>
              <p className="text-xs text-muted-foreground">
                Pantau tingkat damage severity pada model
              </p>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-muted/20 min-h-[220px] flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-[280px] object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 p-12 text-center">
                  <svg
                    className="w-12 h-12 text-muted-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Tidak ada file yang di upload
                  </p>
                </div>
              )}
            </div>

            {result && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                  <div className="p-5">
                    <p className="text-xs tracking-widest text-muted-foreground uppercase mb-2">
                      Severity
                    </p>
                    <p
                      className={`text-2xl font-black ${LABEL_COLOR[result.label]}`}
                    >
                      {LABEL_MAP[result.label]}
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs tracking-widest text-muted-foreground uppercase mb-2">
                      Confidence
                    </p>
                    <p className="text-2xl font-black text-foreground">
                      {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border">
                  {(
                    [
                      ["little_or_no_damage", "LITTLE / NO DAMAGE"],
                      ["mild_damage", "MILD"],
                      ["severe_damage", "SEVERE"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="p-4">
                      <p className="text-xs tracking-widest text-muted-foreground uppercase mb-2">
                        {label}
                      </p>
                      <p className={`text-xl font-black ${LABEL_COLOR[key]}`}>
                        {(result.probabilities[key] * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
