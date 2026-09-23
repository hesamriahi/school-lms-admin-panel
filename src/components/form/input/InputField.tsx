import type React from 'react';
import type { FC } from 'react';

/** جدا کردن سه‌تایی اعداد با کاما برای نمایش */
function formatWithCommas(s: string): string {
  if (s === '' || s == null) return '';
  const str = String(s).replace(/,/g, '');
  const parts = str.split('.');
  const intPart = parts[0].replace(/\D/g, '') || '0';
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts[1] !== undefined ? `${formatted}.${parts[1]}` : formatted;
}

/** حذف کاما و استخراج عدد خام برای ذخیره در state */
function parseRawNumber(s: string): string {
  const stripped = String(s).replace(/,/g, '');
  const match = stripped.match(/^\d*\.?\d*/);
  return match ? match[0] : '';
}

interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  /** وقتی true باشد مقدار نمایشی با جداکننده هزارگان (مثلاً 57,000,000) است؛ مقدار واقعی در onChange بدون کاما برمی‌گردد (مثلاً 57000000). پیش‌فرض: false */
  numberFormat?: boolean;
}

const Input: FC<InputProps> = ({
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  className = '',
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  numberFormat = false,
}) => {
  const rawValue = value === undefined || value === null ? '' : String(value);
  const displayValue = numberFormat ? formatWithCommas(rawValue) : rawValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    if (numberFormat) {
      const raw = parseRawNumber(e.target.value);
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: raw },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      onChange(e);
    }
  };

  let inputClasses = ` h-11 w-full rounded-lg border appearance-none px-2 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-300 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40`;
  } else if (error) {
    inputClasses += `  border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else if (success) {
    inputClasses += `  border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <input
        type={numberFormat ? 'text' : type}
        inputMode={numberFormat ? 'numeric' : undefined}
        id={id}
        name={name}
        placeholder={placeholder}
        value={numberFormat ? displayValue : value}
        onChange={handleChange}
        min={numberFormat ? undefined : min}
        max={numberFormat ? undefined : max}
        step={numberFormat ? undefined : step}
        disabled={disabled}
        className={inputClasses}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error ? 'text-error-500' : success ? 'text-success-500' : 'text-gray-500'
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
