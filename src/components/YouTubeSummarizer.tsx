import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Youtube, Sparkles } from "lucide-react";
import { toast } from "sonner";
import youtubeIcon from "@/assets/youtube-icon.png";

interface SummaryResult {
  videoTitle: string;
  summary: string;
  length: string;
  transcript: string;
}

export const YouTubeSummarizer = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [summaryLength, setSummaryLength] = useState("medium");

  const handleSummarize = async () => {
    if (!url) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setIsLoading(true);
    setSummary(null);

    try {
      const response = await fetch("http://localhost:3001/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, length: summaryLength }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize video");
      }

      const result: SummaryResult = await response.json();
      setSummary(result);
      toast.success("Summary generated successfully!");
    } catch (error) {
      console.error("Summarization error:", error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex justify-center mb-6">
              <img 
                src={youtubeIcon} 
                alt="YouTube Summarizer" 
                className="w-24 h-24 animate-float"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              YouTube Video
              <br />
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Instant Summarization
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Paste any YouTube link to get transcripts, summaries, and key highlights
            </p>
          </div>

          {/* Input Section */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 bg-background/50 border-primary/20 focus:border-primary"
                    />
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSummarize}
                    disabled={isLoading}
                    className="h-12 px-8 bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Summarize
                      </>
                    )}
                  </Button>
                </div>

                {/* Summary Length Selector */}
                <div className="flex gap-2">
                  {["short", "medium", "long"].map((length) => (
                    <Button
                      key={length}
                      variant={summaryLength === length ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSummaryLength(length)}
                      className="capitalize"
                    >
                      {length}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Features List */}
              <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <Youtube className="w-5 h-5 text-accent" />
                  <span className="text-sm">Auto Transcription</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm">AI Summaries</span>
                </div>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-accent" />
                  <span className="text-sm">Key Highlights</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary Output */}
          {summary && (
            <Card className="mt-6 p-8 bg-card/30 backdrop-blur-sm border-primary/10">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{summary.videoTitle}</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{summary.summary}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Length: {summary.length}</span>
                  <span>Transcript length: {summary.transcript.length} characters</span>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && !summary && (
            <Card className="mt-6 p-8 bg-card/30 backdrop-blur-sm border-primary/10 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                <div className="h-4 bg-primary/20 rounded w-1/2"></div>
                <div className="h-4 bg-primary/20 rounded w-5/6"></div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};
