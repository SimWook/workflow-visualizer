import { Header } from './components/Header';
import { SettingsBar } from './components/SettingsBar';
import { MainLayout } from './components/MainLayout';

export default function App() {
  return (
    <div className="flex h-full flex-col bg-gray-100">
      <Header />
      <SettingsBar />
      <MainLayout />
    </div>
  );
}
