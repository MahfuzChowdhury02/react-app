import { useState } from 'react';

function Counter({ initial = 0, step = 1 }) {
  const [count, setCount] = useState(initial);

  return (
    <section className="card">
      <h2>Counter</h2>
      <p className="count">{count}</p>
      <div className="row">
        <button onClick={() => setCount((c) => c - step)}>−</button>
        <button onClick={() => setCount(initial)}>Reset</button>
        <button onClick={() => setCount((c) => c + step)}>+</button>
      </div>
    </section>
  );
}

export default Counter;
