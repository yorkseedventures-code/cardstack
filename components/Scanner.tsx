"use client";

import { useRef, useState, useCallback, useEffect } from "react";
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

  useEffect(() => {
    if (mode === "camera" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [mode]);

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
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong, try again");
        setMode("idle");
        return;
      }
      onExtracted(data, dataUrl);
    } catch {
      setError("Something went wrong, try again");
    } finally { setMode("idle"); }
  }, [onExtracted]);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) processImage(e.target.result as string); };
    reader.readAsDataURL(file);
  }, [processImage]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setMode("camera");
    } catch { setError("Camera not available, use upload instead"); }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 1280;
    c.height = v.videoHeight || 720;
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

  if (mode === "camera") return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"#000" }}>
      <video ref={videoRef} style={{ width:"100%",height:"100%",objectFit:"cover" }} autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
        <div style={{ position:"relative",width:"80%",height:"45%" }}>
          <div style={{ position:"absolute",inset:0,border:"1.5px solid rgba(255,255,255,0.2)",borderRadius:16 }} />
          <div style={{ position:"absolute",top:0,left:0,width:28,height:28,borderTop:"2px solid #DC2626",borderLeft:"2px solid #DC2626",borderRadius:"12px 0 0 0" }} />
          <div style={{ position:"absolute",top:0,right:0,width:28,height:28,borderTop:"2px solid #DC2626",borderRight:"2px solid #DC2626",borderRadius:"0 12px 0 0" }} />
          <div style={{ position:"absolute",bottom:0,left:0,width:28,height:28,borderBottom:"2px solid #DC2626",borderLeft:"2px solid #DC2626",borderRadius:"0 0 0 12px" }} />
          <div style={{ position:"absolute",bottom:0,right:0,width:28,height:28,borderBottom:"2px solid #DC2626",borderRight:"2px solid #DC2626",borderRadius:"0 0 12px 0" }} />
        </div>
      </div>
      <p style={{ position:"absolute",top:"18%",left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:13 }}>Position card inside the frame</p>
      <div style={{ position:"absolute",bottom:0,left:0,right:0,paddingBottom:48,paddingTop:24,display:"flex",justifyContent:"center",alignItems:"center",gap:48,background:"linear-gradient(transparent,rgba(0,0,0,0.6))" }}>
        <button onClick={stopCamera} style={{ width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        <button onClick={capturePhoto} style={{ width:72,height:72,borderRadius:"50%",background:"#DC2626",border:"4px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.2)" }} />
        </button>
        <div style={{ width:48 }} />
      </div>
    </div>
  );

  if (mode === "processing") return (
    <div className="w-full aspect-[4/3] bg-white rounded-2xl flex flex-col items-center justify-center gap-4 border border-[#e8e6e2]">
      <div className="relative w-16 h-16">
        <div className="pulse-ring absolute inset-0 rounded-full border-2 border-brand" />
        <div className="w-16 h-16 rounded-full border-2 border-brand/30 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-brand/10 animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-[#aaa]">Reading card...</p>
    </div>
  );

  return (
    <div
      className={"w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-5 transition-all cursor-pointer " + (drag ? "border-brand bg-[#fff1f1]" : "border-[#ddd] bg-white")}
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
        <button className="px-4 py-2 rounded-xl bg-white border border-[#ddd] text-[#888] text-xs font-medium" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Upload photo</button>
        <button className="px-4 py-2 rounded-xl bg-[#fff1f1] border border-red-200 text-red-500 text-xs font-medium" onClick={(e) => { e.stopPropagation(); startCamera(); }}>Use camera</button>
      </div>
      {error && <p className="text-red-500 text-xs text-center px-4">{error}</p>}
    </div>
  );
}
