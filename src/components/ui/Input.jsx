import './Input.css';

export default function Input({
  label,
  error,
  type = 'text',
  id,
  ...props
}) {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      {type === 'textarea' ? (
        <textarea
          id={id}
          className={`input-field glass-input ${error ? 'input-error' : ''}`}
          rows={4}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          className={`input-field glass-input ${error ? 'input-error' : ''}`}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={`input-field glass-input ${error ? 'input-error' : ''}`}
          {...props}
        />
      )}
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
