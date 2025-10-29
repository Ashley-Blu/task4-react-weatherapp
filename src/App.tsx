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
  const [savedLocations, setSavedLocations] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("savedLocations") || "[]")
  );

  // Track the city currently displayed
  const [displayedCity, setDisplayedCity] = useState<string>("");

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // Toggle units and refresh only the displayed city
  const toggleUnits = () => {
    const newUnits = units === "metric" ? "imperial" : "metric";
    setUnits(newUnits);
    localStorage.setItem("units", newUnits);

    if (displayedCity) fetchWeatherData(displayedCity, newUnits);
  };

  // Fetch weather for a city
  const fetchWeatherData = async (city: string, unitSystem = units) => {
    setLoading(true);
    setError(null);

    try {
      // If offline, use cached data
      if (!navigator.onLine) {
        const cachedWeather = localStorage.getItem(`weather_${city}_${unitSystem}`);
        const cachedForecast = localStorage.getItem(`forecast_${city}_${unitSystem}`);
        if (cachedWeather && cachedForecast) {
          setWeatherData(JSON.parse(cachedWeather));
          setForecastData(JSON.parse(cachedForecast));
          setDisplayedCity(city);
          return;
        } else {
          setError("No cached data available offline");
          return;
        }
      }

      const weatherResponse = await getWeatherByCity(city, unitSystem);
      const forecastResponse = await getForecast(city, unitSystem);

      setWeatherData(weatherResponse);
      setForecastData(forecastResponse);
      setDisplayedCity(city);

      // Save to cached storage
      localStorage.setItem(`weather_${city}_${unitSystem}`, JSON.stringify(weatherResponse));
      localStorage.setItem(`forecast_${city}_${unitSystem}`, JSON.stringify(forecastResponse));

      // Save to savedLocations
      if (!savedLocations.includes(city)) {
        const updatedLocations = [...savedLocations, city];
        setSavedLocations(updatedLocations);
        localStorage.setItem("savedLocations", JSON.stringify(updatedLocations));
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch weather data for ${city}`);
    } finally {
      setLoading(false);
    }
  };

  // On initial load, get geolocation weather
  useEffect(() => {
    const getLocationWeather = async () => {
      if (!navigator.geolocation) {
        fetchWeatherData("Polokwane,ZA"); // fallback
        return;
      }

      try {
        setLoading(true);
        const position = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        );

        const { latitude, longitude } = position.coords;
        const weatherResponse = await getWeatherByCoords(latitude, longitude, units);
        const forecastResponse = await getForecastByCoords(latitude, longitude, units);

        setWeatherData(weatherResponse);
        setForecastData(forecastResponse);
        setDisplayedCity(weatherResponse.name);

        // Cache
        localStorage.setItem(`weather_${weatherResponse.name}_${units}`, JSON.stringify(weatherResponse));
        localStorage.setItem(`forecast_${weatherResponse.name}_${units}`, JSON.stringify(forecastResponse));
      } catch (err) {
        console.error("Error fetching geolocation weather:", err);
        fetchWeatherData("Polokwane,ZA", units); // fallback
      } finally {
        setLoading(false);
      }
    };

    getLocationWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (city: string) => fetchWeatherData(city);
  const handleSavedLocationSelect = (city: string) => fetchWeatherData(city);
  const removeSavedLocation = (city: string) => {
    const updated = savedLocations.filter((loc) => loc !== city);
    setSavedLocations(updated);
    localStorage.setItem("savedLocations", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} units={units} toggleUnits={toggleUnits} />
      <main className="container mx-auto px-4 py-8">
        <SearchBar onSearch={handleSearch} />

        {savedLocations.length > 0 && (
          <div className="saved-locations my-4">
            <h3 className="font-semibold mb-2">Saved Locations</h3>
            <div className="flex flex-wrap gap-2">
              {savedLocations.map((city, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <button
                    onClick={() => handleSavedLocationSelect(city)}
                    className={`px-2 py-1 rounded ${
                      displayedCity === city
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
                    }`}
                  >
                    {city}
                  </button>
                  <button
                    onClick={() => removeSavedLocation(city)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && <div className="py-8 text-center">Loading weather data...</div>}
        {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded my-4">{error}</div>}

        {weatherData && !loading && (
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
