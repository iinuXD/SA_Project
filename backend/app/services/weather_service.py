import httpx
from typing import Optional

# KKU Khon Kaen coordinates
KKU_LAT = 16.4748
KKU_LNG = 102.8196

WEATHER_CODES = {
    0: {"th": "ท้องฟ้าแจ่มใส", "en": "Clear sky", "icon": "☀️"},
    1: {"th": "ส่วนใหญ่แจ่มใส", "en": "Mainly clear", "icon": "🌤️"},
    2: {"th": "มีเมฆบางส่วน", "en": "Partly cloudy", "icon": "⛅"},
    3: {"th": "มีเมฆมาก", "en": "Overcast", "icon": "☁️"},
    45: {"th": "มีหมอก", "en": "Foggy", "icon": "🌫️"},
    48: {"th": "มีน้ำค้างแข็ง", "en": "Icy fog", "icon": "🌫️"},
    51: {"th": "ฝนปรอยเบา", "en": "Light drizzle", "icon": "🌦️"},
    53: {"th": "ฝนปรอย", "en": "Drizzle", "icon": "🌦️"},
    55: {"th": "ฝนปรอยหนัก", "en": "Heavy drizzle", "icon": "🌧️"},
    61: {"th": "ฝนเบา", "en": "Light rain", "icon": "🌧️"},
    63: {"th": "ฝนปานกลาง", "en": "Moderate rain", "icon": "🌧️"},
    65: {"th": "ฝนหนัก", "en": "Heavy rain", "icon": "⛈️"},
    80: {"th": "ฝนพรำเบา", "en": "Light showers", "icon": "🌦️"},
    81: {"th": "ฝนพรำ", "en": "Showers", "icon": "🌧️"},
    82: {"th": "ฝนพรำหนัก", "en": "Heavy showers", "icon": "⛈️"},
    95: {"th": "พายุฝนฟ้าคะนอง", "en": "Thunderstorm", "icon": "⛈️"},
    96: {"th": "พายุฝนฟ้าคะนองเล็กน้อย", "en": "Thunderstorm with hail", "icon": "⛈️"},
    99: {"th": "พายุรุนแรง", "en": "Severe thunderstorm", "icon": "🌩️"},
}


async def get_kku_weather() -> dict:
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={KKU_LAT}&longitude={KKU_LNG}"
        f"&current=temperature_2m,relative_humidity_2m,weathercode,windspeed_10m"
        f"&hourly=temperature_2m,weathercode"
        f"&forecast_days=1"
        f"&timezone=Asia%2FBangkok"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    current = data.get("current", {})
    code = current.get("weathercode", 0)
    weather_info = WEATHER_CODES.get(code, {"th": "ไม่ทราบ", "en": "Unknown", "icon": "❓"})

    return {
        "temperature": current.get("temperature_2m"),
        "humidity": current.get("relative_humidity_2m"),
        "windspeed": current.get("windspeed_10m"),
        "weathercode": code,
        "description_th": weather_info["th"],
        "description_en": weather_info["en"],
        "icon": weather_info["icon"],
        "location": "มหาวิทยาลัยขอนแก่น",
    }
