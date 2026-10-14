import { useState } from 'react';
import Header from './components/Header.jsx';
import Showcase from './components/Showcase.jsx';
import Counter from './components/Counter.jsx';
import TodoList from './components/TodoList.jsx';
import Footer from './components/Footer.jsx';

// Root functional component: holds shared state and composes the child components.
function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className={`app ${theme}`}>
      <Header title="My React App" theme={theme} onToggleTheme={toggleTheme} />
      <Showcase />
      <main>
        <Counter initial={0} step={1} />
        <TodoList />
      </main>
      <Footer />
    </div>
  );
}

export default App;
