"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, Suspense, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  KeyRound,
  Mail,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/page-header";
import { UserForm } from "@/components/user-form";
import { UserAvatar } from "@/components/user-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERMISSIONS, ROLE_META, USER_STATUS_META } from "@/lib/constants";
import { formatDate, ticketRef, timeAgo } from "@/lib/format";
import { useAppStore, useCan, useCurrentUser } from "@/lib/store";
import type { Role, User, UserStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

function UsersPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const me = useCurrentUser()!;
  const users = useAppStore((s) => s.users);
  const companies = useAppStore((s) => s.companies);
  const addUser = useAppStore((s) => s.addUser);
  const updateUser = useAppStore((s) => s.updateUser);
  const deleteUser = useAppStore((s) => s.deleteUser);
  const canManage = useCan("users.manage");

  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const openUserId = params.get("user");
  const openUser = users.find((u) => u.id === openUserId) ?? null;

  const setOpenUser = (id: string | null) => router.replace(id ? `/users?user=${id}` : "/users", { scroll: false });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => {
        if (tab === "staff" && u.role === "client") return false;
        if (tab === "clients" && u.role !== "client") return false;
        if (company !== "all" && u.companyId !== company) return false;
        if (status !== "all" && u.status !== status) return false;
        if (q && !`${u.name} ${u.email} ${u.jobTitle}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, tab, query, company, status]);

  const companyName = (id: string | null) => companies.find((c) => c.id === id)?.name;
  const counts = {
    all: users.length,
    staff: users.filter((u) => u.role !== "client").length,
    clients: users.filter((u) => u.role === "client").length,
  };

  const userActions = (u: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => setOpenUser(u.id)}>
          <Pencil />
          {canManage ? "Edit user" : "View details"}
        </DropdownMenuItem>
        {canManage && (
          <>
            <DropdownMenuItem onSelect={() => toast.success(`Password reset link sent to ${u.email}`)}>
              <KeyRound />
              Send password reset
            </DropdownMenuItem>
            {u.status === "invited" && (
              <DropdownMenuItem onSelect={() => toast.success(`Invitation re-sent to ${u.email}`)}>
                <Mail />
                Resend invitation
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() => {
                updateUser(u.id, { mfa: !u.mfa });
                toast.success(u.mfa ? `MFA reset for ${u.name}` : `MFA required for ${u.name}`);
              }}
            >
              {u.mfa ? <ShieldOff /> : <ShieldCheck />}
              {u.mfa ? "Reset MFA" : "Require MFA"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {u.status === "suspended" ? (
              <DropdownMenuItem
                onSelect={() => {
                  updateUser(u.id, { status: "active" });
                  toast.success(`${u.name} reactivated`);
                }}
              >
                <CheckCircle2 />
                Reactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={u.id === me.id}
                onSelect={() => {
                  updateUser(u.id, { status: "suspended" });
                  toast.success(`${u.name} suspended`, { description: "They can no longer sign in." });
                }}
              >
                <Ban />
                Suspend
              </DropdownMenuItem>
            )}
            <DropdownMenuItem variant="destructive" disabled={u.id === me.id} onSelect={() => setConfirmDelete(u)}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users & roles"
        description="Manage your team, client contacts and what each role is allowed to do."
        actions={
          canManage && (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus />
              Invite user
            </Button>
          )
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All users ({counts.all})</TabsTrigger>
          <TabsTrigger value="staff">Staff ({counts.staff})</TabsTrigger>
          <TabsTrigger value="clients">Client contacts ({counts.clients})</TabsTrigger>
          <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-3">
          <RolesPanel />
        </TabsContent>

        {tab !== "roles" && (
          <div className="mt-3 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, job title…" className="pl-9" />
              </div>
              {tab !== "staff" && (
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger size="sm" className="w-[190px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All companies</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={status} onValueChange={(v) => setStatus(v as UserStatus | "all")}>
                <SelectTrigger size="sm" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any status</SelectItem>
                  {(Object.keys(USER_STATUS_META) as UserStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {USER_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Card className="gap-0 overflow-hidden py-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="pl-4">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>MFA</TableHead>
                    <TableHead>Last active</TableHead>
                    <TableHead className="w-12 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id} className="cursor-pointer" onClick={() => setOpenUser(u.id)}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.name} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 font-medium">
                              {u.name}
                              {u.id === me.id && <span className="text-muted-foreground text-xs font-normal">(you)</span>}
                            </div>
                            <div className="text-muted-foreground text-xs">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ROLE_META[u.role].className}>
                          {ROLE_META[u.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.companyId ? (
                          <Link href={`/companies/${u.companyId}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                            {companyName(u.companyId)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">DeskSupport</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={USER_STATUS_META[u.status].className}>
                          {USER_STATUS_META[u.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.mfa ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                            <ShieldCheck className="size-3.5" /> On
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
                            <ShieldOff className="size-3.5" /> Off
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {u.lastActiveAt ? timeAgo(u.lastActiveAt) : "Never"}
                      </TableCell>
                      <TableCell className="pr-4 text-right">{userActions(u)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && <EmptyState icon={UsersIcon} title="No users found" description="Try changing your search or filters." />}
            </Card>
          </div>
        )}
      </Tabs>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Invite a user</DialogTitle>
            <DialogDescription>They&apos;ll get an email with a link to set their password and enrol in MFA.</DialogDescription>
          </DialogHeader>
          <UserForm
            initial={{ role: tab === "staff" ? "technician" : "client" }}
            submitLabel="Send invitation"
            onCancel={() => setInviteOpen(false)}
            onSubmit={(values) => {
              const u = addUser({ ...values, status: "invited" });
              setInviteOpen(false);
              toast.success(`Invitation sent to ${u.email}`, { description: `${u.name} added as ${ROLE_META[u.role].label}` });
            }}
          />
        </DialogContent>
      </Dialog>

      <Sheet open={!!openUser} onOpenChange={(o) => !o && setOpenUser(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
          {openUser && <UserDetail user={openUser} canManage={canManage} onDone={() => setOpenUser(null)} />}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They&apos;ll lose access immediately. Their tickets and history are kept. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => {
                if (confirmDelete) {
                  deleteUser(confirmDelete.id);
                  toast.success(`${confirmDelete.name} deleted`);
                }
                setConfirmDelete(null);
              }}
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserDetail({ user, canManage, onDone }: { user: User; canManage: boolean; onDone: () => void }) {
  const tickets = useAppStore((s) => s.tickets);
  const companies = useAppStore((s) => s.companies);
  const updateUser = useAppStore((s) => s.updateUser);
  const related = tickets
    .filter((t) => (user.role === "client" ? t.requesterId === user.id : t.assigneeId === user.id))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const open = related.filter((t) => ["open", "in_progress", "waiting"].includes(t.status));
  const company = companies.find((c) => c.id === user.companyId);

  return (
    <>
      <SheetHeader className="border-b p-6">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} size="xl" />
          <div className="min-w-0 space-y-1">
            <SheetTitle className="text-lg">{user.name}</SheetTitle>
            <SheetDescription>
              {user.jobTitle}
              {company ? ` at ${company.name}` : " at DeskSupport"}
            </SheetDescription>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="outline" className={ROLE_META[user.role].className}>
                {ROLE_META[user.role].label}
              </Badge>
              <Badge variant="outline" className={USER_STATUS_META[user.status].className}>
                {USER_STATUS_META[user.status].label}
              </Badge>
            </div>
          </div>
        </div>
      </SheetHeader>
      <div className="space-y-6 px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label={user.role === "client" ? "Tickets raised" : "Tickets handled"} value={related.length} />
          <MiniStat label="Open now" value={open.length} />
          <MiniStat label="Member since" value={formatDate(user.createdAt, "MMM yyyy")} />
        </div>

        {canManage ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Profile</h3>
            <UserForm
              key={user.id}
              initial={user}
              submitLabel="Save changes"
              onCancel={onDone}
              onSubmit={(values) => {
                updateUser(user.id, values);
                toast.success("User updated");
                onDone();
              }}
            />
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground">Email: {user.email}</div>
            <div className="text-muted-foreground">Phone: {user.phone}</div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">{user.role === "client" ? "Recent tickets" : "Assigned tickets"}</h3>
          <div className="divide-y rounded-lg border">
            {related.slice(0, 6).map((t) => (
              <Link key={t.id} href={`/tickets/${t.id}`} className="hover:bg-muted/40 flex items-center gap-3 px-3 py-2.5 text-sm">
                <span className="text-muted-foreground font-mono text-xs">{ticketRef(t.number)}</span>
                <span className="flex-1 truncate">{t.subject}</span>
                <span className="text-muted-foreground text-xs">{timeAgo(t.updatedAt)}</span>
              </Link>
            ))}
            {related.length === 0 && <div className="text-muted-foreground p-4 text-center text-sm">No tickets yet</div>}
          </div>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function RolesPanel() {
  const users = useAppStore((s) => s.users);
  const permissions = useAppStore((s) => s.permissions);
  const setPermission = useAppStore((s) => s.setPermission);
  const canEdit = useCan("settings.manage");
  const roles: Role[] = ["admin", "technician", "client"];
  const groups = Array.from(new Set(PERMISSIONS.map((p) => p.group)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {roles.map((r) => (
          <Card key={r} className="gap-3 py-5">
            <CardHeader className="px-5">
              <CardTitle className="flex items-center justify-between">
                {ROLE_META[r].label}
                <Badge variant="outline" className={ROLE_META[r].className}>
                  {users.filter((u) => u.role === r).length} {users.filter((u) => u.role === r).length === 1 ? "user" : "users"}
                </Badge>
              </CardTitle>
              <CardDescription>{ROLE_META[r].description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            {canEdit ? "Changes apply instantly – try switching to the technician demo user to see the effect." : "Only administrators can change permissions."}
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="pl-6">Permission</TableHead>
              {roles.map((r) => (
                <TableHead key={r} className="w-36 text-center">
                  {ROLE_META[r].label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => (
              <Fragment key={g}>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableCell colSpan={4} className="text-muted-foreground pl-6 text-xs font-semibold tracking-wide uppercase">
                    {g}
                  </TableCell>
                </TableRow>
                {PERMISSIONS.filter((p) => p.group === g).map((p) => (
                  <TableRow key={p.key}>
                    <TableCell className="pl-6 text-sm">{p.label}</TableCell>
                    {roles.map((r) => (
                      <TableCell key={r} className="text-center">
                        <Switch
                          checked={permissions[p.key]?.[r] ?? false}
                          disabled={!canEdit || r === "admin"}
                          onCheckedChange={(c) => {
                            setPermission(p.key, r, c);
                            toast.success(`${ROLE_META[r].label}: “${p.label}” ${c ? "enabled" : "disabled"}`);
                          }}
                          className={cn(r === "admin" && "opacity-60")}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense>
      <UsersPageInner />
    </Suspense>
  );
}
