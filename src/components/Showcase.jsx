import { useState } from 'react';
import OrbitCarousel from './OrbitCarousel.jsx';
import projects from '../data/projects.js';

function Showcase() {
  const [selected, setSelected] = useState(null);

  return (
    <section className="showcase">
      <div className="showcase-intro">
        <p className="eyebrow">Selected work</p>
        <h2>Websites we&apos;ve launched</h2>
        <p className="hint">Drag to spin · click a card to focus · ← → keys</p>
      </div>
      <OrbitCarousel items={projects} onSelect={(item) => setSelected(item.title)} />
      {selected && <p className="showcase-selected">You picked {selected}</p>}
    </section>
  );
}

export default Showcase;
