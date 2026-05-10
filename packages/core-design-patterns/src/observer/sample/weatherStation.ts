import { TypedSubject } from "../TypedSubject.js";

export type WeatherEvents = {
  temperatureChanged: { celsius: number; location: string };
  humidityChanged: { humidity: number; location: string };
};

export class WeatherStation extends TypedSubject<WeatherEvents> {
  public setTemperature(celsius: number, location: string): void {
    this.notify('temperatureChanged', { celsius, location });
  }

  public setHumidity(humidity: number, location: string): void {
    this.notify('humidityChanged', { humidity, location });
  }
}

export const weatherEventNames = ['temperatureChanged', 'humidityChanged'] as const satisfies readonly (keyof WeatherEvents)[];

