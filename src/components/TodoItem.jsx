function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.done ? 'done' : ''}>
      <label>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span>{todo.text}</span>
      </label>
      <button aria-label={`Delete ${todo.text}`} onClick={() => onDelete(todo.id)}>
        ✕
      </button>
    </li>
  );
}

export default TodoItem;
