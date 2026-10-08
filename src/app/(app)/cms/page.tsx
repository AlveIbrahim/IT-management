"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Megaphone,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timeAgo } from "@/lib/format";
import { useAppStore, useCan } from "@/lib/store";
import { CONTENT_STATUS_META, LEVEL_META, TYPE_META, publicHref } from "@/lib/cms";
import type { ContentItem, ContentStatus, ContentType } from "@/lib/types";

export default function CmsPage() {
  const router = useRouter();
  const content = useAppStore((s) => s.content);
  const users = useAppStore((s) => s.users);
  const saveContent = useAppStore((s) => s.saveContent);
  const deleteContent = useAppStore((s) => s.deleteContent);
  const canPublish = useCan("cms.publish");
  const [type, setType] = useState<ContentType>("page");
  const [query, setQuery] = useState("");

  const items = content
    .filter((c) => c.type === type && c.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const create = () => {
    const item = saveContent({
      type,
      title: type === "page" ? "Untitled page" : type === "article" ? "Untitled article" : "New announcement",
      slug: `untitled-${Date.now().toString(36)}`,
      level: type === "announcement" ? "info" : null,
      category: type === "article" ? "Getting started" : null,
    });
    router.push(`/cms/${item.id}`);
  };

  const setStatus = (item: ContentItem, status: ContentStatus) => {
    saveContent({ ...item, status });
    toast.success(status === "published" ? `“${item.title}” is now live` : `“${item.title}” moved to drafts`);
  };

  const stat = (t: ContentType) => content.filter((c) => c.type === t);
  const kbViews = stat("article").reduce((s, c) => s + c.views, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Content"
        description="Edit your website, help articles and client announcements – no developer needed."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/site" target="_blank">
                <ExternalLink />
                View website
              </Link>
            </Button>
            <Button onClick={create}>
              <Plus />
              New {TYPE_META[type].label.toLowerCase()}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Published pages", value: stat("page").filter((c) => c.status === "published").length, icon: Globe },
          { label: "Help articles", value: stat("article").filter((c) => c.status === "published").length, icon: BookOpen },
          { label: "Help article views", value: kbViews.toLocaleString("en-GB"), icon: Eye },
          { label: "Live announcements", value: stat("announcement").filter((c) => c.status === "published").length, icon: Megaphone },
        ].map((s) => (
          <Card key={s.label} className="gap-2 py-5">
            <CardHeader className="px-5">
              <CardDescription className="flex items-center gap-2 font-medium">
                <s.icon className="text-primary size-4" />
                {s.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 text-2xl font-semibold tabular-nums">{s.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={type} onValueChange={(v) => setType(v as ContentType)}>
          <TabsList>
            {(Object.keys(TYPE_META) as ContentType[]).map((t) => {
              const Icon = TYPE_META[t].icon;
              return (
                <TabsTrigger key={t} value={t}>
                  <Icon />
                  {TYPE_META[t].plural}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search content…" className="pl-9" />
        </div>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="pl-4">Title</TableHead>
              {type === "article" && <TableHead>Category</TableHead>}
              {type === "announcement" && <TableHead>Type</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              {type !== "announcement" && <TableHead className="text-right">Views</TableHead>}
              <TableHead>Last edited</TableHead>
              <TableHead className="w-12 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const author = users.find((u) => u.id === item.authorId);
              return (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => router.push(`/cms/${item.id}`)}>
                  <TableCell className="max-w-[380px] pl-4">
                    <div className="truncate font-medium">{item.title}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {item.type === "page" ? `/${item.slug === "home" ? "" : item.slug}` : item.excerpt}
                    </div>
                  </TableCell>
                  {type === "article" && <TableCell className="text-sm">{item.category}</TableCell>}
                  {type === "announcement" && (
                    <TableCell>
                      {item.level && (
                        <Badge variant="outline" className={LEVEL_META[item.level].className}>
                          {LEVEL_META[item.level].label}
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline" className={CONTENT_STATUS_META[item.status].className}>
                      {CONTENT_STATUS_META[item.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {author && (
                      <div className="flex items-center gap-2 text-sm">
                        <UserAvatar name={author.name} size="sm" />
                        {author.name}
                      </div>
                    )}
                  </TableCell>
                  {type !== "announcement" && (
                    <TableCell className="text-right tabular-nums">{item.views.toLocaleString("en-GB")}</TableCell>
                  )}
                  <TableCell className="text-muted-foreground text-xs">{timeAgo(item.updatedAt)}</TableCell>
                  <TableCell className="pr-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => router.push(`/cms/${item.id}`)}>
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        {item.status === "published" && item.type !== "announcement" && (
                          <DropdownMenuItem onSelect={() => window.open(publicHref(item), "_blank")}>
                            <ExternalLink />
                            View live
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onSelect={() => {
                            const copy = saveContent({
                              ...item,
                              id: undefined,
                              title: `${item.title} (copy)`,
                              slug: `${item.slug}-copy`,
                              status: "draft",
                              views: 0,
                            });
                            toast.success("Duplicated as a draft");
                            router.push(`/cms/${copy.id}`);
                          }}
                        >
                          <Copy />
                          Duplicate
                        </DropdownMenuItem>
                        {canPublish &&
                          (item.status === "published" ? (
                            <DropdownMenuItem onSelect={() => setStatus(item, "draft")}>
                              <Undo2 />
                              Unpublish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => setStatus(item, "published")}>
                              <Globe />
                              Publish now
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => {
                            deleteContent(item.id);
                            toast.success(`“${item.title}” deleted`);
                          }}
                        >
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {items.length === 0 && (
          <EmptyState
            icon={TYPE_META[type].icon}
            title={`No ${TYPE_META[type].plural.toLowerCase()} yet`}
            description={TYPE_META[type].blurb}
            action={
              <Button size="sm" onClick={create}>
                <Plus />
                Create one
              </Button>
            }
          />
        )}
      </Card>
    </div>
  );
}
