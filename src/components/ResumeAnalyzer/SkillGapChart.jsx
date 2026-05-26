import React, { useMemo } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend } from "recharts";

const SkillGapChart = React.memo(function SkillGapChart({ skills }) {
  const data = useMemo(() => {
    if (!skills) return [];
    return skills.map((s) => ({
      subject: s.name,
      Current: s.current,
      Required: s.required,
    }));
  }, [skills]);

  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 8, fontSize: 13 }} />
          <Legend />
          <Radar name="Your Level" dataKey="Current"
            stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
          <Radar name="Required" dataKey="Required"
            stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default SkillGapChart;