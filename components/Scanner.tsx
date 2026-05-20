"use client";

import { useRef, useState, useCallback } from "react";
import { ExtractedCard } from "@/lib/types";

interface ScannerProps {
  onExtracted: (data: ExtractedCard, imageDataUrl: string) => void;
}

export default function Scanner({ onExtracted }: ScannerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<"idle" | "camera" | "processing">("idle");
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");

  const processImage = useCallback(async (dataUrl: string) => {
    setMode("processing");
    setError("");
    try {
      const base64 = dataUrl.split(",")[1];
      const mediaType = dataUrl.split(";")[0].split(":")[1];
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType }),
      });
      if (!res.ok) throw new Error("Extraction failed");
      const data = await res.json();
      onExtracted(data, dataUrl);
    } catch {
      setError("Could not extract — fill in manually");
      onExtracted({ first_name: "", last_name: "", title: "", company: "", email: "", phone: "", website: "", linkedin: "" }, dataUrl);
    } finally {
      setMode("idle");
    }
  }, [onExtracted]);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) processImage(e.target.result as string); };
    reader.readAsDataURL(file);
  }, [processImage]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.setAttribute("autoplay", ""); videoRef.current.setAttribute("playsinline", ""); videoRef.current.setAttribute("muted", ""); await videoRef.current.play(); }
      setMode("camera");
    } catch {
      setError("Camera not available — use upload instead");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    processImage(dataUrl);
  }, [processImage]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode("idle");
  }, []);

  if (mode === "camera") {
    return (
      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[85%] h-[55%]">
            <div className="absolute inset-0 border-2 border-white/30 rounded-xl" />
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand rounded-br-xl" />
            <div className="scan-line absolute left-2 right-2 h-px bg-brand/70 top-0" />
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
          <button onClick={stopCamera} className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl">✕</button>
          <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-brand border-4 border-white/30 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === "processing") {
    return (
      <div className="w-full aspect-[4/3] bg-white rounded-2xl flex flex-col items-center justify-center gap-4 border border-[#e8e6e2]">
        <div className="relative w-16 h-16">
          <div className="pulse-ring absolute inset-0 rounded-full border-2 border-brand" />
          <div className="w-16 h-16 rounded-full border-2 border-brand/30 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-brand/10 animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-[#aaa] font-display italic">Reading card...</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-5 transition-all cursor-pointer ${
        drag ? "border-brand bg-[#fff1f1]" : "border-[#ddd] bg-white"
      }`}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
    >
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      <div className="w-14 h-14 rounded-2xl bg-[#f5f4f2] border border-[#e8e6e2] flex items-center justify-center text-2xl">🪪</div>
      <div className="text-center">
        <p className="text-[#555] text-sm font-medium mb-1">Drop a business card photo</p>
        <p className="text-[#bbb] text-xs">or tap to browse</p>
      </div>
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-xl bg-white border border-[#ddd] text-[#888] text-xs font-medium hover:border-[#bbb] transition-colors" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
          Upload photo
        </button>
        <button className="px-4 py-2 rounded-xl bg-[#fff1f1] border border-brand/20 text-brand text-xs font-medium hover:bg-[#ffe4e4] transition-colors" onClick={(e) => { e.stopPropagation(); startCamera(); }}>
          Use camera
        </button>
      </div>
      {error && <p className="text-red-500 text-xs text-center px-4">{error}</p>}
    </div>
  );
}
