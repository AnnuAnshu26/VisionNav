// components/ObjectDetection.js
import React, { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs"; // must be imported before coco-ssd

// Required libraries:
// npm i @tensorflow/tfjs @tensorflow-models/coco-ssd

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Idle");

  // For throttled + limited voice alerts
  const lastSpokenRef = useRef({});
  const speakCountsRef = useRef({});
  const SPEAK_INTERVAL = 5000; // ms between repeating same object
  const MAX_SPEAKS = 3;        // max announcements per object

  // Simple speech function
  const speak = (text) => {
    console.log("🔊", text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let stream = null;
    let isMounted = true;
    let model = null;
    let raf = 0;

    const setup = async () => {
      try {
        setStatus("Loading model…");
        const [{ load }] = await Promise.all([
          import("@tensorflow-models/coco-ssd"),
        ]);
        model = await load({ base: "lite_mobilenet_v2" });

        if (!isMounted) return;

        setStatus("Starting camera…");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setStatus("Detecting…");
        detect();
      } catch (e) {
        console.error("❌ Setup error:", e);
        setStatus("Camera or model error");
      }
    };

    const draw = (preds) => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.font = "14px sans-serif";

      preds.forEach((p) => {
        const [x, y, w, h] = p.bbox;
        ctx.strokeStyle = "#00ff88";
        ctx.fillStyle = "rgba(0,255,136,0.2)";
        ctx.strokeRect(x, y, w, h);
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#00ff88";
        ctx.fillText(
          `${p.class} (${(p.score * 100).toFixed(0)}%)`,
          x + 4,
          y > 12 ? y - 4 : y + 14
        );
      });
    };

    const detect = async () => {
      if (!isMounted || !model || !videoRef.current) return;
      const predictions = await model.detect(videoRef.current);

      // Draw to canvas
      draw(predictions);

      // Speak detected objects (throttled + limited)
      predictions.forEach((p) => {
        if (p.score > 0.6) {
          const now = Date.now();
          const last = lastSpokenRef.current[p.class] || 0;
          const count = speakCountsRef.current[p.class] || 0;

          if (count < MAX_SPEAKS && now - last > SPEAK_INTERVAL) {
            speak(`Detected ${p.class}`);
            lastSpokenRef.current[p.class] = now;
            speakCountsRef.current[p.class] = count + 1;
          }
        }
      });

      raf = requestAnimationFrame(detect);
    };

    setup();

    // Cleanup
    return () => {
      isMounted = false;
      if (raf) cancelAnimationFrame(raf);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Hidden video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "none",
          background: "#000",
        }}
      />
      {/* Visible canvas with detections */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "#000",
        }}
      />
      {/* Status overlay */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        {status}
      </div>
    </div>
  );
};

export default ObjectDetection;
