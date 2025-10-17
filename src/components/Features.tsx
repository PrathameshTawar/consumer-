import { Card } from "@/components/ui/card";
import { MessageSquare, Youtube, BarChart3, Workflow, Search, Calendar } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Multi-Channel Messaging",
    description: "Connect seamlessly to Telegram, WhatsApp, and other messaging platforms with intelligent routing.",
  },
  {
    icon: Youtube,
    title: "YouTube Summarization",
    description: "Paste any YouTube link to get instant transcripts with multi-length summaries and key highlights.",
  },
  {
    icon: Workflow,
    title: "Smart Tool Router",
    description: "Automatically route user intents to specialized tools like search, calendar, and web browsing.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Telemetry",
    description: "Track usage, latencies, API costs, and user engagement with comprehensive analytics.",
  },
  {
    icon: Search,
    title: "Semantic Memory",
    description: "Vector-based memory system for personalization and long-form context understanding.",
  },
  {
    icon: Calendar,
    title: "Task Automation",
    description: "Automate workflows and integrate with your favorite productivity tools effortlessly.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Powerful Features
            <br />
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Built for Scale
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to build intelligent, multi-channel AI assistants
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:shadow-glow transition-all group-hover:scale-110">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
