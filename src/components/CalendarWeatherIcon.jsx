import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

function CalendarWeatherIcon({ code }) {
  if (code === 0) {
    return <Sun size={15} />;
  }

  if ([1, 2].includes(code)) {
    return <CloudSun size={15} />;
  }

  if (code === 3) {
    return <Cloud size={15} />;
  }

  if ([45, 48].includes(code)) {
    return <CloudFog size={15} />;
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return <CloudDrizzle size={15} />;
  }

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return <CloudRain size={15} />;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <CloudSnow size={15} />;
  }

  if ([95, 96, 99].includes(code)) {
    return <CloudLightning size={15} />;
  }

  return <CloudSun size={15} />;
}

export default CalendarWeatherIcon;