import { useEffect, useMemo, useState } from "react";
import type {
  DirectoryRecord,
  FieldConfig,
  FieldOption,
  ResourceConfig,
  ResourceKey,
} from "../types";
import { resourceApi } from "../services/api";
import { Button, Modal } from "./ui";
import { getErrorMessage } from "../services/api";

interface Props {
  config: ResourceConfig;
  record: DirectoryRecord | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  notify: (message: string, type?: "success" | "error") => void;
}
type FormValues = Record<string, string | boolean | string[]>;

function getInitialValue(
  field: FieldConfig,
  record: DirectoryRecord | null,
): string | boolean | string[] {
  const value = record?.[field.name];
  if (field.kind === "boolean")
    return typeof value === "boolean"
      ? value
      : field.name === "isActive" || field.name === "isPublic";
  if (field.kind === "multiselect")
    return Array.isArray(value) ? value.map(String) : [];
  if (value && typeof value === "object" && "_id" in value)
    return String((value as DirectoryRecord)._id);
  if (value !== undefined && value !== null) {
    if (field.kind === "date") return String(value).slice(0, 10);
    return String(value);
  }
  return "";
}

export default function ResourceForm({
  config,
  record,
  onClose,
  onSaved,
  notify,
}: Props) {
  const [values, setValues] = useState<FormValues>(() =>
    Object.fromEntries(
      config.fields.map((f) => [f.name, getInitialValue(f, record)]),
    ),
  );
  const [options, setOptions] = useState<Record<string, FieldOption[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(record);

  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      const resources = [
        ...new Set(
          config.fields
            .filter((f) => f.optionsResource)
            .map((f) => f.optionsResource!),
        ),
      ];
      const loaded: Record<string, FieldOption[]> = {};
      await Promise.all(
        resources.map(async (resource) => {
          try {
            const result = await resourceApi.list(resource as ResourceKey, {
              page: 1,
              limit: 100,
              sortBy: "name",
              order: "asc",
            });
            loaded[resource] = result.data.map((item) => ({
              label: String(item.name || item.email || item.code || item._id),
              value: item._id,
            }));
          } catch {
            loaded[resource] = [];
          }
        }),
      );
      if (!cancelled) setOptions(loaded);
    };
    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [config]);

  const visibleOptions = useMemo(() => {
    const result = { ...options };
    if (config.key === "offices" && values.districtId) {
      // District ownership is checked by the backend; keep the loaded options available here.
      result.blocks = options.blocks || [];
    }
    return result;
  }, [options, config.key, values.districtId]);

  const setValue = (name: string, value: string | boolean | string[]) => {
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (name === "districtId" && config.key === "offices") next.blockId = "";
      return next;
    });
  };

  const validate = (): string => {
    for (const field of config.fields) {
      const value = values[field.name];
      if (
        field.required &&
        (value === "" ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0))
      )
        return `${field.label} is required.`;
      if (
        field.kind === "email" &&
        typeof value === "string" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      )
        return `Enter a valid ${field.label.toLowerCase()}.`;
      if (
        field.kind === "number" &&
        typeof value === "string" &&
        value !== ""
      ) {
        const n = Number(value);
        if (!Number.isFinite(n)) return `${field.label} must be a number.`;
        if (field.min !== undefined && n < field.min)
          return `${field.label} must be at least ${field.min}.`;
        if (field.max !== undefined && n > field.max)
          return `${field.label} must be no more than ${field.max}.`;
      }
      if (
        field.kind === "password" &&
        typeof value === "string" &&
        value &&
        value.length < 8
      )
        return "Password must be at least 8 characters.";
    }
    if (config.key === "offices" && values.blockId && !values.districtId)
      return "Select a district before selecting a block.";
    return "";
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    const body: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = values[field.name];
      if (field.kind === "password" && isEdit && !value) continue;
      if (field.kind === "boolean") body[field.name] = Boolean(value);
      else if (field.kind === "multiselect") body[field.name] = value;
      else if (field.kind === "number")
        body[field.name] = value === "" ? undefined : Number(value);
      else body[field.name] = value === "" ? undefined : value;
    }
    if (config.key === "admin-users" && !isEdit && !body.password) {
      setError("Initial password is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (record) await resourceApi.update(config.key, record._id, body);
      else await resourceApi.create(config.key, body);
      notify(
        `${config.singular} ${record ? "updated" : "created"} successfully.`,
      );
      await onSaved();
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = values[field.name];
    const id = `${config.key}-${field.name}`;
    if (field.kind === "boolean")
      return (
        <label className="toggle-field" key={field.name} htmlFor={id}>
          <span>
            <strong>{field.label}</strong>
            <small>
              {field.name === "isPublic"
                ? "Allow this profile to appear in the public directory."
                : "Enable or disable this record."}
            </small>
          </span>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setValue(field.name, e.target.checked)}
          />
        </label>
      );
    if (field.kind === "textarea")
      return (
        <div className="form-field field-full" key={field.name}>
          <label htmlFor={id}>
            {field.label}
            {field.required && <i> *</i>}
          </label>
          <textarea
            id={id}
            rows={3}
            maxLength={field.maxLength}
            value={String(value ?? "")}
            required={field.required}
            onChange={(e) => setValue(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
          <FieldHelp field={field} />
        </div>
      );
    if (field.kind === "multiselect")
      return (
        <div className="form-field field-full" key={field.name}>
          <label htmlFor={id}>{field.label}</label>
          <select
            id={id}
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) =>
              setValue(
                field.name,
                Array.from(e.target.selectedOptions, (o) => o.value),
              )
            }
          >
            {(visibleOptions[field.optionsResource || ""] || []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldHelp field={field} />
        </div>
      );
    if (field.kind === "select") {
      const custom =
        field.name === "role"
          ? [
              { label: "Super administrator", value: "super_admin" },
              { label: "Department administrator", value: "department_admin" },
            ]
          : [];
      const opts = field.optionsResource
        ? visibleOptions[field.optionsResource] || []
        : custom;
      return (
        <div className="form-field" key={field.name}>
          <label htmlFor={id}>
            {field.label}
            {field.required && <i> *</i>}
          </label>
          <select
            id={id}
            value={String(value ?? "")}
            required={field.required}
            onChange={(e) => setValue(field.name, e.target.value)}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldHelp field={field} />
        </div>
      );
    }
    return (
      <div className="form-field" key={field.name}>
        <label htmlFor={id}>
          {field.label}
          {field.required && <i> *</i>}
        </label>
        <input
          id={id}
          type={field.kind}
          value={String(value ?? "")}
          required={field.required}
          maxLength={field.maxLength}
          min={field.min}
          max={field.max}
          onChange={(e) => setValue(field.name, e.target.value)}
          placeholder={
            field.placeholder || (field.kind === "date" ? "YYYY-MM-DD" : "")
          }
          autoComplete={field.kind === "password" ? "new-password" : "off"}
        />
        <FieldHelp field={field} />
      </div>
    );
  };

  return (
    <Modal
      title={`${isEdit ? "Edit" : "Add"} ${config.singular}`}
      onClose={onClose}
      wide
    >
      <form className="resource-form" onSubmit={submit} noValidate>
        {error && (
          <div className="inline-error" role="alert">
            {error}
          </div>
        )}
        <div className="form-grid">{config.fields.map(renderField)}</div>
        <footer className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit
              ? "Save changes"
              : `Create ${config.singular.toLowerCase()}`}
          </Button>
        </footer>
      </form>
    </Modal>
  );
}
function FieldHelp({ field }: { field: FieldConfig }) {
  return field.help ? <small className="field-help">{field.help}</small> : null;
}
