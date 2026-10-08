"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Building2, Globe, Laptop, MapPin, Ticket, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/page-header";
import { StatusBadge, SlaBadge } from "@/components/ticket-badges";
import { UserForm } from "@/components/user-form";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PLAN_META, USER_STATUS_META } from "@/lib/constants";
import { formatDate, slaInfo, ticketRef, timeAgo } from "@/lib/format";
import { useAppStore, useCan } from "@/lib/store";
import type { Plan } from "@/lib/types";

const ACTIVE = ["open", "in_progress", "waiting"];

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const company = useAppStore((s) => s.companies.find((c) => c.id === id));
  const users = useAppStore((s) => s.users);
  const tickets = useAppStore((s) => s.tickets);
  const addUser = useAppStore((s) => s.addUser);
  const updateCompany = useAppStore((s) => s.updateCompany);
  const canManageUsers = useCan("users.manage");
  const canManage = useCan("companies.manage");
  const [inviteOpen, setInviteOpen] = useState(false);

  if (!company) {
    return (
      <EmptyState
        icon={Building2}
        title="Client not found"
        action={
          <Button asChild variant="outline">
            <Link href="/companies">Back to clients</Link>
          </Button>
        }
      />
    );
  }

  const contacts = users.filter((u) => u.companyId === company.id);
  const companyTickets = tickets.filter((t) => t.companyId === company.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const open = companyTickets.filter((t) => ACTIVE.includes(t.status));
  const resolved = companyTickets.filter((t) => t.resolvedAt);
  const slaMet = resolved.length ? Math.round((resolved.filter((t) => slaInfo(t).tone === "met").length / resolved.length) * 100) : 100;
  const rated = companyTickets.filter((t) => t.satisfaction);
  const csat = rated.length ? Math.round((rated.filter((t) => t.satisfaction === "positive").length / rated.length) * 100) : 100;
  const manager = users.find((u) => u.id === company.accountManagerId);

  return (
    <div className="space-y-6">
      <Link href="/companies" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft className="size-4" />
        Clients
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary grid size-14 place-items-center rounded-xl text-lg font-bold">
            {company.name
              .split(/[\s&]+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <Building2 className="size-4" />
                {company.industry}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {company.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="size-4" />
                {company.domain}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManage ? (
            <Select
              value={company.plan}
              onValueChange={(v) => {
                updateCompany(company.id, { plan: v as Plan });
                toast.success(`${company.name} moved to the ${v} plan`);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PLAN_META) as Plan[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p} plan
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className={PLAN_META[company.plan].className}>
              {company.plan} plan
            </Badge>
          )}
          {canManageUsers && (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus />
              Add contact
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Seats", value: company.seats, icon: Users },
          { label: "Devices", value: company.devices, icon: Laptop },
          { label: "Open tickets", value: open.length, icon: Ticket },
          { label: "SLA met", value: `${slaMet}%`, icon: Ticket },
          { label: "Satisfaction", value: `${csat}%`, icon: Ticket },
        ].map((s) => (
          <Card key={s.label} className="gap-1 py-4">
            <CardContent className="px-4">
              <div className="text-muted-foreground text-xs font-medium">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="gap-0 overflow-hidden pb-0">
          <CardHeader className="pb-4">
            <CardTitle>Tickets</CardTitle>
            <CardDescription>
              {open.length} open · {companyTickets.length} total
            </CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/tickets?company=${company.id}`}>Open in queue</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="pl-6">Ref</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6">SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyTickets.slice(0, 10).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground pl-6 font-mono text-xs">{ticketRef(t.number)}</TableCell>
                  <TableCell className="max-w-[300px]">
                    <Link href={`/tickets/${t.id}`} className="block truncate font-medium hover:underline">
                      {t.subject}
                    </Link>
                    <div className="text-muted-foreground text-xs">Updated {timeAgo(t.updatedAt)}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="pr-6">
                    <SlaBadge ticket={t} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-4">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>{contacts.length} people with portal access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.map((u) => (
                <Link key={u.id} href={`/users?user=${u.id}`} className="hover:bg-muted/50 -mx-2 flex items-center gap-3 rounded-md px-2 py-1.5">
                  <UserAvatar name={u.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{u.name}</div>
                    <div className="text-muted-foreground truncate text-xs">{u.jobTitle}</div>
                  </div>
                  {u.status !== "active" && (
                    <Badge variant="outline" className={USER_STATUS_META[u.status].className}>
                      {USER_STATUS_META[u.status].label}
                    </Badge>
                  )}
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account manager</span>
                {manager && (
                  <span className="flex items-center gap-2">
                    <UserAvatar name={manager.name} size="xs" />
                    {manager.name}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Client since</span>
                <span>{formatDate(company.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monthly value</span>
                <span className="font-medium">£{(company.seats * PLAN_META[company.plan].price).toLocaleString("en-GB")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize">{company.status}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add a contact to {company.name}</DialogTitle>
            <DialogDescription>They&apos;ll be able to raise and track tickets in the client portal.</DialogDescription>
          </DialogHeader>
          <UserForm
            initial={{ role: "client", companyId: company.id, email: `@${company.domain}` }}
            lockRole
            submitLabel="Send invitation"
            onCancel={() => setInviteOpen(false)}
            onSubmit={(values) => {
              const u = addUser({ ...values, status: "invited" });
              setInviteOpen(false);
              toast.success(`Invitation sent to ${u.email}`);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
