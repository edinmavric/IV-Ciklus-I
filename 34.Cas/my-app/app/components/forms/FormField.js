// ============================================
// FORM FIELD - Reusable input komponenta
// ============================================
// Univerzalna form field komponenta koja podrzava razlicite tipove
// inputa i prikazuje greske iz validacije.

'use client';

/**
 * FormField komponenta
 * Prikazuje label, input/textarea i poruku o gresci
 *
 * @param {Object} props
 * @param {string} props.label - Label tekst
 * @param {string} props.name - Ime polja (name atribut)
 * @param {string} props.type - Tip inputa (text, email, password, textarea, select)
 * @param {string} props.placeholder - Placeholder tekst
 * @param {string} props.error - Poruka o gresci
 * @param {boolean} props.required - Da li je polje obavezno
 * @param {string} props.defaultValue - Pocetna vrednost
 * @param {string} props.value - Kontrolisana vrednost
 * @param {Function} props.onChange - Handler za promenu
 * @param {string} props.className - Dodatne CSS klase
 * @param {Array} props.options - Opcije za select
 * @param {number} props.rows - Broj redova za textarea
 * @param {string} props.helperText - Pomocni tekst ispod polja
 * @param {boolean} props.disabled - Da li je polje disabled
 *
 * @example
 * <FormField
 *   label="Email"
 *   name="email"
 *   type="email"
 *   placeholder="vas@email.com"
 *   error={errors?.email}
 *   required
 * />
 */
export default function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  required = false,
  defaultValue,
  value,
  onChange,
  className = '',
  options = [],
  rows = 4,
  helperText,
  disabled = false,
  autoComplete,
  min,
  max,
  minLength,
  maxLength,
  pattern,
}) {
  // Bazne klase za input
  const inputBaseClasses = `
    w-full
    px-3 py-2
    border rounded-md
    shadow-sm
    placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${className}
  `;

  // Renderovanje inputa na osnovu tipa
  const renderInput = () => {
    // Zajednicke props za sve inpute
    const commonProps = {
      id: name,
      name,
      placeholder,
      required,
      disabled,
      defaultValue,
      ...(value !== undefined && { value }),
      ...(onChange && { onChange }),
      'aria-invalid': error ? 'true' : 'false',
      'aria-describedby': error ? `${name}-error` : helperText ? `${name}-helper` : undefined,
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            minLength={minLength}
            maxLength={maxLength}
            className={inputBaseClasses}
          />
        );

      case 'select':
        return (
          <select {...commonProps} className={inputBaseClasses}>
            <option value="">{placeholder || 'Odaberite...'}</option>
            {options.map((option) => (
              <option
                key={option.value || option}
                value={option.value || option}
              >
                {option.label || option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              {...commonProps}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            {label && (
              <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
                {label}
              </label>
            )}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
            autoComplete={autoComplete}
            min={min}
            max={max}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            className={inputBaseClasses}
          />
        );
    }
  };

  // Za checkbox, label je deo inputa
  if (type === 'checkbox') {
    return (
      <div className="mb-4">
        {renderInput()}
        {error && (
          <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      {renderInput()}

      {/* Helper text */}
      {helperText && !error && (
        <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Kategorije za select u PostForm
 */
export const KATEGORIJE = [
  { value: 'tehnologija', label: 'Tehnologija' },
  { value: 'programiranje', label: 'Programiranje' },
  { value: 'web-razvoj', label: 'Web razvoj' },
  { value: 'novosti', label: 'Novosti' },
  { value: 'tutorial', label: 'Tutorial' },
];

/**
 * Status opcije za select
 */
export const STATUS_OPCIJE = [
  { value: 'draft', label: 'Draft (nije objavljen)' },
  { value: 'objavljen', label: 'Objavljen' },
  { value: 'arhiviran', label: 'Arhiviran' },
];
