interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend: "up" | "down" | "neutral";
  icon?: string;
}

export default function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  const trendColors = {
    up: "text-red-600",
    down: "text-green-600",
    neutral: "text-gray-600"
  };

  const trendBg = {
    up: "bg-red-50 border-red-200",
    down: "bg-green-50 border-green-200",
    neutral: "bg-white border-gray-200"
  };

  return (
    <div className={`${trendBg[trend]} rounded-xl shadow-md p-6 border-2 hover:shadow-xl transition-all transform hover:scale-105 animate-slide-up`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
      <p className={`text-sm font-medium ${trendColors[trend]}`}>{subtitle}</p>
    </div>
  );
}