"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge, Monogram } from "@/components/admin/kit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import {
  ActiveToggle,
  Field,
  GHOST_BUTTON,
  PRIMARY_BUTTON,
  TextArea,
} from "@/components/catalog/CatalogForm";
import { deleteStaff, saveStaff } from "@/lib/catalog/actions";
import type { CatalogStaff } from "@/lib/catalog/queries";

type Editing = string | "new" | null;

export function StaffManager({
  staff,
  canEdit,
}: {
  staff: CatalogStaff[];
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState<Editing>(null);

  if (!canEdit) {
    return (
      <p className="rounded-2xl border border-dashed border-outline bg-white px-6 py-12 text-center text-sm text-muted">
        Бизнесийн бүртгэл олдсонгүй. Эхлээд бүртгэлээ бөглөж, батлуулна уу.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-body">
          Нийт {staff.length} ажилтан. Эдгээр нь аппын профайл дээр{" "}
          <span className="font-medium text-ink">Мастерууд</span> хэсэгт харагдана.
        </p>
        {editing !== "new" && (
          <button type="button" onClick={() => setEditing("new")} className={PRIMARY_BUTTON}>
            <span className="flex items-center gap-2">
              <Plus className="size-4" />
              Ажилтан нэмэх
            </span>
          </button>
        )}
      </div>

      {editing === "new" && <StaffForm onClose={() => setEditing(null)} />}

      {staff.length === 0 && editing !== "new" ? (
        <p className="rounded-2xl border border-dashed border-outline bg-white px-6 py-12 text-center text-sm text-muted">
          Одоогоор ажилтан бүртгээгүй байна.
        </p>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {staff.map((m) =>
            editing === m.id ? (
              <StaffForm
                key={m.id}
                member={m}
                onClose={() => setEditing(null)}
                className="xl:col-span-2"
              />
            ) : (
              <StaffRow key={m.id} member={m} onEdit={() => setEditing(m.id)} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function StaffRow({ member, onEdit }: { member: CatalogStaff; onEdit: () => void }) {
  return (
    <article className="flex items-start gap-4 rounded-2xl border border-surface-variant bg-white p-5">
      {member.photoUrl ? (
        <span className="relative size-12 shrink-0 overflow-hidden rounded-full">
          <Image src={member.photoUrl} alt="" fill className="object-cover" sizes="48px" />
        </span>
      ) : (
        <Monogram name={member.name} />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-ink">{member.name}</h3>
          {!member.isActive && <Badge tone="danger">Идэвхгүй</Badge>}
        </div>
        {member.role && <p className="mt-0.5 text-xs text-body">{member.role}</p>}
        {member.bio && <p className="mt-1.5 text-xs leading-4 text-muted">{member.bio}</p>}

        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Pencil className="size-3.5" />
            Засах
          </button>
          <ActionForm action={deleteStaff} className="contents">
            <input type="hidden" name="staff_id" value={member.id} />
            <SubmitButton className="flex items-center gap-1.5 text-xs font-medium text-danger hover:underline">
              <Trash2 className="size-3.5" />
              Устгах
            </SubmitButton>
          </ActionForm>
        </div>
      </div>
    </article>
  );
}

function StaffForm({
  member,
  onClose,
  className,
}: {
  member?: CatalogStaff;
  onClose: () => void;
  className?: string;
}) {
  return (
    <ActionForm
      action={saveStaff}
      className={`flex flex-col gap-4 rounded-2xl border border-primary/30 bg-white p-6 ${className ?? ""}`}
    >
      {member && <input type="hidden" name="staff_id" value={member.id} />}

      <h3 className="text-base font-medium text-ink">
        {member ? "Ажилтны мэдээлэл засах" : "Шинэ ажилтан"}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Нэр" name="name" required defaultValue={member?.name} placeholder="Солонго" />
        <Field
          label="Албан тушаал"
          name="role"
          defaultValue={member?.role ?? ""}
          placeholder="Ахлах үсчин"
        />
        <TextArea
          label="Товч танилцуулга"
          name="bio"
          defaultValue={member?.bio ?? ""}
          placeholder="Туршлага, мэргэшлээ товч бичнэ үү."
          className="sm:col-span-2"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-surface-tint px-4 py-3 text-sm text-body hover:bg-surface-variant">
        <ImagePlus className="size-4 text-primary" />
        {member?.photoUrl ? "Хөргийг солих (заавал биш)" : "Хөрөг зураг сонгох (заавал биш)"}
        <input type="file" name="photo" accept="image/*" className="sr-only" />
      </label>

      <ActiveToggle defaultChecked={member?.isActive ?? true} />

      <div className="flex gap-3">
        <SubmitButton className={PRIMARY_BUTTON} pendingLabel="Хадгалж байна...">
          Хадгалах
        </SubmitButton>
        <button type="button" onClick={onClose} className={GHOST_BUTTON}>
          Болих
        </button>
      </div>
    </ActionForm>
  );
}
