import type { WeatherData } from '../services/weatherApi';
import { WiThermometer, WiHumidity, WiStrongWind, WiBarometer } from 'react-icons/wi';

interface CurrentWeatherProps {
  data: WeatherData;
  units: 'metric' | 'imperial';
}

const CurrentWeather = ({ data, units }: CurrentWeatherProps) => {
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const speedUnit = units === 'metric' ? 'km/h' : 'mph';

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Current Weather</h2>
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{data.name}, {data.sys.country}</h3>
        </div>
        
        <div className="flex justify-center items-center gap-6">
          <div className="text-center">
            <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">{Math.round(data.main.temp)}</span>
            <span className="text-2xl text-blue-600 dark:text-blue-400">{tempUnit}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <img 
              src={getWeatherIcon(data.weather[0].icon)} 
              alt={data.weather[0].description} 
              className="w-20 h-20"
            />
            <p className="text-lg text-gray-700 dark:text-gray-300">{data.weather[0].main}</p>
          </div>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-gray-600 dark:text-gray-400">Feels like {Math.round(data.main.feels_like)}{tempUnit}</p>
          <div className="flex justify-center gap-4 mt-1">
            <span className="text-blue-500 dark:text-blue-300">L: {Math.round(data.main.temp_min)}{tempUnit}</span>
            <span className="text-red-500 dark:text-red-300">H: {Math.round(data.main.temp_max)}{tempUnit}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <WiHumidity className="text-blue-500 dark:text-blue-300 text-4xl mr-3" />
            <div>
              <span className="block text-lg font-semibold">{data.main.humidity}%</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Humidity</span>
            </div>
          </div>
          
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <WiStrongWind className="text-blue-500 dark:text-blue-300 text-4xl mr-3" />
            <div>
              <span className="block text-lg font-semibold">{Math.round(data.wind.speed)} {speedUnit}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Wind</span>
            </div>
          </div>
          
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <WiBarometer className="text-blue-500 dark:text-blue-300 text-4xl mr-3" />
            <div>
              <span className="block text-lg font-semibold">{data.main.pressure} hPa</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Pressure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;