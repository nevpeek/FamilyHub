import { CloudSun } from "lucide-react";

import HomeWeatherIcon from "./HomeWeatherIcon";
import {
  getGreeting,
  getWeatherDescription,
} from "../utils/homeUtils";

function HomeHeader({
  currentTime,
  homeDayHeading,
  weather,
  weatherLoading,
}) {
  return (
    <section className="page-title-row">
      <div>
        <p className="section-kicker">
          {homeDayHeading}
        </p>

        <h2>
          {getGreeting(currentTime)}
        </h2>

        <p className="page-description home-today-date">
          {new Intl.DateTimeFormat(
            "en-AU",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
            }
          ).format(currentTime)}
        </p>
      </div>

      <div className="home-header-actions">
        <div className="home-weather">
          {weather?.current ? (
            <HomeWeatherIcon
              code={
                weather.current.weatherCode
              }
            />
          ) : (
            <CloudSun size={28} />
          )}

          <div>
            <strong>
              {weatherLoading
                ? "--°"
                : weather?.current
                  ? `${Math.round(
                      weather.current
                        .temperature
                    )}°`
                  : "--°"}
            </strong>

            <span>
              {weather?.current
                ? `${getWeatherDescription(
                    weather.current
                      .weatherCode
                  )} · Feels ${Math.round(
                    weather.current
                      .apparentTemperature
                  )}°`
                : "Gawler"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHeader;