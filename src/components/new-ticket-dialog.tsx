"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpen, Lightbulb } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CHANNEL_LABEL, PRIORITY_META, PRIORITY_ORDER } from "@/lib/constants";
import { ticketRef } from "@/lib/format";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { Channel, Priority } from "@/lib/types";

const clientPriorityHint: Record<Priority, string> = {
  urgent: "Urgent – the business can't work",
  high: "High – I can't work",
  medium: "Medium – it's slowing me down",
  low: "Low – a question or request",
};

export function NewTicketDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const user = useCurrentUser();
  const users = useAppStore((s) => s.users);
  const companies = useAppStore((s) => s.companies);
  const categories = useAppStore((s) => s.settings.categories);
  const content = useAppStore((s) => s.content);
  const createTicket = useAppStore((s) => s.createTicket);
  const router = useRouter();

  const isClient = user?.role === "client";
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [channel, setChannel] = useState<Channel>("phone");
  const [requesterId, setRequesterId] = useState("");

  const suggestions = useMemo(() => {
    const words = subject
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    if (!words.length) return [];
    return content
      .filter((c) => c.type === "article" && c.status === "published")
      .map((a) => ({ a, score: words.filter((w) => `${a.title} ${a.excerpt}`.toLowerCase().includes(w)).length }))
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, 2)
      .map((x) => x.a);
  }, [subject, content]);

  if (!user) return null;

  const reset = () => {
    setSubject("");
    setBody("");
    setCategory("");
    setPriority("medium");
    setRequesterId("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const requester = isClient ? user.id : requesterId;
    if (!subject.trim() || !body.trim() || !category || !requester) {
      toast.error("Please fill in all the required fields");
      return;
    }
    const t = createTicket({
      subject: subject.trim(),
      body: body.trim(),
      category,
      priority,
      channel: isClient ? "portal" : channel,
      requesterId: requester,
    });
    toast.success(`Ticket ${ticketRef(t.number)} created`, {
      description: isClient ? "We've received your request and will be in touch shortly." : t.subject,
    });
    reset();
    onOpenChange(false);
    router.push(`/tickets/${t.id}`);
  };

  const clientContacts = users.filter((u) => u.role === "client");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isClient ? "How can we help?" : "Create a ticket"}</DialogTitle>
          <DialogDescription>
            {isClient
              ? "Tell us what's going on and one of our engineers will pick it up."
              : "Log a request on behalf of a client – e.g. from a phone call."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          {!isClient && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
              <div className="grid gap-2">
                <Label>Requester *</Label>
                <Select value={requesterId} onValueChange={setRequesterId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a client contact" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {companies.map((c) => (
                      <SelectGroup key={c.id}>
                        <SelectLabel>{c.name}</SelectLabel>
                        {clientContacts
                          .filter((u) => u.companyId === c.id)
                          .map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Channel</Label>
                <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CHANNEL_LABEL) as Channel[]).map((c) => (
                      <SelectItem key={c} value={c}>
                        {CHANNEL_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={isClient ? "e.g. I can't connect to the VPN" : "Short summary of the issue"}
              autoFocus
            />
          </div>
          {isClient && suggestions.length > 0 && (
            <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="text-primary size-4" />
                These articles might fix it right away
              </div>
              <div className="space-y-1">
                {suggestions.map((a) => (
                  <Link
                    key={a.id}
                    href={`/knowledge-base/${a.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="text-primary flex items-center gap-2 text-sm hover:underline"
                  >
                    <BookOpen className="size-3.5" />
                    {a.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{isClient ? "How urgent is it?" : "Priority"}</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_ORDER.map((p) => (
                    <SelectItem key={p} value={p}>
                      {isClient ? clientPriorityHint[p] : PRIORITY_META[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">Description *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="min-h-28"
              placeholder={
                isClient
                  ? "What happened? Any error messages? How many people are affected?"
                  : "Details of the request…"
              }
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isClient ? "Submit request" : "Create ticket"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
