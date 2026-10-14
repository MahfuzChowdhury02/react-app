import { useEffect, useState } from 'react';
import TodoItem from './TodoItem.jsx';

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn functional components', done: true },
    { id: 2, text: 'Practice useState and useEffect', done: false },
  ]);
  const [text, setText] = useState('');

  const remaining = todos.filter((t) => !t.done).length;

  // Side effect: keep the browser tab title in sync with the remaining count.
  useEffect(() => {
    document.title = `${remaining} todo${remaining === 1 ? '' : 's'} left`;
  }, [remaining]);

  const addTodo = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: Date.now(), text: trimmed, done: false }]);
    setText('');
  };

  const toggleTodo = (id) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTodo = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));

  return (
    <section className="card">
      <h2>Todos ({remaining} left)</h2>
      <form onSubmit={addTodo} className="row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a todo…"
        />
        <button type="submit">Add</button>
      </form>
      <ul className="todos">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
        ))}
      </ul>
    </section>
  );
}

export default TodoList;
