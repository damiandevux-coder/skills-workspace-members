"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Check, Sparkles } from "lucide-react";

interface DescriptionQualityProps {
  description: string;
}

interface QualityCheck {
  label: string;
  pass: boolean;
  message: string;
}

export function DescriptionQuality({ description }: DescriptionQualityProps) {
  const checks = useMemo<QualityCheck[]>(() => {
    const d = description.trim();
    return [
      {
        label: "Length",
        pass: d.length >= 30 && d.length <= 160,
        message: d.length < 30 ? "Too short — add more detail" : d.length > 160 ? "Too long — aim under 160 chars" : "Good length",
      },
      {
        label: "Specificity",
        pass: /(for|to|when|using|via|with)/i.test(d) && !/stuff|things|everything/i.test(d),
        message: "Include trigger words: 'for', 'when', 'using'",
      },
      {
        label: "Action words",
        pass: /(check|get|send|list|create|manage|search|handle)/i.test(d),
        message: "Add action verbs: check, get, send, list...",
      },
      {
        label: "Boundaries",
        pass: !/(everything|all|anything|whatever)/i.test(d),
        message: "Avoid vague words like 'everything'",
      },
    ];
  }, [description]);

  const score = checks.filter((c) => c.pass).length;
  const total = checks.length;
  const percentage = Math.round((score / total) * 100);

  if (!description.trim()) {
    return (
      <div className="rounded-lg border border-[#303036] bg-[#151519] px-3 py-2">
        <p className="text-[11px] text-[#85858e]">
          Write a description so the agent knows when to trigger this skill.
        </p>
      </div>
    );
  }

  const scoreColor = percentage >= 75 ? "text-[#4ade80]" : percentage >= 50 ? "text-[#f5c45e]" : "text-[#ff6b6b]";
  const scoreBg = percentage >= 75 ? "bg-[#4ade80]/10" : percentage >= 50 ? "bg-[#f5c45e]/10" : "bg-[#ff6b6b]/10";

  return (
    <div className="rounded-lg border border-[#303036] bg-[#151519] px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className={`h-3 w-3 ${scoreColor}`} />
          <span className="text-[11px] font-medium text-[#a7a7ad]">Description Quality</span>
        </div>
        <span className={`text-[11px] font-semibold ${scoreColor} ${scoreBg} px-1.5 py-0.5 rounded`}>
          {percentage}%
        </span>
      </div>

      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-start gap-1.5">
            {check.pass ? (
              <Check className="h-3 w-3 text-[#4ade80] mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-[#85858e] mt-0.5 shrink-0" />
            )}
            <span className={`text-[10px] ${check.pass ? "text-[#85858e]" : "text-[#85858e]"}`}>
              {check.pass ? check.label : check.message}
            </span>
          </div>
        ))}
      </div>

      {percentage >= 75 && (
        <p className="text-[10px] text-[#4ade80]">
          This description will help the agent trigger your skill accurately.
        </p>
      )}
    </div>
  );
}
