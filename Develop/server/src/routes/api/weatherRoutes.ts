import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  try {
    const { city } = req.body;
    const weather = await WeatherService.getWeatherByCity(city);
    res.status(200).json(weather);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
  // TODO: save city to search history
  try {
    const { city } = req.body;
    await HistoryService.saveCity(city);
  }
  catch (error) {
    console.log(error.message);
  }
});

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = await HistoryService.getHistory();
    res.status(200).json(history);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await HistoryService.deleteCity(id);
    res.status(200).json({ message: 'City deleted from history' });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
