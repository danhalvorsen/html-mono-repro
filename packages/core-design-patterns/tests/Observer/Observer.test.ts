import { describe, expect, it, vi } from 'vitest';
import { TypedSubject, WeatherStation, type WeatherEvents, weatherEventNames } from '../../src/observer/observer.js';

describe('observer pattern', () => {
  it('notifies observers subscribed to one event', () => {
    const subject = new TypedSubject<WeatherEvents>();
    const onTemperature = vi.fn();

    subject.subscribe('temperatureChanged', onTemperature);
    subject.notify('temperatureChanged', { celsius: 21, location: 'Oslo' });

    expect(onTemperature).toHaveBeenCalledTimes(1);
    expect(onTemperature).toHaveBeenCalledWith({ celsius: 21, location: 'Oslo' });
  });

  it('unsubscribe function detaches observer', () => {
    const subject = new TypedSubject<WeatherEvents>();
    const onHumidity = vi.fn();

    const stop = subject.subscribe('humidityChanged', onHumidity);
    stop();

    subject.notify('humidityChanged', { humidity: 45, location: 'Bergen' });
    expect(onHumidity).not.toHaveBeenCalled();
  });

  it('WeatherStation emits domain events', () => {
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

  it('exports valid weather event names', () => {
    expect(weatherEventNames).toEqual(['temperatureChanged', 'humidityChanged']);
  });
});
