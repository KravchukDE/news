# Distribution — Мультиплатформенная дистрибуция контента

Этот раздел объединяет все пайплайны дистрибуции дайджестов в социальные сети.

## Архитектура

```mermaid
flowchart TD
    D[📰 Готовый дайджест<br/>текст из БД] --> P{Платформы}
    
    P --> T[📱 Telegram<br/>Bot API]
    P --> FP[📄 Facebook Page<br/>Graph API]
    P --> FA[👤 Facebook Profile<br/>Patchright]
    P --> IG[📸 Instagram<br/>Изображение + Caption]
    P --> YT[🎬 YouTube<br/>Community / Shorts]
    
    subgraph "Текстовые каналы (API)"
        T
        FP
    end
    
    subgraph "Browser Automation (Patchright)"
        FA
        YT
    end
    
    subgraph "Медиа-пайплайны"
        IG --> IG1[🖼️ Генерация фона<br/>fal.ai + шаблон]
        IG1 --> IG2[✏️ Наложение текста<br/>Sharp / Canvas]
        IG2 --> IG3[📱 Публикация]
        
        VP[🎥 Video Pipeline] --> VP1[🎤 TTS / Озвучка]
        VP1 --> VP2[🎞️ ffmpeg сборка<br/>аудио + визуал]
        VP2 --> VP3[📤 Upload]
        
        AP[🔊 Audio Pipeline] --> AP1[🎤 TTS генерация]
        AP1 --> AP2[🎵 ffmpeg обработка]
        AP2 --> AP3[📤 Подкаст / Upload]
    end

    style D fill:#e3f2fd
    style T fill:#a5d6a7
    style FP fill:#a5d6a7
    style FA fill:#fff9c4
    style IG fill:#f8bbd0
    style YT fill:#ffccbc
    style VP fill:#d1c4e9
    style AP fill:#b2dfdb
```

## Пайплайны

### 1. Текстовые каналы (работают)

| Канал | Метод | Статус |
|-------|-------|--------|
| Telegram (@alexkrol) | Bot API, авто-разбивка >4096 символов | ✅ Работает |
| Facebook Page (Alex Krol) | Graph API, Page Access Token | ✅ Работает |
| Facebook Profile | Patchright, отдельный Chromium | ✅ Тестируется |

### 2. Instagram Pipeline (в разработке)

Генерация уникального изображения + публикация.

**Этапы:** Claude → промпт + заголовок → fal.ai (Recraft V3) → Sharp (текст) → Instagram API

**Подробнее:** [instagram/README.md](../instagram/README.md)

### 3. Video Pipeline (планируется)

Генерация коротких видео из дайджеста для YouTube Shorts / Reels / TikTok.

**Концепция:**
- TTS озвучка текста (голос, интонация)
- Визуальный ряд: слайды с ключевыми тезисами + фоновые изображения
- Сборка через ffmpeg (локально)
- Длительность: 60-90 секунд

**Подробнее:** [video/README.md](video/README.md)

### 4. Audio Pipeline (планируется)

Аудиоверсия дайджеста для подкастов.

**Концепция:**
- TTS озвучка полного текста дайджеста
- Музыкальная подложка (intro/outro)
- Сборка через ffmpeg
- Публикация: подкаст-платформы, Telegram voice

**Подробнее:** [audio/README.md](audio/README.md)

## Последовательность публикации

```mermaid
sequenceDiagram
    participant U as 👤 Пользователь
    participant D as 📊 Dashboard
    participant S as 🖥️ VPS Server
    participant M as 💻 Mac (локально)
    
    U->>D: Нажимает "Опубликовать"
    D->>S: POST /api/digests/:id/publish
    
    par Мгновенная публикация
        S->>S: Telegram Bot API → канал
        S->>S: Facebook Graph API → Page
    end
    
    S-->>D: {telegram: ✅, facebook: ✅}
    D-->>U: "Опубликовано в TG + FB Page"
    
    Note over M: Через 2-5 минут (watcher)
    M->>S: GET /api/digests (проверка новых)
    M->>M: Patchright → Facebook Profile
    M-->>U: 🔔 "Опубликовано в FB Profile"
    
    Note over M: Instagram (будет)
    M->>M: Claude → заголовок + промпт
    M->>M: fal.ai → изображение
    M->>M: Sharp → текст на картинке
    M->>M: Instagram API → публикация
    M-->>U: 🔔 "Опубликовано в Instagram"
```

## Общие компоненты

| Компонент | Где | Для чего |
|-----------|-----|----------|
| fal.ai | Облако | Генерация изображений |
| Sharp | Локально (Mac/VPS) | Обработка изображений, наложение текста |
| ffmpeg | Локально (Mac) | Сборка видео и аудио |
| Patchright | Локально (Mac) | Browser automation для FB/Instagram/YouTube |
| Claude API | Облако | Генерация промптов, заголовков, caption |

## Структура папок

```
distribution/
├── README.md          # Этот файл
├── video/             # Video Pipeline
│   └── README.md
└── audio/             # Audio Pipeline
    └── README.md

instagram/             # Instagram Pipeline (отдельно, т.к. уже развёрнут)
├── README.md
├── templates/
├── output/
├── src/
└── fonts/
```
