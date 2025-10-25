interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend: "up" | "down" | "neutral";
}

export default function StatCard({ title, value, subtitle, trend }: StatCardProps) {
  const trendColors = {
    up: "text-red-600",
    down: "text-green-600",
    neutral: "text-gray-600"
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-sm ${trendColors[trend]}`}>{subtitle}</p>
    </div>
  );
}