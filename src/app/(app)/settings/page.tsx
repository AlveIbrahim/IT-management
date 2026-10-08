"use client";

import { useState } from "react";
import { Check, Headset, Palette, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge } from "@/components/ticket-badges";
import { PRIORITY_ORDER } from "@/lib/constants";
import { DEFAULT_SETTINGS } from "@/lib/seed";
import { useAppStore, useCan } from "@/lib/store";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

const SWATCHES = ["#bdea72", "#a3e635", "#65a30d", "#15803d", "#0f766e", "#1d5fd1", "#7c3aed", "#111827"];

/** Dark or white tick, whichever reads better on the swatch. */
function tickColor(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? "#1a2e05" : "#ffffff";
}

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const canManage = useCan("settings.manage");
  const [form, setForm] = useState<Settings>(settings);
  const [newCategory, setNewCategory] = useState("");

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setForm((f) => ({ ...f, [key]: value }));
  const save = (label = "Settings saved") => {
    updateSettings(form);
    toast.success(label);
  };

  if (!canManage) {
    return <PageHeader title="Settings" description="Only administrators can change settings." />;
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Make the hub your own – branding, SLAs and how the service desk behaves." />

      <Tabs defaultValue="branding">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="desk">Service desk</TabsTrigger>
          <TabsTrigger value="portal">Client portal</TabsTrigger>
          <TabsTrigger value="demo">Demo data</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-3">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Card>
              <CardHeader>
                <CardTitle>Brand</CardTitle>
                <CardDescription>Used across the hub, client portal, emails and website.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="brandName">Company name</Label>
                    <Input id="brandName" value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Brand colour</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {SWATCHES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          set("brandColor", c);
                          updateSettings({ brandColor: c });
                        }}
                        className={cn(
                          "grid size-9 place-items-center rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-105",
                          form.brandColor === c && "ring-foreground ring-2",
                        )}
                        style={{ background: c }}
                        aria-label={`Use ${c}`}
                      >
                        {form.brandColor === c && <Check className="size-4" style={{ color: tickColor(c) }} />}
                      </button>
                    ))}
                    <label className="relative flex h-9 items-center gap-2 rounded-md border px-2 text-sm">
                      <Palette className="text-muted-foreground size-4" />
                      <input
                        type="color"
                        value={form.brandColor}
                        onChange={(e) => {
                          set("brandColor", e.target.value);
                          updateSettings({ brandColor: e.target.value });
                        }}
                        className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                      <span className="font-mono text-xs uppercase">{form.brandColor}</span>
                    </label>
                  </div>
                  <p className="text-muted-foreground text-xs">Colour changes apply instantly so you can match your brand live.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Support email</Label>
                    <Input id="email" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Support phone</Label>
                    <Input id="phone" value={form.supportPhone} onChange={(e) => set("supportPhone", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hours">Business hours</Label>
                    <Input id="hours" value={form.businessHours} onChange={(e) => set("businessHours", e.target.value)} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm(DEFAULT_SETTINGS);
                    updateSettings(DEFAULT_SETTINGS);
                    toast.success("Branding restored to defaults");
                  }}
                >
                  Restore defaults
                </Button>
                <Button onClick={() => save("Branding saved")}>Save changes</Button>
              </CardFooter>
            </Card>

            <Card className="h-fit gap-0 overflow-hidden py-0">
              <div className="text-muted-foreground border-b px-4 py-2.5 text-xs font-medium">Live preview</div>
              <div className="bg-sidebar flex items-center gap-2.5 px-4 py-4">
                <div className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
                  <Headset className="size-[18px]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{form.brandName}</div>
                  <div className="text-[11px] text-white/60">Client portal</div>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="text-lg font-semibold">{form.portalWelcome}</div>
                <p className="text-muted-foreground text-sm">{form.tagline}</p>
                <div className="flex gap-2">
                  <Button size="sm">
                    Raise a ticket
                  </Button>
                  <Button size="sm" variant="outline">
                    Help centre
                  </Button>
                </div>
                <div className="text-muted-foreground text-xs">
                  {form.supportPhone} · {form.supportEmail}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="desk" className="mt-3 space-y-4">
          <Card className="gap-0 overflow-hidden pb-0">
            <CardHeader className="pb-4">
              <CardTitle>SLA policies</CardTitle>
              <CardDescription>Target times in business hours. New tickets get a due date from these.</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-6">Priority</TableHead>
                  <TableHead>First response (hours)</TableHead>
                  <TableHead className="pr-6">Resolution (hours)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PRIORITY_ORDER.map((p) => (
                  <TableRow key={p}>
                    <TableCell className="pl-6">
                      <PriorityBadge priority={p} />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.5"
                        min={0.5}
                        value={form.sla[p].response}
                        onChange={(e) => set("sla", { ...form.sla, [p]: { ...form.sla[p], response: Number(e.target.value) } })}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell className="pr-6">
                      <Input
                        type="number"
                        step="1"
                        min={1}
                        value={form.sla[p].resolve}
                        onChange={(e) => set("sla", { ...form.sla, [p]: { ...form.sla[p], resolve: Number(e.target.value) } })}
                        className="w-28"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <CardFooter className="justify-end border-t py-4">
              <Button onClick={() => save("SLA policies saved")}>Save SLAs</Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket categories</CardTitle>
                <CardDescription>Shown when clients and engineers raise a ticket.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {form.categories.map((c) => (
                    <Badge key={c} variant="secondary" className="gap-1 py-1 pr-1 pl-2.5 text-sm font-normal">
                      {c}
                      <button
                        onClick={() => set("categories", form.categories.filter((x) => x !== c))}
                        className="hover:bg-foreground/10 rounded p-0.5"
                        aria-label={`Remove ${c}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCategory.trim() || form.categories.includes(newCategory.trim())) return;
                    set("categories", [...form.categories, newCategory.trim()]);
                    setNewCategory("");
                  }}
                >
                  <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Add a category…" />
                  <Button type="submit" variant="outline">
                    <Plus />
                    Add
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="justify-end border-t">
                <Button onClick={() => save("Categories saved")}>Save categories</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation</CardTitle>
                <CardDescription>Let the hub do the busywork.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleRow
                  title="Auto-assign new tickets"
                  description="Round-robin to the engineer with the fewest open tickets."
                  checked={form.autoAssign}
                  onChange={(c) => {
                    set("autoAssign", c);
                    updateSettings({ autoAssign: c });
                  }}
                />
                <ToggleRow
                  title="Customer satisfaction survey"
                  description="Ask clients to rate resolved tickets."
                  checked={form.csatEnabled}
                  onChange={(c) => {
                    set("csatEnabled", c);
                    updateSettings({ csatEnabled: c });
                  }}
                />
                <ToggleRow
                  title="SLA breach alerts"
                  description="Notify the service desk lead 30 minutes before a breach."
                  checked
                  onChange={() => toast.info("Always on in the demo")}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portal" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle>Client portal</CardTitle>
              <CardDescription>What your clients see when they sign in.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="welcome">Welcome message</Label>
                <Textarea id="welcome" value={form.portalWelcome} onChange={(e) => set("portalWelcome", e.target.value)} rows={2} />
                <p className="text-muted-foreground text-xs">“Hi there” is replaced with the client&apos;s first name.</p>
              </div>
              <ToggleRow
                title="Clients can close their own tickets"
                description="Shows an “It's fixed” button on open tickets."
                checked={form.clientCanCloseTickets}
                onChange={(c) => set("clientCanCloseTickets", c)}
              />
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => save("Portal settings saved")}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="demo" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle>Demo data</CardTitle>
              <CardDescription>
                This MVP runs entirely in the browser. Tickets, users and content you create are saved locally so the demo feels real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => {
                  resetDemo();
                  setForm(DEFAULT_SETTINGS);
                  toast.success("Demo data reset");
                }}
              >
                <RotateCcw />
                Reset all demo data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-muted-foreground text-xs">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
