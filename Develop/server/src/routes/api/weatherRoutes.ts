import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  const { city } = req.body;
  const weatherData = WeatherService.getWeatherForCity(city);
  res.json(weatherData);
  // TODO: save city to search history
  HistoryService.addCity(city);
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  const cities = await HistoryService.getCities();
  res.json(cities);
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await HistoryService.removeCity(id);
  res.sendStatus(204);
});

export default router;
