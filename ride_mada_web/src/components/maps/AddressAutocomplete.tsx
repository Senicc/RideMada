import { useState, useEffect } from 'react';
import { fetchAutocomplete } from '../../services/api';

interface Props {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (point: { lat: number; lng: number; address: string }) => void;
  token: string;
}

export default function AddressAutocomplete({ placeholder, value, onChange, onSelect, token }: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (value.length >= 3) {
        const results = await fetchAutocomplete(token, value);
        setSuggestions(results);
        setShow(true);
      } else {
        setSuggestions([]);
        setShow(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [value, token]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShow(true);
        }}
      />
      {show && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-2 bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-3 hover:bg-border cursor-pointer transition-colors text-sm"
              onClick={() => {
                onChange(s.description);
                onSelect({ lat: s.lat, lng: s.lng, address: s.description });
                setShow(false);
              }}
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
