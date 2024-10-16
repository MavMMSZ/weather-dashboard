import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object//
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object//
class Weather {
  temp: number;
  humidity: number;
  wind: number;
  constructor(temp: number, humidity: number, wind: number) {
    this.temp = temp;
    this.humidity = humidity;
    this.wind = wind;
  }
}


// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName: string;
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    const response = await fetch(query);
    const locationData = await response.json();
    return locationData;
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { lat, lon } = locationData;
    return { lat, lon };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geocode/v1/json?q=${this.cityName}&key=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinat/es: Coordinates): string {
    const { lat, lon } = coordinates;
    return `${this.baseURL}/weather/v1/current.json?key=${this.apiKey}&q=${lat},${lon}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const query = this.buildWeatherQuery(coordinates);
    const response = await fetch(query);
    const weatherData = await response.json();
    return weatherData;
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const { current } = response;
    const { temp_f, humidity, wind_mph } = current;
    return new Weather(temp_f, humidity, wind_mph);
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecastArray = weatherData.map((weather) => {
      const { temp_f, humidity, wind_mph } = weather;
      return new Weather(temp_f, humidity, wind_mph);
    });
    return forecastArray;
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.forecast.forecastday);
    return { currentWeather, forecastArray };
  }
}

export default new WeatherService();
