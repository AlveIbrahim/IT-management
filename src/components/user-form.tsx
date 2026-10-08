"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ROLE_META } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import type { Role, User } from "@/lib/types";

export type UserFormValues = Pick<User, "name" | "email" | "role" | "companyId" | "jobTitle" | "phone" | "mfa">;

export function UserForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  lockRole = false,
}: {
  initial?: Partial<UserFormValues>;
  submitLabel: string;
  onSubmit: (values: UserFormValues) => void;
  onCancel?: () => void;
  lockRole?: boolean;
}) {
  const companies = useAppStore((s) => s.companies);
  const [values, setValues] = useState<UserFormValues>({
    name: "",
    email: "",
    role: "client",
    companyId: companies[0]?.id ?? null,
    jobTitle: "",
    phone: "",
    mfa: true,
    ...initial,
  });
  const set = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim() || !values.email.includes("@")) {
      toast.error("Please enter a name and a valid email address");
      return;
    }
    if (values.role === "client" && !values.companyId) {
      toast.error("Client users need to belong to a company");
      return;
    }
    onSubmit({ ...values, companyId: values.role === "client" ? values.companyId : null });
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Smith" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@company.co.uk"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Role</Label>
          <Select value={values.role} onValueChange={(v) => set("role", v as Role)} disabled={lockRole}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_META) as Role[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_META[r].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {values.role === "client" ? (
          <div className="grid gap-2">
            <Label>Company</Label>
            <Select value={values.companyId ?? ""} onValueChange={(v) => set("companyId", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="grid gap-2">
            <Label>Team</Label>
            <Input value="DeskSupport staff" disabled />
          </div>
        )}
      </div>
      <p className="text-muted-foreground -mt-2 text-xs">{ROLE_META[values.role].description}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="title">Job title</Label>
          <Input id="title" value={values.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="Office Manager" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="07700 900000" />
        </div>
      </div>
      <label className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <div>
          <div className="text-sm font-medium">Require multi-factor authentication</div>
          <div className="text-muted-foreground text-xs">Strongly recommended for every account.</div>
        </div>
        <Switch checked={values.mfa} onCheckedChange={(c) => set("mfa", c)} />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
