import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient: string;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  gradient,
}: StatsCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trend.isPositive ? "bg-green-400 bg-opacity-30" : "bg-red-400 bg-opacity-30"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
        <div>
          <p className="text-3xl font-bold mb-1">{value}</p>
          <p className="text-sm opacity-90">{label}</p>
        </div>
      </div>
    </div>
  );
}

