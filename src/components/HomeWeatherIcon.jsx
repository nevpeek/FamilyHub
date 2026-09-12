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

function HomeWeatherIcon({
  code,
  size = 28,
}) {
  if (code === 0) {
    return <Sun size={size} />;
  }

  if ([1, 2].includes(code)) {
    return <CloudSun size={size} />;
  }

  if (code === 3) {
    return <Cloud size={size} />;
  }

  if ([45, 48].includes(code)) {
    return <CloudFog size={size} />;
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return <CloudDrizzle size={size} />;
  }

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(
      code
    )
  ) {
    return <CloudRain size={size} />;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <CloudSnow size={size} />;
  }

  if ([95, 96, 99].includes(code)) {
    return <CloudLightning size={size} />;
  }

  return <CloudSun size={size} />;
}

export default HomeWeatherIcon;