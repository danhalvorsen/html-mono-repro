import { describe, expect, it, vi } from 'vitest';
import {
  WeatherStation,
  weatherEventNames,
  type WeatherEvents
} from '../../src/observer/sample/weatherStation.js';

describe('observer sample weather station', () => {
  it('should emit temperature and humidity domain events', () => {
    const station = new WeatherStation();
    const onTemperature = vi.fn();
    const onHumidity = vi.fn();

    station.subscribe('temperatureChanged', onTemperature);
    station.subscribe('humidityChanged', onHumidity);

    station.setTemperature(18, 'Trondheim');
    station.setHumidity(60, 'Trondheim');

    expect(onTemperature).toHaveBeenCalledWith({ celsius: 18, location: 'Trondheim' });
    expect(onHumidity).toHaveBeenCalledWith({ humidity: 60, location: 'Trondheim' });
  });

  it('should expose valid event name constants', () => {
    const expected: readonly (keyof WeatherEvents)[] = [
      'temperatureChanged',
      'humidityChanged'
    ];

    expect(weatherEventNames).toEqual(expected);
  });
});
