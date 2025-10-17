import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { YouTubeSummarizer } from "@/components/YouTubeSummarizer";
import { TelemetryPreview } from "@/components/TelemetryPreview";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <YouTubeSummarizer />
      <TelemetryPreview />
      <Footer />
    </div>
  );
};

export default Index;
