import type { ForecastData } from '../services/weatherApi';

interface ForecastProps {
  data: ForecastData;
  units: 'metric' | 'imperial';
}

const Forecast = ({ data, units }: ForecastProps) => {
  const tempUnit = units === 'metric' ? '°C' : '°F';

  // Group forecast data by day
  const groupByDay = (list: ForecastData['list']) => {
    const grouped = list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, ForecastData['list']>);
    
    return Object.entries(grouped).map(([date, items]) => {
      // Get average values for the day
      const avgTemp = items.reduce((sum, item) => sum + item.main.temp, 0) / items.length;
      const mainWeather = items.find(item => 
        new Date(item.dt * 1000).getHours() >= 12 && 
        new Date(item.dt * 1000).getHours() <= 15
      )?.weather[0] || items[0].weather[0];
      
      return {
        date,
        day: new Date(items[0].dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(avgTemp),
        weather: mainWeather,
        items
      };
    });
  };

  const dailyForecast = groupByDay(data.list).slice(0, 7);
  
  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}.png`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">5-Day Forecast</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {dailyForecast.map((day, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow">
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">{day.day}</div>
            <div className="w-16 h-16 flex justify-center items-center">
              <img 
                src={getWeatherIcon(day.weather.icon)} 
                alt={day.weather.description} 
                className="w-full h-full"
              />
            </div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-2">{day.temp}{tempUnit}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{day.weather.main}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;