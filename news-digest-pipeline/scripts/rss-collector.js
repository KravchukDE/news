#!/usr/bin/env node

import { XMLParser } from 'fast-xml-parser';
import https from 'https';
import http from 'http';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_SECRET = process.env.API_SECRET_KEY;

const RSS_SOURCES = [
  { url: 'https://feeds.feedburner.com/TechCrunch/', tag: 'TechCrunch' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', tag: 'Verge-AI' },
  { url: 'https://venturebeat.com/feed/', tag: 'VentureBeat' },
  { url: 'https://www.wired.com/feed/rss', tag: 'Wired' },
];

function fetchUrl(url, redirectCount) {
  redirectCount = redirectCount || 0;
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': 'JUN-RSS-Collector/1.0' },
      timeout: 12000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, redirectCount + 1).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function parseRSS(xmlText) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const result = parser.parse(xmlText);
  const channel = result && result.rss && result.rss.channel;
  if (!channel) return [];
  const items = channel.item || channel.entry || [];
  const arr = Array.isArray(items) ? items : [items];
  return arr.slice(0, 8).map(item => ({
    url: (item.link && item.link['#text']) || item.link || '',
    title: (item.title && item.title['#text']) || item.title || '',
    content: ((item.description && item.description['#text']) || item.description || '').slice(0, 1500),
  })).filter(i => i.url && i.title);
}

async function sendBatch(articles) {
  const body = JSON.stringify({ items: articles });
  return new Promise((resolve, reject) => {
    const urlObj = new URL(API_URL + '/api/articles/batch');
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': 'Bearer ' + API_SECRET,
      },
    };
    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data }); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('[RSS] Старт: ' + new Date().toISOString());
  const allArticles = [];

  for (const source of RSS_SOURCES) {
    try {
      console.log('[RSS] Збираю: ' + source.tag);
      const xml = await fetchUrl(source.url);
      const items = await parseRSS(xml);
      const tagged = items.map(item => ({
        url: item.url,
        title: item.title,
        content: '[' + source.tag + '] ' + item.content,
        source: 'rss-' + source.tag,
      }));
      allArticles.push(...tagged);
      console.log('[RSS] ' + source.tag + ': ' + items.length + ' статей');
    } catch (err) {
      console.error('[RSS] Помилка ' + source.tag + ':', err.message);
    }
  }

  if (allArticles.length === 0) {
    console.log('[RSS] Нічого не зібрано');
    return;
  }

  console.log('[RSS] Всього: ' + allArticles.length + ' статей');

  if (!API_SECRET) {
    console.log('[RSS] TEST MODE — без відправки');
    allArticles.slice(0, 5).forEach(a => console.log(' *', a.title));
    return;
  }

  const result = await sendBatch(allArticles);
  console.log('[RSS] inserted=' + result.inserted + ', duplicates=' + result.duplicates);
}

main().catch(err => { console.error('[RSS] Fatal:', err); process.exit(1); });
