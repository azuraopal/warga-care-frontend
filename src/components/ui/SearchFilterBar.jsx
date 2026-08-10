import { Search } from 'lucide-react';

export default function SearchFilterBar({
  searchKeyword = '',
  onSearchChange,
  placeholder = 'Cari data secara langsung...',
  filters = [],
}) {
  const colCount = 1 + (filters ? filters.length : 0);

  return (
    <div
      style={{
        background: 'white',
        padding: '1rem 1.25rem',
        borderRadius: '18px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
        border: '1px solid #f1f5f9',
        marginBottom: '1.5rem',
        display: 'grid',
        gridTemplateColumns: `repeat(${colCount}, minmax(180px, 1fr))`,
        gap: '0.75rem',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f8fafc', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <Search size={18} style={{ color: '#64748b', flexShrink: 0 }} />
        <input
          type="text"
          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.925rem', color: '#0f172a' }}
          placeholder={placeholder}
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {filters && filters.map((flt, idx) => (
        <select
          key={idx}
          className="form-select"
          style={{ padding: '0.65rem 1rem', width: '100%', borderRadius: '12px', fontSize: '0.9rem', borderColor: '#e2e8f0', background: 'white' }}
          value={flt.value}
          onChange={(e) => flt.onChange(e.target.value)}
        >
          {flt.defaultLabel && <option value="">{flt.defaultLabel}</option>}
          {flt.options && flt.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
