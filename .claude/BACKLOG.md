# Backlog

## В работе

### Instagram Pipeline
- [ ] Исследование сервисов генерации изображений (img2img, style reference)
- [ ] Создание 2 шаблонов-референсов
- [ ] Скрипт генерации изображений (шаблон + промпт → картинка)
- [ ] Наложение текста на изображение (Sharp/Canvas, кириллица)
- [ ] Публикация в Instagram (API или Patchright)
- [ ] Разбивка длинного caption → комментарии
- Документация: `docs/instagram-pipeline.md`, `docs/research-image-generation.md`

## Запланировано

### YouTube Community Posts
- [ ] Исследовать Patchright-подход (аналог Facebook Profile)
- [ ] Тестирование на тестовом аккаунте
- YouTube Data API не поддерживает Community Posts — только browser automation

### Facebook Profile — переход на боевой аккаунт
- [ ] Месяц тестирования на тестовом аккаунте (апрель-май 2026)
- [ ] При успехе: переключить fb-publish.js на боевой аккаунт
- [ ] Мониторинг реакции Facebook (блокировки, ограничения)

### Аналитика публикаций
- [ ] Facebook: likes, comments, shares через Graph API
- [ ] Telegram: views, forwards через Bot API
- [ ] Dashboard: колонка с метриками

### Токены и обслуживание
- [ ] Facebook Page Token: автообновление (истекает ~60 дней)
- [ ] Мониторинг: алерт если токен истёк
- [ ] GitHub Actions deploy: настроить git repo на VPS или SCP-based deploy

### Полная автоматизация
- [ ] Автопубликация сразу после генерации (без кнопки на дашборде)
- [ ] Настраиваемое расписание публикаций (не сразу, а в определённое время)

### Мультиплатформенный формат
- [ ] Адаптация текста под каждую платформу (Telegram markdown, FB plain, Instagram caption)
- [ ] Разные длины для разных платформ

## Завершено

- [x] Telegram бот для приёма URL
- [x] Claude API генерация дайджестов (2-фазная)
- [x] Dashboard (news.questtales.com)
- [x] Публикация в Telegram канал (Bot API, split)
- [x] Публикация на Facebook Page (Graph API)
- [x] Публикация в Facebook Profile (Patchright, тестовый аккаунт)
- [x] Local-fetcher для обогащения контента (Chrome + AppleScript)
- [x] Документация (Telegram, Facebook Page, Facebook Profile)
