


const feedListElement = document.getElementById('feed-list');
const currentTemperature = document.getElementById('current-temperature');
const currentDescription = document.getElementById('current-description');
const currentWind = document.getElementById('current-wind');
const currentHumidity = document.getElementById('current-humidity');
const forecastGrid = document.getElementById('forecast-grid');
const weatherApiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=48.2&longitude=16.37&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_80m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&current_weather=true&timezone=Europe/Vienna';

// Der Eigentliche RSS Feed Code.
//Wurde von KI abgeändert, um auch RSS2 Feeds zu unterstützen.
//ORF und DerStandard gehen auf jeden fall einmal


window.addEventListener('DOMContentLoaded', () => {
    loadFeeds();
    loadWeather();
});

async function loadFeeds() {
    const urls = await loadFeedUrls();
    if (!urls.length) return;

    feedListElement.innerHTML = '';

    const feedResults = await Promise.all(urls.map(async url => ({ url, feed: await fetchFeed(url) })));
    feedResults.forEach(({ url, feed }) => {
        if (!feed || !feed.items.length) return;
        renderFeedItem(feed, url);
    });
}

async function loadFeedUrls() {
    try {
        const response = await fetch('RSSFeeds.json');
        const data = await response.json();
        if (!Array.isArray(data)) return [];
        return data.map(normalizeUrl).filter(Boolean);
    } catch (error) {
        console.warn('Unable to read RSSFeeds.json', error);
        return [];
    }
}

function normalizeUrl(value) {
    return String(value || '').trim();
}

async function fetchFeed(url) {
    const data = await fetchRssJson(url);
    if (!data || data.status !== 'ok') return null;

    return {
        title: data.feed?.title || url,
        items: (Array.isArray(data.items) ? data.items.slice(0, 10) : []).map(item => ({
            title: item.title || 'Untitled article',
            link: item.link || item.guid || url,
        })),
    };
}

async function fetchRssJson(url) {
    const endpoints = [
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://api.allorigins.cf/raw?url=${encodeURIComponent(url)}`,
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) continue;

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                return await response.json();
            }

            const text = await response.text();
            if (!text) continue;

            if (endpoint.includes('rss2json.com')) {
                try {
                    return JSON.parse(text);
                } catch (error) {
                    continue;
                }
            }

            const xmlDoc = new DOMParser().parseFromString(text, 'application/xml');
            if (xmlDoc.querySelector('parsererror')) continue;

            return parseXmlFeed(xmlDoc);
        } catch (error) {
            continue;
        }
    }

    return null;
}

function parseXmlFeed(xmlDoc) {
    const title = xmlDoc.querySelector('channel > title')?.textContent || xmlDoc.querySelector('feed > title')?.textContent || '';
    const itemNodes = Array.from(xmlDoc.querySelectorAll('item, entry'));
    const items = itemNodes.map(node => ({
        title: node.querySelector('title')?.textContent?.trim() || 'Untitled article',
        link: getEntryLink(node),
    }));
    return { status: 'ok', feed: { title }, items };
}

function getEntryLink(node) {
    const linkHref = node.querySelector('link[href]');
    if (linkHref) return linkHref.getAttribute('href');

    const linkText = node.querySelector('link')?.textContent?.trim();
    if (linkText && /^https?:\/\//.test(linkText)) return linkText;

    return node.querySelector('guid')?.textContent?.trim() || '#';
}

function renderFeedItem(feed, url) {
    const feedItem = document.createElement('li');
    feedItem.className = 'block-item';

    const titleElement = document.createElement('h2');
    titleElement.textContent = feed.title || url;
    feedItem.appendChild(titleElement);

    const entries = document.createElement('ul');
    entries.className = 'entry-list';

    feed.items.forEach(item => {
        const entryNode = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.link || '#';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.title;
        entryNode.appendChild(link);
        entries.appendChild(entryNode);
    });

    feedItem.appendChild(entries);
    feedListElement.appendChild(feedItem);
}

//RSSFeed End













async function loadWeather() {
    const weatherData = await fetchWeather();
    if (!weatherData) return;

    renderCurrentWeather(weatherData);
    renderForecast(weatherData);
}

async function fetchWeather() {
    try {
        const response = await fetch(weatherApiUrl);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.warn('Weather fetch failed', error);
        return null;
    }
}

function renderCurrentWeather(data) {
    const current = data.current_weather;
    const hourlyTimes = data.hourly?.time || [];
    const currentHourIndex = current?.time
        ? hourlyTimes.findIndex(time => time.startsWith(current.time.slice(0, 13)))
        : -1;
    const apparentTemp = currentHourIndex >= 0 ? data.hourly.apparent_temperature[currentHourIndex] : null;
    const precip = currentHourIndex >= 0 ? data.hourly.precipitation_probability[currentHourIndex] : null;
    const description = weatherCodeText(current?.weathercode);

    currentTemperature.textContent = current?.temperature ? `${Math.round(current.temperature)}°C` : '--';
    currentDescription.textContent = description;
    currentWind.textContent = current?.windspeed ? `Wind ${Math.round(current.windspeed)} km/h` : 'Wind —';
    currentHumidity.textContent = apparentTemp !== null ? `Feels like ${Math.round(apparentTemp)}°` : 'Feels like —';
}

function renderForecast(data) {
    if (!forecastGrid) return;
    forecastGrid.innerHTML = '';

    const daily = data.daily || {};
    const days = daily.time || [];
    const maxTemps = daily.temperature_2m_max || [];
    const minTemps = daily.temperature_2m_min || [];
    const weatherCodes = daily.weathercode || [];
    const precipMax = daily.precipitation_probability_max || [];

    const forecastDays = days.slice(1, 7);
    for (let i = 0; i < 6; i += 1) {
        const dayIndex = i + 1;
        const date = forecastDays[i] || days[dayIndex] || '';
        const card = document.createElement('div');
        card.className = 'forecast-card';

        const dayLabel = document.createElement('h3');
        dayLabel.textContent = formatDateLabel(date);
        card.appendChild(dayLabel);

        const tempLabel = document.createElement('div');
        tempLabel.className = 'forecast-temp';
        const maxTemp = maxTemps[dayIndex];
        const minTemp = minTemps[dayIndex];
        tempLabel.textContent = maxTemp !== undefined && minTemp !== undefined ? `${Math.round(maxTemp)}° / ${Math.round(minTemp)}°` : '--';
        card.appendChild(tempLabel);

        const weatherText = document.createElement('div');
        weatherText.className = 'forecast-detail';
        weatherText.textContent = weatherCodeText(weatherCodes[dayIndex]);
        card.appendChild(weatherText);

        const precipText = document.createElement('div');
        precipText.className = 'forecast-detail';
        precipText.textContent = precipMax[dayIndex] !== undefined ? `Rain ${Math.round(precipMax[dayIndex])}%` : 'Rain —';
        card.appendChild(precipText);

        forecastGrid.appendChild(card);
    }
}

function formatDateLabel(value) {
    if (!value) return 'Unknown';
    const date = new Date(value);
    return date.toLocaleDateString('de-AT', { weekday: 'short', day: 'numeric' });
}

function weatherCodeText(code) {
    const map = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Freezing drizzle',
        57: 'Freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with heavy hail',
    };
    return map[Number(code)] || 'Unknown weather';
}
