import { useEffect, useState } from 'react';
import './App.css';

export default function Splash({ onEnter }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // petit délai pour déclencher l’anim
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`splash ${mounted ? 'in' : ''}`}>
      <h1 className="brand-big">sporty</h1>
      <button className="btn btn-primary splash-btn" onClick={onEnter}>
        Entrer
      </button>
    </div>
  );
}
