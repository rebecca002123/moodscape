// Real weather, no API key — Open-Meteo. Everything degrades gracefully:
// if the sky can't be reached, the world simply dreams its own weather.

const WMO = [
  [[0], 'clear', 'Clear', '☀️'],
  [[1, 2], 'clear', 'Mostly clear', '🌤️'],
  [[3], 'clouds', 'Overcast', '☁️'],
  [[45, 48], 'fog', 'Fog', '🌫️'],
  [[51, 53, 55, 56, 57], 'drizzle', 'Drizzle', '🌦️'],
  [[61, 63, 65, 66, 67, 80, 81, 82], 'rain', 'Rain', '🌧️'],
  [[71, 73, 75, 77, 85, 86], 'snow', 'Snow', '❄️'],
  [[95, 96, 99], 'storm', 'Storm', '⛈️'],
];

export function mapWeatherCode(code) {
  for (const [codes, type, label, emoji] of WMO) {
    if (codes.includes(code)) return { type, label, emoji };
  }
  return { type: 'clear', label: 'Clear', emoji: '☀️' };
}

export async function fetchWeather(lat, lon) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m`;
    const res = await fetch(url, { signal: ctrl.signal });
    const json = await res.json();
    const code = json?.current?.weather_code;
    const temp = json?.current?.temperature_2m;
    if (code === undefined) return null;
    return { ...mapWeatherCode(code), temp };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
