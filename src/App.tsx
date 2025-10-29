import { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import CurrentWeather from "./components/CurrentWeather";
import Forecast from "./components/Forecast";
import {
  getWeatherByCity,
  getWeatherByCoords,
  getForecast,
  getForecastByCoords,
} from "./services/weatherApi";
import type { WeatherData, ForecastData } from "./services/weatherApi";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );
  const [units, setUnits] = useState<"metric" | "imperial">(
    () => (localStorage.getItem("units") as "metric" | "imperial") || "metric"
  );

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLocations, setSavedLocations] = useState<string[]>(
    () => JSON.parse(localStorage.getItem("savedLocations") || "[]")
  );
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle offline/online
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Save last fetched data
  useEffect(() => {
    if (weatherData) localStorage.setItem("cachedWeather", JSON.stringify(weatherData));
  }, [weatherData]);

  useEffect(() => {
    if (forecastData) localStorage.setItem("cachedForecast", JSON.stringify(forecastData));
  }, [forecastData]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const toggleUnits = () => {
    const newUnits = units === "metric" ? "imperial" : "metric";
    setUnits(newUnits);
    localStorage.setItem("units", newUnits);
    if (currentLocation) fetchWeatherData(currentLocation, newUnits);
  };

  // Fetch weather by city
  const fetchWeatherData = async (location: string, unitSystem = units) => {
    try {
      setLoading(true);
      setError(null);
      const weather = await getWeatherByCity(location, unitSystem);
      const forecast = await getForecast(location, unitSystem);
      setWeatherData(weather);
      setForecastData(forecast);
      setCurrentLocation(location);

      if (!savedLocations.includes(location)) {
        const updated = [...savedLocations, location];
        setSavedLocations(updated);
        localStorage.setItem("savedLocations", JSON.stringify(updated));
      }
    } catch {
      setError(`Failed to fetch weather for "${location}"`);
    } finally {
      setLoading(false);
    }
  };

  // Get user location on load
  useEffect(() => {
    const fetchLocationWeather = async () => {
      if (!navigator.geolocation) {
        fetchWeatherData("Polokwane,ZA");
        return;
      }

      try {
        setLoading(true);
        const position = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          })
        );

        const { latitude, longitude } = position.coords;
        const weather = await getWeatherByCoords(latitude, longitude, units);
        const forecast = await getForecastByCoords(latitude, longitude, units);

        setWeatherData(weather);
        setForecastData(forecast);
        setCurrentLocation(weather.name);

        if (!savedLocations.includes(weather.name)) {
          const updated = [...savedLocations, weather.name];
          setSavedLocations(updated);
          localStorage.setItem("savedLocations", JSON.stringify(updated));
        }
        setError(null);
      } catch {
        // Use cached data if offline or error
        const cachedWeather = localStorage.getItem("cachedWeather");
        const cachedForecast = localStorage.getItem("cachedForecast");

        if (cachedWeather) setWeatherData(JSON.parse(cachedWeather));
        if (cachedForecast) setForecastData(JSON.parse(cachedForecast));

        if (!cachedWeather) fetchWeatherData("Polokwane,ZA", units);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationWeather();
  }, [units]);

  const handleSearch = (location: string) => fetchWeatherData(location);
  const handleSavedSelect = (location: string) => fetchWeatherData(location);
  const removeSavedLocation = (location: string) => {
    const updated = savedLocations.filter((loc) => loc !== location);
    setSavedLocations(updated);
    localStorage.setItem("savedLocations", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        units={units}
        toggleUnits={toggleUnits}
        isOffline={isOffline}
      />

      <main className="container mx-auto px-4 py-8">
        <SearchBar onSearch={handleSearch} />

        {savedLocations.length > 0 && (
          <div className="saved-locations my-4">
            <h3 className="font-semibold mb-2">Saved Locations</h3>
            <div className="flex flex-wrap gap-2">
              {savedLocations.map((loc) => (
                <div key={loc} className="flex items-center gap-1">
                  <button
                    onClick={() => handleSavedSelect(loc)}
                    className={`px-2 py-1 rounded ${
                      currentLocation === loc
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
                    }`}
                  >
                    {loc}
                  </button>
                  <button
                    onClick={() => removeSavedLocation(loc)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOffline && (
          <div className="p-2 mb-4 bg-red-100 dark:bg-red-400 text-white-700 dark:text-white-200 rounded text-center">
            You are offline. Showing cached data.
          </div>
        )}

        {loading && <div className="py-8 text-center">Loading weather data...</div>}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-white-700 dark:text-red-300 p-4 rounded my-4">
            {error}
          </div>
        )}

        {weatherData && (
          <div className="weather-container mt-4">
            <CurrentWeather data={weatherData} units={units} />
            {forecastData && <Forecast data={forecastData} units={units} showHourly />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
