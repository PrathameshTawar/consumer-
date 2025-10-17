import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Zap } from "lucide-react";
import heroBackground from "@/assets/hero-background.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero z-0" />
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 animate-float">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">AI-Powered Multi-Channel Assistant</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Your AI Assistant
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Across All Channels
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect to Telegram, WhatsApp, and more. Get instant summaries, intelligent routing, 
            and powerful tool integration—all in one seamless experience.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" className="group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl">
              <MessageSquare className="w-5 h-5" />
              Try YouTube Summarizer
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">10+</div>
              <div className="text-sm text-muted-foreground">Tool Integrations</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">Real-time</div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">Multi-channel</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};
