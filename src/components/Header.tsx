import { BsSun, BsMoon } from 'react-icons/bs';
import { WiCelsius, WiFahrenheit } from 'react-icons/wi';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  units: string;
  toggleUnits: () => void;
  isOffline?: boolean;
}

const Header = ({ theme, toggleTheme, units, toggleUnits, isOffline }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-10 transition-all">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">ReactWeather</h1>
        {isOffline && (
          <span className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">
            Offline
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-yellow-500 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <BsMoon size={20} /> : <BsSun size={20} />}
        </button>

        <button
          onClick={toggleUnits}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-blue-500 dark:text-blue-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label={`Switch to ${units === 'metric' ? 'imperial' : 'metric'} units`}
        >
          {units === 'metric' ? <WiFahrenheit size={24} /> : <WiCelsius size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
