import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Spinner from '../../../components/shared/Spinner';

/**
 * Reusable search-and-select dropdown.
 * Props:
 *   label        – field label
 *   placeholder  – input placeholder
 *   onSearch     – async fn(term) → array of items
 *   getLabel     – fn(item) → display string
 *   selected     – currently selected item
 *   onSelect     – fn(item)
 *   required     – bool
 */
export default function SearchDropdown({
  label,
  placeholder = 'Type to search…',
  onSearch,
  getLabel,
  selected,
  onSelect,
  required = false,
}) {
  const [term, setTerm]       = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const debounceRef           = useRef(null);
  const containerRef          = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setTerm(val);
    if (selected) onSelect(null); // clear selection when typing again

    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const items = await onSearch(val.trim());
        setResults(items);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setTerm(getLabel(item));
    setOpen(false);
  };

  const handleClear = () => {
    setTerm('');
    setResults([]);
    setOpen(false);
    onSelect(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && ' *'}
      </label>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={selected ? getLabel(selected) : term}
          onChange={selected ? undefined : handleChange}
          readOnly={!!selected}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-lg border border-gray-300 pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(selected || term) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={15} />
          </button>
        )}
        {loading && (
          <div className="absolute right-7 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {getLabel(item)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && term && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400 shadow-lg">
          No results found.
        </div>
      )}
    </div>
  );
}
