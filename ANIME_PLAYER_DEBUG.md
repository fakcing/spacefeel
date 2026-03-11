# 🎬 Anime Player - Отладка переключения серверов

## Проблема
Кнопки переключения серверов могут не работать, если:
1. Сервера не загружаются
2. Все сервера недоступны
3. Нет iframe URL

## Решение

### 1. Проверка в консоли

Откройте консоль браузера (F12) и проверьте логи:

```javascript
Fetching servers for shikimoriId: 52991
Received servers: [...]
Available servers: [...]
Setting default server: {...}
Switching to server: yummy
```

### 2. Проверка доступности серверов

Если вы видите `Available servers: []`, значит ни один сервер не вернул данные.

**Причины:**
- API источники недоступны
- Неправильный Shikimori ID
- Блокировки CORS

### 3. Тестовый компонент

Используйте тестовый компонент для проверки:

```tsx
import AnimePlayerTest from '@/components/anime/AnimePlayerTest'

// Добавьте на страницу
<AnimePlayerTest />
```

### 4. Проверка URL серверов

Проверьте, что URL серверов корректны:

**Yummy Anime:**
```
https://yummyanime.net/embed/{shikimoriId}
```

**AniLibria:**
```
https://anilibria.top/api/v1/player/{animeId}
```

**AnimeVost:**
```
https://animevost.org/hls/{id}/episode/{ep}/playlist.m3u8
```

### 5. Ручное переключение

Если кнопки не работают, проверьте в консоли:

```javascript
// Проверка состояния
window.debugPlayer = {
  servers: [...], // текущие сервера
  activeServer: 'yummy', // активный сервер
  available: servers.filter(s => s.available) // доступные сервера
}
```

### 6. Исправление проблем

#### Сервера не загружаются:
- Проверьте `lib/animePlayerService.ts`
- Убедитесь, что API endpoints доступны
- Проверьте CORS политики

#### Кнопки не переключаются:
- Проверьте `handleServerChange()` в `AnimePlayer.tsx`
- Убедитесь, что `server.available === true`
- Проверьте console.log/warn

#### Iframe не загружается:
- Проверьте URL iframe в консоли
- Откройте URL в новой вкладке
- Проверьте, не блокируется ли контент

### 7. Быстрая проверка

```javascript
// В консоли браузера
fetch('/api/anime/servers?shikimoriId=52991')
  .then(r => r.json())
  .then(d => console.log('Servers:', d))
```

## Структура данных сервера

```typescript
{
  server: 'yummy' | 'libria' | 'vost',
  name: 'Yummy (Main)',
  iframe: 'https://...',
  translations: [{ id: 1, name: 'Yummy', type: 'sub' }],
  episodes: [{ episode: 1, title: 'Episode 1' }],
  available: true
}
```

## Чек-лист

- [ ] Консоль показывает "Received servers"
- [ ] Хотя бы один сервер имеет `available: true`
- [ ] Кнопки серверов рендерятся
- [ ] Кнопки имеют правильный `onClick` handler
- [ ] `activeServer` обновляется при клике
- [ ] Iframe URL корректный
- [ ] Нет ошибок CORS в консоли

## Контакты

Если проблема не решена, проверьте:
1. Browser Console (F12)
2. Network tab (проверьте запросы к API)
3. React DevTools (проверьте state компонента)
