"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Building2, Laptop, Plus, PoundSterling, Search, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PLAN_META } from "@/lib/constants";
import { useAppStore, useCan } from "@/lib/store";
import type { Plan } from "@/lib/types";

const ACTIVE = ["open", "in_progress", "waiting"];

export default function CompaniesPage() {
  const router = useRouter();
  const companies = useAppStore((s) => s.companies);
  const users = useAppStore((s) => s.users);
  const tickets = useAppStore((s) => s.tickets);
  const addCompany = useAppStore((s) => s.addCompany);
  const canManage = useCan("companies.manage");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      companies
        .filter((c) => `${c.name} ${c.city} ${c.industry}`.toLowerCase().includes(query.toLowerCase()))
        .map((c) => ({
          c,
          contacts: users.filter((u) => u.companyId === c.id).length,
          open: tickets.filter((t) => t.companyId === c.id && ACTIVE.includes(t.status)).length,
          manager: users.find((u) => u.id === c.accountManagerId),
          mrr: c.seats * PLAN_META[c.plan].price,
        }))
        .sort((a, b) => a.c.name.localeCompare(b.c.name)),
    [companies, users, tickets, query],
  );

  const totals = {
    seats: companies.reduce((s, c) => s + c.seats, 0),
    devices: companies.reduce((s, c) => s + c.devices, 0),
    mrr: companies.reduce((s, c) => s + c.seats * PLAN_META[c.plan].price, 0),
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        description="The businesses you support, their plans and how they're doing."
        actions={
          canManage && (
            <Button onClick={() => setOpen(true)}>
              <Plus />
              Add client
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active clients", value: companies.filter((c) => c.status !== "paused").length, icon: Building2 },
          { label: "Supported users", value: totals.seats.toLocaleString("en-GB"), icon: Users },
          { label: "Managed devices", value: totals.devices.toLocaleString("en-GB"), icon: Laptop },
          { label: "Monthly recurring revenue", value: `£${totals.mrr.toLocaleString("en-GB")}`, icon: PoundSterling },
        ].map((s) => (
          <Card key={s.label} className="gap-2 py-5">
            <CardHeader className="px-5">
              <CardDescription className="flex items-center gap-2 font-medium">
                <s.icon className="text-brand-ink size-4" />
                {s.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 text-2xl font-semibold tracking-tight tabular-nums">{s.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients…" className="pl-9" />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="pl-4">Client</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Seats</TableHead>
              <TableHead className="text-right">Devices</TableHead>
              <TableHead className="text-right">Contacts</TableHead>
              <TableHead className="text-right">Open tickets</TableHead>
              <TableHead>Account manager</TableHead>
              <TableHead className="pr-4 text-right">MRR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ c, contacts, open, manager, mrr }) => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/companies/${c.id}`)}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/35 text-brand-ink grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold">
                      {c.name
                        .split(/[\s&]+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        {c.name}
                        {c.status === "onboarding" && (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300">
                            Onboarding
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {c.industry} · {c.city}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={PLAN_META[c.plan].className}>
                    {c.plan}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{c.seats}</TableCell>
                <TableCell className="text-right tabular-nums">{c.devices}</TableCell>
                <TableCell className="text-right tabular-nums">{contacts}</TableCell>
                <TableCell className="text-right">
                  <span className={open > 3 ? "font-semibold text-amber-700 dark:text-amber-300" : "tabular-nums"}>{open}</span>
                </TableCell>
                <TableCell>
                  {manager && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserAvatar name={manager.name} size="sm" />
                      {manager.name}
                    </div>
                  )}
                </TableCell>
                <TableCell className="pr-4 text-right tabular-nums">£{mrr.toLocaleString("en-GB")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AddCompanyDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={(values) => {
          const c = addCompany(values);
          toast.success(`${c.name} added`, { description: "Next step: invite their first contact." });
          router.push(`/companies/${c.id}`);
        }}
      />
    </div>
  );
}

function AddCompanyDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (values: Parameters<ReturnType<typeof useAppStore.getState>["addCompany"]>[0]) => void;
}) {
  const users = useAppStore((s) => s.users);
  const techs = users.filter((u) => u.role !== "client");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [plan, setPlan] = useState<Plan>("Business");
  const [seats, setSeats] = useState("10");
  const [manager, setManager] = useState(techs[0]?.id ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter the company name");
      return;
    }
    onCreate({
      name: name.trim(),
      domain: domain.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.co.uk`,
      industry: industry || "Professional services",
      city: city || "London",
      plan,
      status: "onboarding",
      seats: Number(seats) || 1,
      devices: Math.round((Number(seats) || 1) * 1.3),
      accountManagerId: manager,
    });
    onOpenChange(false);
    setName("");
    setDomain("");
    setIndustry("");
    setCity("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a client</DialogTitle>
          <DialogDescription>Set up a new business you&apos;ll be supporting.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cname">Company name</Label>
            <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Ltd" autoFocus />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="domain">Email domain</Label>
              <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="acme.co.uk" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Retail" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="London" />
            </div>
            <div className="grid gap-2">
              <Label>Plan</Label>
              <Select value={plan} onValueChange={(v) => setPlan(v as Plan)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PLAN_META) as Plan[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seats">Seats</Label>
              <Input id="seats" type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Account manager</Label>
            <Select value={manager} onValueChange={setManager}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {techs.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
