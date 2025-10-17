import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Activity, Users, Zap, TrendingUp } from "lucide-react";

interface TelemetryData {
  activeUsers: number;
  requestsPerMinute: number;
  avgLatency: number;
  successRate: number;
}

const defaultMetrics = [
  {
    icon: Users,
    label: "Active Users",
    key: "activeUsers",
  },
  {
    icon: Activity,
    label: "Requests/min",
    key: "requestsPerMinute",
  },
  {
    icon: Zap,
    label: "Avg Latency",
    key: "avgLatency",
    format: (value: number) => `${value}ms`,
  },
  {
    icon: TrendingUp,
    label: "Success Rate",
    key: "successRate",
    format: (value: number) => `${value.toFixed(1)}%`,
  },
];

export const TelemetryPreview = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchTelemetry();

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('Connected to telemetry WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'telemetry') {
          setTelemetry(data.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from telemetry WebSocket');
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  const fetchTelemetry = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/telemetry');
      if (response.ok) {
        const data = await response.json();
        setTelemetry(data);
      }
    } catch (error) {
      console.error('Error fetching telemetry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (metric: any, value: number) => {
    if (metric.format) {
      return metric.format(value);
    }
    return value.toLocaleString();
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { change: "0%", trend: "neutral" };
    const change = ((current - previous) / previous) * 100;
    return {
      change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      trend: change >= 0 ? "up" : "down"
    };
  };

  return (
    <section className="py-24 relative bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Real-Time
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Performance Insights
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Monitor your assistant's performance with comprehensive telemetry
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultMetrics.map((metric, index) => {
              const value = telemetry ? (telemetry as any)[metric.key] : 0;
              const change = calculateChange(value, value * 0.95); // Mock previous value

              return (
                <Card
                  key={index}
                  className="p-6 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <metric.icon className="w-8 h-8 text-primary" />
                      {!isLoading && (
                        <span className={`text-sm font-medium ${
                          change.trend === "up" ? "text-accent" : change.trend === "down" ? "text-red-400" : "text-muted-foreground"
                        }`}>
                          {change.change}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-1">
                        {isLoading ? (
                          <div className="h-8 bg-primary/20 rounded animate-pulse"></div>
                        ) : (
                          formatValue(metric, value)
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Live Activity Graph Placeholder */}
          <Card className="mt-8 p-8 bg-card/30 backdrop-blur-sm border-primary/10">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Live Activity</h3>
              <div className="h-48 bg-gradient-to-t from-primary/10 to-transparent rounded-lg flex items-end justify-around p-4 gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((height, i) => (
                  <div 
                    key={i}
                    className="flex-1 bg-gradient-primary rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
