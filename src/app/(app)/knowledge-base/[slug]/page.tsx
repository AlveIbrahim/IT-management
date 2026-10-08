"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Eye, LifeBuoy, Pencil, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { NewTicketDialog } from "@/components/new-ticket-dialog";
import { EmptyState } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { useAppStore, useCurrentUser } from "@/lib/store";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const user = useCurrentUser()!;
  const content = useAppStore((s) => s.content);
  const users = useAppStore((s) => s.users);
  const recordView = useAppStore((s) => s.recordView);
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const counted = useRef<string | null>(null);

  const isClient = user.role === "client";
  const article = content.find((c) => c.type === "article" && c.slug === slug && (c.status === "published" || !isClient));

  useEffect(() => {
    if (article && counted.current !== article.id) {
      counted.current = article.id;
      recordView(article.id);
    }
  }, [article, recordView]);

  if (!article) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Article not found"
        action={
          <Button asChild variant="outline">
            <Link href="/knowledge-base">Back to help centre</Link>
          </Button>
        }
      />
    );
  }

  const author = users.find((u) => u.id === article.authorId);
  const related = content
    .filter((c) => c.type === "article" && c.status === "published" && c.id !== article.id && c.category === article.category)
    .concat(content.filter((c) => c.type === "article" && c.status === "published" && c.id !== article.id && c.category !== article.category))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <Link href="/knowledge-base" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft className="size-4" />
        Help centre
      </Link>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{article.category}</Badge>
              {article.status !== "published" && <Badge variant="outline">Draft – only staff can see this</Badge>}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{article.title}</h1>
            <p className="text-muted-foreground text-lg">{article.excerpt}</p>
            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
              {author && (
                <span className="flex items-center gap-2">
                  <UserAvatar name={author.name} size="sm" />
                  {author.name}
                </span>
              )}
              <span>Updated {formatDate(article.updatedAt)}</span>
              <span className="flex items-center gap-1">
                <Eye className="size-4" />
                {article.views.toLocaleString("en-GB")} views
              </span>
              {!isClient && (
                <Button asChild variant="outline" size="sm" className="ml-auto">
                  <Link href={`/cms/${article.id}`}>
                    <Pencil />
                    Edit article
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <Card>
            <CardContent className="py-2">
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: article.body }} />
            </CardContent>
          </Card>
          <div className="flex flex-col items-center gap-3 rounded-xl border p-6 text-center">
            <div className="font-medium">{voted ? "Thanks for your feedback!" : "Was this article helpful?"}</div>
            {!voted && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setVoted("yes");
                    toast.success("Glad it helped!");
                  }}
                >
                  <ThumbsUp />
                  Yes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setVoted("no");
                    setTicketOpen(true);
                  }}
                >
                  <ThumbsDown />
                  No, I still need help
                </Button>
              </div>
            )}
            <p className="text-muted-foreground text-xs">{article.helpful}% of readers found this helpful</p>
          </div>
        </article>

        <aside className="space-y-4">
          <Card className="border-primary/30 bg-primary/5 gap-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LifeBuoy className="text-primary size-5" />
                Still stuck?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">Our engineers are happy to help. Raise a ticket and we&apos;ll get straight back to you.</p>
              <Button className="w-full" onClick={() => setTicketOpen(true)}>
                Raise a ticket
              </Button>
            </CardContent>
          </Card>
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base">Related articles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {related.map((r) => (
                <Link key={r.id} href={`/knowledge-base/${r.slug}`} className="hover:bg-muted/50 -mx-2 flex items-start gap-2 rounded-md px-2 py-2 text-sm">
                  <BookOpen className="text-primary mt-0.5 size-4 shrink-0" />
                  {r.title}
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
      <NewTicketDialog open={ticketOpen} onOpenChange={setTicketOpen} />
    </div>
  );
}
