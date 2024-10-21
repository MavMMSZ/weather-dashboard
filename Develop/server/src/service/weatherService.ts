import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  stateId: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  constructor(
    city: string,
    stateId: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number,
  ) {
    this.city = city;
    this.stateId = stateId;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  baseURL?: string;
  apiKey?: string;
  cityName?: string;
  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error('City not found');
      }
      const data = await response.json();
      return { lat: data[0].lat, lon: data[0].lon };
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { lat, lon } = locationData;
    return { lat, lon };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(this.cityName!)}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    try {
      const geocodeUrl = this.buildGeocodeQuery();
      const locationData = await this.fetchLocationData(geocodeUrl);
      const coordinates = this.destructureLocationData(locationData);
      return coordinates;
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }

  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const weatherQuery = this.buildWeatherQuery(coordinates);
      const response = await fetch(weatherQuery);
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      const weatherData = await response.json();
      return weatherData;
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const city = response.city.name;
    const stateId = response.city.state;
    const date = response.list[0].dt_txt;
    const icon = response.list[0].weather[0].icon;
    const iconDescription = response.list[0].weather[0].description;
    const tempF = response.list[0].main.temp;
    const windSpeed = response.list[0].windSpeed.speed;
    const humidity = response.list[0].main.humidity;
    return new Weather(city, stateId, date, icon, iconDescription, tempF, windSpeed, humidity);
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(_currentWeather: Weather, weatherData: any[]) {
    const forcastArray = [];
    const today = new Date().toLocaleDateString();
    for (let i = 0; i < weatherData.length; i++) {
      const date = new Date(weatherData[i].dt_txt).toLocaleDateString();
      if (date === today) continue;
      const icon = weatherData[i].weather[0].icon;
      const iconDescription = weatherData[i].weather[0].description;
      const tempF = weatherData[i].main.temp;
      const windSpeed = weatherData[i].windSpeed.speed;
      const humidity = weatherData[i].main.humidity;
      forcastArray.push({
        date, icon, iconDescription, tempF, windSpeed, humidity
      });
    }
    return forcastArray;
  }


  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
  this.cityName = city;
  try {
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
    const completeWeather = [currentWeather, ...forecastArray];
    return completeWeather;
  } catch (error) {
    console.log('Error:', error);
    return error;
  }
}
}

export default new WeatherService();
