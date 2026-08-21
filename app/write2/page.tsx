"use client";

import { useEffect, useRef, useState } from 'react'
import React, { useCallback } from "react";

const COLORS = ["#1c1a17", "#b5432c", "#2c5f7c", "#3d6b3d"];
const PAPER_BG = "#fffdf8";

type Status = "idle" | "loading" | "error" | "done";

export default function HandwritingToText() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const drawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const hasContentRef = useRef(false);

  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [status, setStatus] = useState<Status>("idle");
  const [resultText, setResultText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = PAPER_BG;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    historyRef.current = [];
    hasContentRef.current = false;
  }, []);

  useEffect(() => {
    setupCanvas();
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e && e.touches.length) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const me = e as React.MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  };

  const saveSnapshot = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    try {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(snap);
      if (historyRef.current.length > 30) historyRef.current.shift();
    } catch {
      // ignore
    }
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    saveSnapshot();
    drawingRef.current = true;
    hasContentRef.current = true;
    const pos = getPos(e);
    lastPosRef.current = pos;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const pos = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  const handleUndo = () => {
    const ctx = ctxRef.current;
    if (!ctx || !historyRef.current.length) return;
    const snap = historyRef.current.pop()!;
    ctx.putImageData(snap, 0, 0);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    saveSnapshot();
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = PAPER_BG;
    ctx.fillRect(0, 0, rect.width, rect.height);
    hasContentRef.current = false;
    setStatus("idle");
    setResultText("");
    setErrorMsg("");
  };

  const handleRecognize = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasContentRef.current) {
      setStatus("error");
      setErrorMsg("먼저 종이에 무언가 써주세요.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/png",
                    data: base64,
                  },
                },
                {
                  type: "text",
                  text: "이 이미지는 손글씨가 쓰인 종이입니다. 손글씨 내용을 정확하게 그대로 텍스트로 옮겨 적어주세요. 다른 설명이나 코멘트 없이 인식된 텍스트만 출력하세요. 만약 아무 글씨도 없다면 빈 문자열만 출력하세요.",
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패 (" + response.status + ")");
      }

      const data = await response.json();
      const textBlock = (data.content || []).find(
        (b: { type: string }) => b.type === "text"
      );
      const recognized = textBlock ? (textBlock as { text: string }).text : "";
      setResultText(recognized.trim());
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        "인식 중 오류가 발생했어요: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard
      .writeText(resultText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => {});
  };

  return (
    <div
      style={{
        fontFamily: "Georgia, 'Noto Serif KR', serif",
        background: "#f6f1e7",
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 27px, #ddd3bd 28px)",
        color: "#1c1a17",
        minHeight: "100%",
        padding: "28px 20px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <div
          style={{
            letterSpacing: "0.32em",
            fontSize: 11,
            color: "#b5432c",
            textTransform: "uppercase",
            marginBottom: 6,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          Handwriting → Text
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
          손글씨 인식장
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#4a4640",
            marginTop: 6,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          아래 종이에 손으로 쓰고, 도장을 눌러 텍스트로 바꿔보세요
        </p>
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: 640 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            background: PAPER_BG,
            border: "1px solid #ddd3bd",
            borderRadius: 3,
            boxShadow:
              "0 1px 0 rgba(28,26,23,0.04), 0 8px 24px -12px rgba(28,26,23,0.25)",
            touchAction: "none",
            cursor: "crosshair",
            display: "block",
          }}
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
        />
        <div
          style={{
            position: "absolute",
            top: -14,
            right: -10,
            width: 46,
            height: 46,
            border: "2px solid #b5432c",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b5432c",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.05em",
            transform: "rotate(6deg)",
            background: "rgba(246,241,231,0.9)",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            textAlign: "center",
            lineHeight: 1.2,
            pointerEvents: "none",
          }}
        >
          認識
          <br />중
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 640,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: c,
                  cursor: "pointer",
                  border:
                    color === c ? "2px solid #a98544" : "2px solid transparent",
                  boxShadow: color === c ? "0 0 0 2px #f6f1e7" : "none",
                }}
              />
            ))}
          </div>
          <input
            type="range"
            min={2}
            max={14}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value, 10))}
            style={{ width: 90, accentColor: "#b5432c" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleUndo}
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              border: "1px solid #ddd3bd",
              background: "transparent",
              color: "#4a4640",
              cursor: "pointer",
              fontSize: 13,
              borderRadius: 3,
              padding: "9px 16px",
            }}
          >
            되돌리기
          </button>
          <button
            onClick={handleClear}
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              border: "1px solid #ddd3bd",
              background: "transparent",
              color: "#4a4640",
              cursor: "pointer",
              fontSize: 13,
              borderRadius: 3,
              padding: "9px 16px",
            }}
          >
            전체 지우기
          </button>
          <button
            onClick={handleRecognize}
            disabled={status === "loading"}
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              border: "none",
              background: "#b5432c",
              color: "#fff8f0",
              fontWeight: 600,
              cursor: status === "loading" ? "default" : "pointer",
              fontSize: 13,
              borderRadius: 3,
              padding: "9px 16px",
              opacity: status === "loading" ? 0.5 : 1,
              boxShadow:
                status === "loading"
                  ? "none"
                  : "0 4px 12px -4px rgba(181,67,44,0.6)",
            }}
          >
            ✒ 텍스트로 인식하기
          </button>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 640, minHeight: 20 }}>
        {status === "loading" && (
          <div
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 13,
              color: "#4a4640",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                border: "2px solid #ddd3bd",
                borderTopColor: "#b5432c",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }}
            />
            손글씨를 읽는 중...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {status === "error" && (
          <div
            style={{
              color: "#b5432c",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 13,
            }}
          >
            {errorMsg}
          </div>
        )}

        {status === "done" && (
          <div
            style={{
              background: PAPER_BG,
              border: "1px solid #ddd3bd",
              borderLeft: "4px solid #b5432c",
              borderRadius: 2,
              padding: "16px 18px",
              fontSize: 15,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 10,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#b5432c",
                marginBottom: 8,
                display: "block",
              }}
            >
              인식 결과
            </span>
            <button
              onClick={handleCopy}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "transparent",
                border: "none",
                color: "#4a4640",
                fontSize: 11,
                padding: "4px 8px",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                cursor: "pointer",
              }}
            >
              {copied ? "복사됨 ✓" : "복사"}
            </button>
            <div>
              {resultText ||
                "(인식된 텍스트가 없어요. 좀 더 또렷하게 써보세요.)"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
