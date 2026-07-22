'use client';

import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export const labelStyles = 'text-xs uppercase tracking-[0.3em] text-muted';
export const inputStyles =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none focus:ring-0';

export const AdminInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function AdminInput(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(inputStyles, className)} {...props} />;
});

export const AdminTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function AdminTextarea(
  { className, rows = 4, ...props },
  ref
) {
  return <textarea ref={ref} rows={rows} className={cn(inputStyles, 'resize-y', className)} {...props} />;
});

export const AdminSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function AdminSelect(
  { className, children, ...props },
  ref
) {
  return (
    <select ref={ref} className={cn(inputStyles, className)} {...props}>
      {children}
    </select>
  );
});
