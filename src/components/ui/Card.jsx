export default function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      className={`glass-card ${className}`}
      onClick={onClick}
      style={{ padding: '20px', ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
}
