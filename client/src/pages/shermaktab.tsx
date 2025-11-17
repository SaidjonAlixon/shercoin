import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Article {
  id: number;
  title: string;
  content: string;
  reward: number;
  isCompleted: boolean;
}

interface SherMaktabProps {
  articles: Article[];
  onArticleComplete: (articleId: number) => void;
}

export function SherMaktab({ articles, onArticleComplete }: SherMaktabProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (bottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleComplete = () => {
    if (selectedArticle && hasScrolledToBottom) {
      onArticleComplete(selectedArticle.id);
      setSelectedArticle(null);
      setHasScrolledToBottom(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">SherMaktab</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Maqolalarni o'qib, bilim va SherCoin yig'ing
        </p>

        <div className="space-y-3">
          {articles.map((article) => (
            <Card
              key={article.id}
              className={`p-4 ${!article.isCompleted ? "cursor-pointer hover-elevate active-elevate-2" : ""}`}
              onClick={() => !article.isCompleted && setSelectedArticle(article)}
              data-testid={`card-article-${article.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {article.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm mb-1">{article.title}</h3>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gold font-bold">
                      +{formatNumber(article.reward)} SherCoin
                    </span>
                    {article.isCompleted && (
                      <Badge variant="secondary" className="text-xs">
                        O'qilgan
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {articles.length === 0 && (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Maqolalar topilmadi</p>
            </Card>
          )}
        </div>
      </div>

      <Dialog
        open={!!selectedArticle}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedArticle(null);
            setHasScrolledToBottom(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh]" data-testid="modal-article">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-4" onScrollCapture={handleScroll}>
            <div
              className="prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: selectedArticle?.content || "",
              }}
            />
          </ScrollArea>
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm font-bold text-gold">
              Mukofot: +{formatNumber(selectedArticle?.reward || 0)} SherCoin
            </span>
            <Button
              onClick={handleComplete}
              disabled={!hasScrolledToBottom}
              data-testid="button-complete-article"
            >
              {hasScrolledToBottom ? "Tugatish" : "Oxirigacha o'qing"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
