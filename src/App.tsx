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
  const [currentLocation, setCurrentLocation] = useState<string>("");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  // Toggle units
  const toggleUnits = () => {
    const newUnits = units === "metric" ? "imperial" : "metric";
    setUnits(newUnits);
    localStorage.setItem("units", newUnits);

    // Refresh weather for current location with new units
    if (currentLocation) fetchWeatherData(currentLocation, newUnits);
  };

  // Fetch weather by location or coordinates
  const fetchWeatherData = async (location: string, unitSystem = units) => {
    try {
      setLoading(true);
      setError(null);

      const weatherResponse = await getWeatherByCity(location, unitSystem);
      setWeatherData(weatherResponse);
      setCurrentLocation(location);

      const forecastResponse = await getForecast(location, unitSystem);
      setForecastData(forecastResponse);

      if (!savedLocations.includes(location)) {
        const updatedLocations = [...savedLocations, location];
        setSavedLocations(updatedLocations);
        localStorage.setItem(
          "savedLocations",
          JSON.stringify(updatedLocations)
        );
      }
    } catch (err) {
      setError(`Failed to fetch weather data for ${location}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // On initial load, get user location
  useEffect(() => {
    const getLocationWeather = async () => {
      try {
        setLoading(true);

        if (!navigator.geolocation)
          throw new Error("Geolocation not supported");

        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            })
        );

        const { latitude, longitude } = position.coords;

        const weatherResponse = await getWeatherByCoords(
          latitude,
          longitude,
          units
        );
        setWeatherData(weatherResponse);
        setCurrentLocation(weatherResponse.name);

        const forecastResponse = await getForecastByCoords(
          latitude,
          longitude,
          units
        );
        setForecastData(forecastResponse);

        if (!savedLocations.includes(weatherResponse.name)) {
          const updatedLocations = [...savedLocations, weatherResponse.name];
          setSavedLocations(updatedLocations);
          localStorage.setItem(
            "savedLocations",
            JSON.stringify(updatedLocations)
          );
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching geolocation weather:", err);
        // Fallback to default location
        fetchWeatherData("Polokwane,ZA", units);
      } finally {
        setLoading(false);
      }
    };

    getLocationWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search handler
  const handleSearch = (location: string) => fetchWeatherData(location);

  // Saved location select handler
  const handleSavedLocationSelect = (location: string) =>
    fetchWeatherData(location);

  // Remove saved location
  const removeSavedLocation = (location: string) => {
    const updatedLocations = savedLocations.filter((loc) => loc !== location);
    setSavedLocations(updatedLocations);
    localStorage.setItem("savedLocations", JSON.stringify(updatedLocations));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        units={units}
        toggleUnits={toggleUnits}
      />

      <main className="container mx-auto px-4 py-8">
        <SearchBar onSearch={handleSearch} />

        {savedLocations.length > 0 && (
          <div className="saved-locations my-4">
            <h3 className="font-semibold mb-2">Saved Locations</h3>
            <div className="flex flex-wrap gap-2">
              {savedLocations.map((location, index) => (
                <div key={index} className="flex items-center gap-1">
                  <button
                    onClick={() => handleSavedLocationSelect(location)}
                    className={`px-2 py-1 rounded ${
                      currentLocation === location
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
                    }`}
                  >
                    {location}
                  </button>
                  <button
                    onClick={() => removeSavedLocation(location)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="py-8 text-center">Loading weather data...</div>
        )}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded my-4">
            {error}
          </div>
        )}

        {weatherData && !loading && (
          <div className="weather-container mt-4">
            <CurrentWeather data={weatherData} units={units} />
            {forecastData && (
              <Forecast data={forecastData} units={units} showHourly={true} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
