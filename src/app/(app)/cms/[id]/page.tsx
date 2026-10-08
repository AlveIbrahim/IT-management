"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Eye, FileText, Globe, PencilLine, Save, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/page-header";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CONTENT_STATUS_META, LEVEL_META, TYPE_META, publicHref } from "@/lib/cms";
import { KB_CATEGORIES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useAppStore, useCan } from "@/lib/store";
import type { AnnouncementLevel, ContentItem, ContentStatus } from "@/lib/types";
import { cn, slugify, stripHtml } from "@/lib/utils";

export default function ContentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const item = useAppStore((s) => s.content.find((c) => c.id === id));
  if (!item) {
    return (
      <EmptyState
        icon={FileText}
        title="Content not found"
        action={
          <Button asChild variant="outline">
            <Link href="/cms">Back to content</Link>
          </Button>
        }
      />
    );
  }
  return <Editor key={item.id} item={item} />;
}

function Editor({ item }: { item: ContentItem }) {
  const router = useRouter();
  const users = useAppStore((s) => s.users);
  const brandName = useAppStore((s) => s.settings.brandName);
  const saveContent = useAppStore((s) => s.saveContent);
  const deleteContent = useAppStore((s) => s.deleteContent);
  const canPublish = useCan("cms.publish");
  const [draft, setDraft] = useState<ContentItem>(item);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [slugTouched, setSlugTouched] = useState(!item.slug.startsWith("untitled-"));

  const dirty =
    draft.title !== item.title ||
    draft.body !== item.body ||
    draft.slug !== item.slug ||
    draft.excerpt !== item.excerpt ||
    draft.category !== item.category ||
    draft.level !== item.level ||
    draft.showInNav !== item.showInNav ||
    draft.seoTitle !== item.seoTitle ||
    draft.seoDescription !== item.seoDescription;

  const set = <K extends keyof ContentItem>(key: K, value: ContentItem[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const meta = TYPE_META[item.type];
  const author = users.find((u) => u.id === item.authorId);

  const save = (status: ContentStatus = draft.status) => {
    const excerpt = draft.excerpt || stripHtml(draft.body).slice(0, 140);
    const saved = saveContent({ ...draft, excerpt, status });
    setDraft(saved);
    if (status === "published" && item.status !== "published") toast.success(`“${saved.title}” is now live`);
    else if (status === "draft" && item.status === "published") toast.success("Unpublished – moved back to drafts");
    else toast.success("Changes saved");
  };

  const seoTitle = draft.seoTitle || `${draft.title} | ${brandName}`;
  const seoDesc = draft.seoDescription || draft.excerpt || stripHtml(draft.body).slice(0, 155);
  const url = item.type === "page" ? `desksupport.co.uk/${draft.slug === "home" ? "" : draft.slug}` : `desksupport.co.uk/help/${draft.slug}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/cms" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
            <ArrowLeft className="size-4" />
            Content
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{meta.label}</span>
          <Badge variant="outline" className={CONTENT_STATUS_META[item.status].className}>
            {CONTENT_STATUS_META[item.status].label}
          </Badge>
          {dirty && <span className="text-xs text-amber-700 dark:text-amber-300">Unsaved changes</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as "edit" | "preview")}>
            <ToggleGroupItem value="edit">
              <PencilLine />
              Edit
            </ToggleGroupItem>
            <ToggleGroupItem value="preview">
              <Eye />
              Preview
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" onClick={() => save()} disabled={!dirty}>
            <Save />
            {item.status === "published" ? "Save" : "Save draft"}
          </Button>
          {canPublish ? (
            item.status === "published" ? (
              <Button onClick={() => save("published")} disabled={!dirty}>
                <Globe />
                Update live
              </Button>
            ) : (
              <Button onClick={() => save("published")}>
                <Globe />
                Publish
              </Button>
            )
          ) : (
            <Button
              onClick={() => {
                save("draft");
                toast.info("Sent for review", { description: "An administrator will review and publish it." });
              }}
            >
              Submit for review
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {mode === "edit" ? (
            <>
              <input
                value={draft.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched && item.status !== "published") set("slug", slugify(e.target.value));
                }}
                placeholder="Title"
                className="placeholder:text-muted-foreground/50 w-full bg-transparent text-3xl font-semibold tracking-tight outline-none"
              />
              {item.type !== "announcement" && (
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <span>{item.type === "page" ? "desksupport.co.uk/" : "desksupport.co.uk/help/"}</span>
                  <input
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                    className="text-foreground focus:border-brand-ink min-w-0 flex-1 border-b border-dashed bg-transparent outline-none"
                  />
                </div>
              )}
              <RichTextEditor
                value={draft.body}
                onChange={(html) => set("body", html)}
                placeholder={item.type === "announcement" ? "Write the full announcement…" : "Start writing, or use the toolbar to add headings and lists…"}
              />
            </>
          ) : (
            <Card className="overflow-hidden py-0">
              <div className="bg-muted/50 flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="bg-background text-muted-foreground mx-auto rounded-md border px-3 py-1 text-xs">{url}</div>
              </div>
              <article className="mx-auto w-full max-w-3xl px-6 py-10">
                {item.type !== "page" && <h1 className="mb-6 text-3xl font-semibold tracking-tight">{draft.title}</h1>}
                <div className="prose-content" dangerouslySetInnerHTML={{ __html: draft.body }} />
              </article>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="text-sm">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={CONTENT_STATUS_META[item.status].className}>
                  {CONTENT_STATUS_META[item.status].label}
                </Badge>
              </div>
              {item.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span>{formatDateTime(item.publishedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last edited</span>
                <span>{formatDateTime(item.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author</span>
                <span>{author?.name}</span>
              </div>
              {item.status === "published" && (
                <div className="flex gap-2 pt-1">
                  {item.type !== "announcement" && (
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={publicHref(item)} target="_blank">
                        <ExternalLink />
                        View live
                      </Link>
                    </Button>
                  )}
                  {canPublish && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => save("draft")}>
                      <Undo2 />
                      Unpublish
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="text-sm">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.type === "article" && (
                <div className="grid gap-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select value={draft.category ?? ""} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {KB_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {item.type === "announcement" && (
                <div className="grid gap-1.5">
                  <Label className="text-xs">Banner type</Label>
                  <Select value={draft.level ?? "info"} onValueChange={(v) => set("level", v as AnnouncementLevel)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(LEVEL_META) as AnnouncementLevel[]).map((l) => (
                        <SelectItem key={l} value={l}>
                          {LEVEL_META[l].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className={cn("mt-2 rounded-md border px-3 py-2 text-xs", LEVEL_META[draft.level ?? "info"].className)}>
                    <span className="font-semibold">{draft.title || "Title"}.</span> {draft.excerpt || "Summary shown in the banner"}
                  </div>
                  <p className="text-muted-foreground text-xs">Published announcements appear at the top of the client portal.</p>
                </div>
              )}
              {item.type === "page" && (
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">Show in navigation</div>
                    <div className="text-muted-foreground text-xs">Adds this page to the website menu</div>
                  </div>
                  <Switch checked={draft.showInNav} onCheckedChange={(c) => set("showInNav", c)} />
                </label>
              )}
              <div className="grid gap-1.5">
                <Label className="text-xs">{item.type === "announcement" ? "Banner text" : "Summary"}</Label>
                <Textarea
                  value={draft.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  rows={3}
                  placeholder="A short description…"
                />
              </div>
            </CardContent>
          </Card>

          {item.type !== "announcement" && (
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="text-sm">Search engine (SEO)</CardTitle>
                <CardDescription className="text-xs">How this appears in Google results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/40 space-y-0.5 rounded-lg border p-3">
                  <div className="text-muted-foreground truncate text-xs">{url}</div>
                  <div className="truncate text-[15px] text-[#1a0dab] dark:text-[#8ab4f8]">{seoTitle}</div>
                  <div className="text-muted-foreground line-clamp-2 text-xs">{seoDesc}</div>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">SEO title</Label>
                  <Input value={draft.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={seoTitle} />
                </div>
                <div className="grid gap-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs">Meta description</Label>
                    <span className={cn("text-xs tabular-nums", draft.seoDescription.length > 160 ? "text-red-600" : "text-muted-foreground")}>
                      {draft.seoDescription.length}/160
                    </span>
                  </div>
                  <Textarea value={draft.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={3} placeholder={seoDesc} />
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive w-full"
            onClick={() => {
              deleteContent(item.id);
              toast.success(`“${item.title}” deleted`);
              router.push("/cms");
            }}
          >
            <Trash2 />
            Delete {meta.label.toLowerCase()}
          </Button>
        </div>
      </div>
    </div>
  );
}
