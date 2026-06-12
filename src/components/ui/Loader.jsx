import './Loader.css';

export default function Loader({ size = 'md' }) {
  return (
    <div className={`loader-container loader-${size}`}>
      <div className="loader-ring" />
    </div>
  );
}
