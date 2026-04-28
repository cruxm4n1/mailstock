import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

type BaseProps = {
  label: string;
  error?: string;
  className?: string;
};

type TextFieldProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type TextareaFieldProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

export function Field({ label, error, className, multiline, ...props }: TextFieldProps | TextareaFieldProps) {
  return (
    <label className={clsx("block", className)}>
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea className="field-input min-h-24 resize-y" {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input className="field-input" {...(props as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

type SelectFieldProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({ label, error, className, children, ...props }: SelectFieldProps) {
  return (
    <label className={clsx("block", className)}>
      <span className="field-label">{label}</span>
      <span className="relative block">
        <select className="field-input field-select" {...props}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      </span>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
