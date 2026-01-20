/**
 * FormField komponenta
 *
 * Reusable komponenta za input polja koja automatski
 * disable-uje polje tokom slanja forme.
 *
 * Koristi useFormStatus za praćenje stanja forme.
 */

"use client";

import { useFormStatus } from "react-dom";

/**
 * FormField - Input polje koje se disable-uje tokom slanja
 *
 * @param {Object} props
 * @param {string} props.label - Labela za polje
 * @param {string} props.name - Name atribut (obavezan za FormData)
 * @param {string} props.type - Tip inputa (text, email, password, itd.)
 * @param {string} props.error - Poruka greške (ako postoji)
 * @param {string} props.placeholder - Placeholder tekst
 * @param {boolean} props.required - Da li je polje obavezno
 * @param {Object} props.rest - Ostali props koji se proslijeđuju inputu
 */
export default function FormField({
  label,
  name,
  type = "text",
  error,
  placeholder,
  required = false,
  ...rest
}) {
  // Dohvatamo pending stanje iz forme
  const { pending } = useFormStatus();

  return (
    <div className="form-group">
      {/* Labela */}
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: "var(--error)" }}> *</span>}
        </label>
      )}

      {/* Input polje */}
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={pending} // Disable tokom slanja
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : undefined}
        style={{
          borderColor: error ? "var(--error)" : undefined,
        }}
        {...rest}
      />

      {/* Prikaz greške */}
      {error && (
        <span id={`${name}-error`} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * FormTextarea - Textarea polje koje se disable-uje tokom slanja
 */
export function FormTextarea({
  label,
  name,
  error,
  placeholder,
  required = false,
  rows = 4,
  ...rest
}) {
  const { pending } = useFormStatus();

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: "var(--error)" }}> *</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={pending}
        rows={rows}
        aria-invalid={error ? "true" : "false"}
        style={{
          borderColor: error ? "var(--error)" : undefined,
        }}
        {...rest}
      />

      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * FormSelect - Select polje koje se disable-uje tokom slanja
 */
export function FormSelect({
  label,
  name,
  error,
  required = false,
  children,
  ...rest
}) {
  const { pending } = useFormStatus();

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: "var(--error)" }}> *</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        required={required}
        disabled={pending}
        aria-invalid={error ? "true" : "false"}
        style={{
          borderColor: error ? "var(--error)" : undefined,
        }}
        {...rest}
      >
        {children}
      </select>

      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
