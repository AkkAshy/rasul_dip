# Uzum API — разведка

Дата: 2026-05-08

## TL;DR

| Эндпоинт | Метод | Статус | Что отдаёт |
|---|---|---|---|
| `https://api.uzum.uz/api/v2/product/{id}` | GET | ✅ 200 | Карточка + `topFeedback` (1 отзыв) |
| `https://graphql.uzum.uz/` | POST | ❌ 401 (`x-ext-authz-check-result: denied`) | Требует токен |
| `https://uzum.uz/uz/product/{id}` | GET | ⚠️ Yandex SmartCaptcha | Только через браузер |
| `/api/v1/product/{id}` | GET | 404 | Старый API убран |
| `/api/v2/product/{id}/feedback` (и 10+ вариантов) | GET | 404 | Публичного REST для списка отзывов нет |

## Структура ответа `/api/v2/product/{id}`

```json
{
  "payload": {
    "data": {
      "id": 100,
      "title": "Tova quymoq uchun ushlagich bilan AP \"Mystery\"",
      "localizableTitle": { "uz": "...", "ru": "..." },
      "category": {
        "id": 13322, "title": "Tovalar",
        "parent": { "id": 11390, "title": "Ovqat pishirish ...", "parent": { ... } }
      },
      "rating": 4.9,
      "reviewsAmount": 194,
      "ordersAmount": 729,
      "rOrdersAmount": 729,
      "totalAvailableAmount": 2,
      "description": "<p>...</p>",
      "comments": [],                    // всегда пустой!
      "topFeedback": {                   // <- единственный доступный отзыв
        "content": "Блинница очень удобная...",
        "rating": 5,
        ...
      },
      "skuList": [{ "fullPrice": 405000, ... }],
      "seller": { "id": 21, "title": "Lamart", "rating": 4.8, ... },
      "characteristics": [...],
      "photos": [...]
    }
  }
}
```

## Особенности

1. **JSON может содержать control-символы** в HTML-описаниях (`description`).
   Стандартный `json.loads` падает с `Invalid control character`. Решение — фильтровать
   всё, что меньше пробела (см. `_safe_json` в `scraper/uzum/client.py`).

2. **Цены**: `skuList[0].fullPrice` отдаётся как обычное число в сумах (не тийины).
   Например, `405000` = 405 000 сум.

3. **Отзывы**: `comments: []` всегда пустой массив. Реальный отзыв лежит в `topFeedback`
   (1 шт. на товар). Полный список — только через GraphQL с авторизацией или Playwright.

4. **CDN/CORS**: API ожидает `Origin: https://uzum.uz` и `Referer: https://uzum.uz/`.
   Без них может прилететь 403.

5. **SmartCaptcha**: HTML-страницы (`uzum.uz/...`) защищены Yandex SmartCaptcha при подозрении
   на бота. API сам по себе под капчей **не находится** — её можно обходить, обращаясь к
   `api.uzum.uz` напрямую.

## Стратегия сбора данных для диплома

**Mass top-feedback collection** — собираем `topFeedback` по большому диапазону `product_id`.
Получаем `1 топ-отзыв × N товаров`. Для датасета это даже лучше чем `M отзывов × 1 товар`,
потому что сильно разнообразнее.

```bash
python manage.py scrape_uzum --bulk --from 1 --to 5000 --min-reviews 10
```

Около 5000 запросов с задержкой 0.5 сек = ~40 минут. На выходе — ~1000-2000 товаров с
top-отзывами на разных языках (uz_lat, uz_cyr, ru, иногда kaa).

## Что не сделано (TODO)

- [ ] **Playwright-клиент** для полного списка отзывов одного товара
  (нужен для глубокого анализа конкретных популярных продуктов)
- [ ] **Поиск/категории** через API — все попытки `/main/search`, `/category/{id}/products`
  возвращают 404. Возможно есть закрытый endpoint, который видно в DevTools браузера —
  надо открыть страницу в Playwright и снять трафик.
- [ ] **Проверка лимитов** — сколько запросов в минуту до блокировки. Сейчас защита
  `rate_delay=0.5s` стоит на всякий случай.
