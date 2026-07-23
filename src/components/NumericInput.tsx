'use client';
import { useState, useEffect, useRef } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
}

export default function NumericInput({ value, onChange, placeholder = '0', className, min }: Props) {
  const [raw, setRaw] = useState(() => (value === 0 ? '' : String(value)));
  const focused = useRef(false);

  // Sync from parent only when the field is not being edited
  useEffect(() => {
    if (!focused.current) {
      setRaw(value === 0 ? '' : String(value));
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    // Allow: empty, digits, single dot, digits after dot
    if (v !== '' && !/^\d*\.?\d*$/.test(v)) return;
    if (min !== undefined && parseFloat(v) < min && v !== '' && v !== '0') return;
    setRaw(v);
    const num = parseFloat(v);
    onChange(isNaN(num) ? 0 : num);
  }

  function handleBlur() {
    focused.current = false;
    // Tidy up display: '0.' → '0', '.5' → '0.5', '' stays ''
    const num = parseFloat(raw);
    setRaw(isNaN(num) ? '' : String(num));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={raw}
      placeholder={placeholder}
      className={className}
      onChange={handleChange}
      onFocus={() => { focused.current = true; }}
      onBlur={handleBlur}
    />
  );
}
