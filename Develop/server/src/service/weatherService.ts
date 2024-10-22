import dotenv from 'dotenv';
dotenv.config();

// Define Coordinates interface
interface Coordinates {
  lat: number;
  lon: number;
  name: string;
  country: string;
  state: string;
}

// Define the Weather class
class Weather {
  cityName: string;
  date: string;
  icon: string;
  description: string;
  temp: number;
  humidity: number;
  wind: number;

  constructor(
    cityName: string,
    date: string,
    icon: string,
    description: string,
    temp: number,
    humidity: number,
    wind: number
  ) {
    this.cityName = cityName;
    this.date = date;
    this.icon = icon;
    this.description = description;
    this.temp = temp;
    this.humidity = humidity;
    this.wind = wind;
  }
}

// WeatherService class
class WeatherService {
  baseURL?: string;
  apiKey?: string;
  cityName?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }

  // Fetch location data based on city name
  private async fetchLocationData() {
    try {
      const response = await fetch(this.buildGeocodeQuery());
      const locationData = await response.json();
      return locationData;
    } catch (error) {
      console.log('Error', error);
      return '';
    }
  }

  // Extract coordinates from location data
  private destructureLocationData(locationData: Coordinates): Coordinates {
    if (!locationData) {
      throw new Error('city not found');
    }
    const { lat, lon, name, country, state } = locationData;
    return { name, lat, lon, country, state };
  }

  // Build geocode query for fetching city coordinates
  private buildGeocodeQuery(): string {
    const apiKey = process.env.API_KEY;
    return `https://api.openweathermap.org/geo/1.0/direct?q=${this.cityName}&appid=${apiKey}`;
  }

  // Build weather query for fetching 5-day forecast
  private buildWeatherQuery(coordinates: Coordinates): string {
    const apiKey = process.env.API_KEY;
    // Add units=metric for temperature in Celsius, remove exclude
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${apiKey}`;
  }

  // Fetch and destructure location data
  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData();
    return this.destructureLocationData(locationData[0]);
  }

  // Fetch weather data (5-day forecast)
  private async fetchWeatherData(coordinates: Coordinates) {
    const query = this.buildWeatherQuery(coordinates);
    try {
      const response = await fetch(query);
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to fetch weather data');
    } catch (error) {
      console.log(error);
    }
  }

  // Parse current weather from the forecast response
  private parseCurrentWeather(response: any): Weather {
    console.log(response);

    if (!response || !response.city || !response.list || !Array.isArray(response.list)) {
      throw new Error("Invalid response structure");
    }

    const { name: cityName } = response.city;
    const currentWeatherData = response.list[0];

    const {
      dt_txt: date, // Date and time of the forecast
      main: { temp, humidity },
      weather = [{ description: "No description", icon: "" }],
      wind: { speed: windSpeed }
    } = currentWeatherData;

    const { description, icon } = weather[0];

    return new Weather(cityName, date, icon, description, temp, humidity, windSpeed);
  }

  // Build forecast array from the weather data
  private buildForecastArray(_currentWeather: Weather, weatherData: any[]): Weather[] {
    const forecastArray: Weather[] = [];
    for (let i = 1; i < weatherData.length; i++) {
      const {
        dt_txt: date,
        main: { temp, humidity },
        weather = [{ description: 'No description', icon: '' }],
        wind: { speed: windSpeed },
      } = weatherData[i];

      const { description, icon } = weather[0];
      const forecast = new Weather(this.cityName || '', date, icon, description, temp, humidity, windSpeed);
      forecastArray.push(forecast);
    }
    return forecastArray;
  }

  // Fetch weather for a given city
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);

    // Ensure weatherData is properly fetched
    if (!weatherData || !weatherData.list) {
      throw new Error('Failed to fetch weather data');
    }

    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.list); 

    return { currentWeather, forecastArray };
  }
}

export default new WeatherService();
