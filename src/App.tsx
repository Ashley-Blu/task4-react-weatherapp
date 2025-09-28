import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import { 
  getWeatherByCity, 
  getWeatherByCoords, 
  getForecast, 
  getForecastByCoords
} from './services/weatherApi';
import type { WeatherData, ForecastData } from './services/weatherApi';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [units, setUnits] = useState<'metric' | 'imperial'>(
    () => (localStorage.getItem('units') as 'metric' | 'imperial') || 'metric'
  );
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLocations, setSavedLocations] = useState<string[]>(
    () => JSON.parse(localStorage.getItem('savedLocations') || '[]')
  );
  const [currentLocation, setCurrentLocation] = useState<string>('');

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Toggle units
  const toggleUnits = () => {
    const newUnits = units === 'metric' ? 'imperial' : 'metric';
    setUnits(newUnits);
    localStorage.setItem('units', newUnits);
    
    // Refresh weather data with new units
    if (currentLocation) {
      fetchWeatherData(currentLocation, newUnits);
    }
  };

  // Get user's location on initial load
  useEffect(() => {
    const getLocationWeather = async () => {
      try {
        setLoading(true);
        
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by this browser");
        }
        
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        const { latitude, longitude } = position.coords;
        
        const weatherResponse = await getWeatherByCoords(latitude, longitude, units);
        setWeatherData(weatherResponse);
        setCurrentLocation(weatherResponse.name);
        
        const forecastResponse = await getForecastByCoords(latitude, longitude, units);
        setForecastData(forecastResponse);
        
        // Add to saved locations if not already saved
        if (!savedLocations.includes(weatherResponse.name)) {
          const updatedLocations = [...savedLocations, weatherResponse.name];
          setSavedLocations(updatedLocations);
          localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
        }
        
        setError(null);
      } catch (err) {
         console.error('Error getting location or weather data:', err);
         // Default to Polokwane, South Africa if geolocation fails
         fetchWeatherData('Polokwane,ZA', units);
       } finally {
        setLoading(false);
      }
    };
    
    getLocationWeather();
  }, []);

  // Fetch weather data for a specific location
  const fetchWeatherData = async (location: string, unitSystem = units) => {
    try {
      setLoading(true);
      setError(null);
      
      const weatherResponse = await getWeatherByCity(location, unitSystem);
      setWeatherData(weatherResponse);
      setCurrentLocation(location);
      
      const forecastResponse = await getForecast(location, unitSystem);
      setForecastData(forecastResponse);
      
      // Add to saved locations if not already saved
      if (!savedLocations.includes(location)) {
        const updatedLocations = [...savedLocations, location];
        setSavedLocations(updatedLocations);
        localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
      }
    } catch (err) {
      setError(`Failed to fetch weather data for ${location}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (location: string) => {
    fetchWeatherData(location);
  };

  // Handle saved location selection
  const handleSavedLocationSelect = (location: string) => {
    fetchWeatherData(location);
  };

  // Remove saved location
  const removeSavedLocation = (location: string) => {
    const updatedLocations = savedLocations.filter(loc => loc !== location);
    setSavedLocations(updatedLocations);
    localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${theme}`}>
      <Header theme={theme} toggleTheme={toggleTheme} units={units} toggleUnits={toggleUnits} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="search-container">
          <SearchBar onSearch={handleSearch} />
          
          {savedLocations.length > 0 && (
            <div className="saved-locations">
              <h3>Saved Locations</h3>
              <div className="location-list">
                {savedLocations.map((location, index) => (
                  <div key={index} className="location-item">
                    <button 
                      onClick={() => handleSavedLocationSelect(location)}
                      className={currentLocation === location ? 'active' : ''}
                    >
                      {location}
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => removeSavedLocation(location)}
                      aria-label={`Remove ${location}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {loading && <div className="flex justify-center items-center py-8">Loading weather data...</div>}
        
        {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg my-4">{error}</div>}
        
        {weatherData && !loading && (
          <div className="weather-container">
            <div className="units-toggle">
              <button onClick={toggleUnits}>
                Switch to {units === 'metric' ? 'Fahrenheit' : 'Celsius'}
              </button>
            </div>
            
            <CurrentWeather data={weatherData} units={units} />
            
            {forecastData && <Forecast data={forecastData} units={units} />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
