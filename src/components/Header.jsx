function Header({ title, theme, onToggleTheme }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      <button onClick={onToggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </header>
  );
}

export default Header;
