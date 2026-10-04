import React from "react";
import { codeLines, Step } from "./trace";

// Syntax token colors for clean code presentation
const colorForToken = (tok: string): string => {
  if (/^(for|in|if|def|return)$/.test(tok)) return "#c678dd"; // purple keyword
  if (/^(range|len|print)$/.test(tok)) return "#61afef"; // blue built-in
  if (/^(arr)$/.test(tok)) return "#e5c07b"; // gold identifier
  if (/^[ij]$/.test(tok)) return "#98c379"; // green loop variable
  if (/^\d+$/.test(tok)) return "#d19a66"; // orange number
  if (/^[><=!+\-*]+$/.test(tok)) return "#56b6c2"; // cyan operator
  return "#abb2bf"; // light grey punctuation/default
};

export const CodePanel: React.FC<{
  step: Step;
}> = ({ step }) => {
  const activeLine = step.line;

  return (
    <div
      style={{
        position: "absolute",
        left: 24,
        right: 24,
        top: 820,
        background: "#181a24",
        borderRadius: 18,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45)",
        overflow: "hidden",
        fontFamily: 'Consolas, "Fira Code", Monaco, monospace',
      }}
    >
      {/* 1. Editor Window Title Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "#11121a",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: "#f59e0b",
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: "#10b981",
            }}
          />
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#94a3b8",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: "#38bdf8" }}>🐍</span> bubble_sort.py
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Python 3.12
        </div>
      </div>

      {/* 2. Code Listing with Line Highlight and Arrow */}
      <div style={{ padding: "14px 0 10px 0", fontSize: 20, lineHeight: "34px" }}>
        {codeLines.map((text, i) => {
          const lineNumber = i + 1;
          const isActive = lineNumber === activeLine;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                whiteSpace: "pre",
                background: isActive ? "rgba(254, 240, 138, 0.12)" : "transparent",
                borderLeft: isActive
                  ? "4px solid #facc15"
                  : "4px solid transparent",
                paddingLeft: 12,
                paddingRight: 16,
                transition: "background 0.15s ease",
              }}
            >
              {/* Arrow Indicator → */}
              <span
                style={{
                  width: 26,
                  color: isActive ? "#facc15" : "transparent",
                  fontWeight: "bold",
                  fontSize: 22,
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                →
              </span>

              {/* Line Number */}
              <span
                style={{
                  width: 24,
                  color: isActive ? "#fef08a" : "#475569",
                  fontSize: 15,
                  userSelect: "none",
                  marginRight: 10,
                  textAlign: "right",
                }}
              >
                {lineNumber}
              </span>

              {/* Code Tokens with Syntax Highlighting */}
              <div style={{ flex: 1 }}>
                {text.split(/(\b[A-Za-z_]+\b|\d+|[><=!+\-*]+|[()[\]:,])/).map((tok, k) => (
                  <span
                    key={k}
                    style={{
                      color: colorForToken(tok),
                      fontWeight:
                        /^(for|in|if)$/.test(tok) || isActive
                          ? 600
                          : 400,
                    }}
                  >
                    {tok}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Live Execution Ticker / Educational Status Bar */}
      <div
        style={{
          padding: "10px 18px",
          background: "#0f1118",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ color: "#94a3b8" }}>
              Pass <strong style={{ color: "#e2e8f0" }}>i = {step.i}</strong>
            </span>
            <span style={{ color: "#94a3b8" }}>
              Index <strong style={{ color: "#e2e8f0" }}>j = {step.j}</strong>
            </span>
          </div>

          {step.comparisonResult !== undefined && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: step.comparisonResult ? "#fb923c" : "#38bdf8",
              }}
            >
              {step.leftVal} &gt; {step.rightVal} →{" "}
              {step.comparisonResult ? "TRUE (SWAP)" : "FALSE (KEEP)"}
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 13,
            color:
              step.action === "swap"
                ? "#fb923c"
                : step.action === "element_sorted" || step.action === "sorted"
                  ? "#4ade80"
                  : "#cbd5e1",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {step.description}
        </div>
      </div>
    </div>
  );
};
