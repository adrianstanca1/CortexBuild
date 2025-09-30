import React, { useState, useEffect } from 'react';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock weather data for demo
    setTimeout(() => {
      setWeather({
        location: 'Construction Site',
        temperature: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        icon: '⛅'
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weather</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weather</h3>
        <p className="text-gray-500">Weather data unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Weather</h3>
      
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{weather.icon}</div>
        <div className="text-2xl font-bold text-gray-900">
          {weather.temperature}°C
        </div>
        <div className="text-sm text-gray-600">{weather.condition}</div>
        <div className="text-xs text-gray-500">{weather.location}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">Humidity</div>
          <div className="text-xs text-gray-600">{weather.humidity}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">Wind</div>
          <div className="text-xs text-gray-600">{weather.windSpeed} km/h</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded text-center">
        <div className="text-xs text-blue-800">
          Good conditions for construction work
        </div>
      </div>
    </div>
  );
};