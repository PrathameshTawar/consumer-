import { MessageSquare, Github, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">AI Assistant Platform</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Documentation
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              API Reference
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 AI Assistant Platform. Built with cutting-edge technology.</p>
        </div>
      </div>
    </footer>
  );
};
