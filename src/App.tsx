import Dashboard from './Dashboard';
import './App.css';
import { LoginDialog } from './components/LoginDialog';
import { useAuth } from './hook/useAuth';

export default function App() {
  const { authenticated, opened, login } = useAuth();

  if (!authenticated) {
    return <LoginDialog opened={opened} onLogin={login} />;
  }

  return (
    <><Dashboard /></>
  );
}