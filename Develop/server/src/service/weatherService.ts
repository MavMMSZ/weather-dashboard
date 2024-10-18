import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define an interface for the Weather object
class Weather {
  temperature: number;
  windSpeed: number;
  humidity: number;

  constructor(temperature: number, windSpeed: number, humidity: number) {
    this.temperature = temperature;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// Define a class for the WeatherService
class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private city?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }

  private async fetchLocationData(query: string): Promise<Coordinates | null> {
    try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const locationData = await response.json();
      return locationData;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  }

  private destructureLocationData(locationData: Coordinates | null): Coordinates | null {
    if (!locationData) return null;
    const { lat, lon } = locationData;
    return { lat, lon };
  }

  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geocode?apikey=${this.apiKey}&location=${this.city}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/weather?apikey=${this.apiKey}&lat=${coordinates.lat}&lon=${coordinates.lon}`;
  }

  private async fetchAndDestructureLocationData(): Promise<Coordinates | null> {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates));
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.log('Error fetching weather data:', error);
      return null;
    }
  }

  private parseCurrentWeather(response: any): Weather | null {
    if (!response?.data || response.data.length === 0) return null;
    const { temperature, wind_speed, humidity } = response.data[0];
    return new Weather(temperature, wind_speed, humidity);
  }

  private buildForecastArray(weatherData: any[]): any[] {
    return weatherData.map((weather) => {
      const { valid_date, max_temp, min_temp, wind_spd, pop } = weather;
      return {
        date: valid_date,
        maxTemperature: max_temp,
        minTemperature: min_temp,
        windSpeed: wind_spd,
        pop: pop,
      };
    });
  }

  async getWeatherForCity(city: string) {
    this.city = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    
    if (!coordinates) {
      throw new Error('Could not retrieve coordinates for the city');
    }

    const weatherData = await this.fetchWeatherData(coordinates);
    if (!weatherData) {
      throw new Error('Could not retrieve weather data');
    }

    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(weatherData.data);
    return { currentWeather, forecastArray };
  }
}

export default new WeatherService();
