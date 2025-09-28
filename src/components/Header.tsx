import { useState, useEffect } from 'react';
import { BsSun, BsMoon } from 'react-icons/bs';
import { WiCelsius, WiFahrenheit } from 'react-icons/wi';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  units: string;
  toggleUnits: () => void;
}

const Header = ({ theme, toggleTheme, units, toggleUnits }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-10 transition-all ${isScrolled ? 'py-2' : 'py-4'}`}>
      <div className="text-blue-600 dark:text-blue-400">
        <h1 className="text-2xl font-bold">ReactWeather</h1>
      </div>
      <div className="flex gap-4">
        <button 
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-yellow-500 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          onClick={toggleTheme} 
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <BsMoon size={20} /> : <BsSun size={20} />}
        </button>
        <button 
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-blue-500 dark:text-blue-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          onClick={toggleUnits} 
          aria-label={`Switch to ${units === 'metric' ? 'imperial' : 'metric'} units`}
        >
          {units === 'metric' ? <WiFahrenheit size={24} /> : <WiCelsius size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;