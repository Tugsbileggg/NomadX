"use client";

import { useState } from "react";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/admin/kit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import {
  ActiveToggle,
  Field,
  GHOST_BUTTON,
  PRIMARY_BUTTON,
  TextArea,
} from "@/components/catalog/CatalogForm";
import { deleteService, saveService } from "@/lib/catalog/actions";
import type { CatalogService } from "@/lib/catalog/queries";

/** "new" бол нэмэх маягт, id бол тухайн мөрийг засах маягт нээлттэй. */
type Editing = string | "new" | null;

export function ServiceManager({
  services,
  canEdit,
}: {
  services: CatalogService[];
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
          Нийт {services.length} үйлчилгээ. Эдгээр нь аппад{" "}
          <span className="font-medium text-ink">үнийн цэс</span> болж харагдана.
        </p>
        {editing !== "new" && (
          <button type="button" onClick={() => setEditing("new")} className={PRIMARY_BUTTON}>
            <span className="flex items-center gap-2">
              <Plus className="size-4" />
              Үйлчилгээ нэмэх
            </span>
          </button>
        )}
      </div>

      {editing === "new" && (
        <ServiceForm onClose={() => setEditing(null)} />
      )}

      {services.length === 0 && editing !== "new" ? (
        <p className="rounded-2xl border border-dashed border-outline bg-white px-6 py-12 text-center text-sm text-muted">
          Одоогоор үйлчилгээ бүртгээгүй байна.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((s) =>
            editing === s.id ? (
              <ServiceForm key={s.id} service={s} onClose={() => setEditing(null)} />
            ) : (
              <ServiceRow key={s.id} service={s} onEdit={() => setEditing(s.id)} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function ServiceRow({ service, onEdit }: { service: CatalogService; onEdit: () => void }) {
  return (
    <article className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-surface-variant bg-white p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-medium text-ink">{service.name}</h3>
          {service.category && <Badge>{service.category}</Badge>}
          {!service.isActive && <Badge tone="danger">Идэвхгүй</Badge>}
        </div>
        {service.description && (
          <p className="mt-1.5 text-sm leading-5 text-body">{service.description}</p>
        )}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Clock className="size-3.5" />
          {service.durationMin} мин
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-base font-semibold text-primary">
          {service.price.toLocaleString("en-US")}₮
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <Pencil className="size-3.5" />
          Засах
        </button>
        <ActionForm action={deleteService} className="contents">
          <input type="hidden" name="service_id" value={service.id} />
          <SubmitButton className="flex items-center gap-1.5 text-xs font-medium text-danger hover:underline">
            <Trash2 className="size-3.5" />
            Устгах
          </SubmitButton>
        </ActionForm>
      </div>
    </article>
  );
}

function ServiceForm({ service, onClose }: { service?: CatalogService; onClose: () => void }) {
  return (
    <ActionForm
      action={saveService}
      className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-white p-6"
    >
      {service && <input type="hidden" name="service_id" value={service.id} />}

      <h3 className="text-base font-medium text-ink">
        {service ? "Үйлчилгээ засах" : "Шинэ үйлчилгээ"}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Нэр"
          name="name"
          required
          defaultValue={service?.name}
          placeholder="Жишээ: Эмэгтэй үс засалт"
          className="sm:col-span-2"
        />
        <Field
          label="Үнэ (₮)"
          name="price"
          type="number"
          min={0}
          defaultValue={service?.price ?? 0}
        />
        <Field
          label="Үргэлжлэх хугацаа (мин)"
          name="duration_min"
          type="number"
          min={1}
          defaultValue={service?.durationMin ?? 60}
        />
        <Field
          label="Ангилал"
          name="category"
          defaultValue={service?.category ?? ""}
          placeholder="Үсчин, Хумс…"
          className="sm:col-span-2"
        />
        <TextArea
          label="Тайлбар"
          name="description"
          defaultValue={service?.description ?? ""}
          placeholder="Юу багтахыг товч бичнэ үү."
          className="sm:col-span-2"
        />
      </div>

      <ActiveToggle defaultChecked={service?.isActive ?? true} />

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
