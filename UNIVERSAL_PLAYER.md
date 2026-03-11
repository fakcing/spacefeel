# 🎬 UniversalPlayer — Универсальный компонент плеера

## Обзор

`UniversalPlayer` — это компонент плеера с поддержкой двух источников видео:
- **Сервер 1 (Yani/Alloha)** — основной источник для аниме
- **Сервер 2 (VideoCDN)** — запасной источник для фильмов, сериалов и аниме

## Особенности

### ✅ Dual-Source поддержка
- Автоматическое переключение между серверами
- Кнопки "Сервер 1" и "Сервер 2" над плеером
- Индикация активного сервера

### ✅ Отказоустойчивость
- Авто-обнаружение таймаута (10 секунд)
- Кнопка "Попробовать запасной сервер" при ошибке
-Graceful fallback между серверами

### ✅ Поддержка типов контента
- **Movies** — фильмы с TMDB
- **TV** — сериалы с сезонами и сериями
- **Anime** — аниме с Shikimori

### ✅ VideoCDN функции
- Выбор качества (1080p, 720p, 480p, etc.)
- Выбор озвучки (субтитры/дубляж)
- Динамическое обновление при переключении

---

## Использование

### Базовый пример (Фильм)

```tsx
import UniversalPlayer from '@/components/anime/UniversalPlayer'

export default function MoviePage() {
  return (
    <UniversalPlayer
      type="movie"
      tmdbId={634649} // Spider-Man: No Way Home
    />
  )
}
```

### Сериал с сезонами

```tsx
<UniversalPlayer
  type="tv"
  tmdbId={1399} // Game of Thrones
  season={1}
  episode={1}
/>
```

### Аниме с Shikimori ID

```tsx
<UniversalPlayer
  type="anime"
  shikimoriId={52991} // Solo Leveling
  episode={1}
/>
```

### С совместным использованием Yani Video

```tsx
// Для аниме с Yani TV + VideoCDN fallback
<UniversalPlayer
  type="anime"
  shikimoriId={52991}
  episode={1}
  yaniVideos={yaniVideos}
  yaniDubbing="AniLibria"
/>
```

---

## Пропсы

| Проп | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `type` | `'movie' \| 'tv' \| 'anime'` | ✅ | Тип контента |
| `tmdbId` | `number` | ❌ | TMDB ID (для movie/tv) |
| `shikimoriId` | `number` | ❌ | Shikimori ID (для anime) |
| `season` | `number` | ❌ | Номер сезона (для tv) |
| `episode` | `number` | ❌ | Номер серии |
| `yaniVideos` | `YaniVideo[]` | ❌ | Видео от Yani TV |
| `yaniDubbing` | `string` | ❌ | Озвучка Yani |

---

## Архитектура

### Компоненты

```
UniversalPlayer
├── Server Switcher (кнопки Сервер 1/2)
├── Iframe Container
│   ├── Loading State
│   ├── Error/Timeout State
│   └── Iframe (Yani или VideoCDN)
└── VideoCDN Controls (только для Сервера 2)
    ├── Quality Selector
    └── Translation Selector
```

### Flow

```
1. Компонент монтируется
   ↓
2. Проверяет dostupность Yani (из пропсов)
   ↓
3. Загружает данные VideoCDN (клиентский запрос)
   ↓
4. Показывает кнопки серверов
   ↓
5. Пользователь выбирает сервер
   ↓
6. Загружается iframe
   ↓
7. При ошибке → предлагает запасной сервер
```

---

## VideoCDN API

### Endpoints

```typescript
// Фильмы
GET https://videocdn.tv/api/movie?tmdb_id={id}

// Сериалы
GET https://videocdn.tv/api/tv?tmdb_id={id}&season={s}&episode={e}

// Аниме
GET https://videocdn.tv/api/anime?shikimori_id={id}&season={s}&episode={e}
```

### Ответ API

```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Movie Title",
    "year": 2024,
    "poster": "https://...",
    "translations": [
      { "id": 1, "title": "English", "type": "sub" },
      { "id": 2, "title": "Russian", "type": "dub" }
    ],
    "qualities": [
      { "quality": "1080p", "url": "https://..." },
      { "quality": "720p", "url": "https://..." }
    ]
  }
}
```

---

## Состояния

### Загрузка
```
┌─────────────────────────┐
│                         │
│   🔄 Загрузка плеера... │
│   Yani/Alloha           │
│                         │
└─────────────────────────┘
```

### Ошибка/Таймаут
```
┌─────────────────────────────────┐
│  ⚠️ Превышено время ожидания   │
│                                 │
│  [🔄 Попробовать VideoCDN]     │
│  [Попробовать снова]           │
└─────────────────────────────────┘
```

### Успех
```
┌─────────────────────────────────┐
│ 👤 Сервер  [Сервер 1 ✓] [Сервер 2] │
├─────────────────────────────────┤
│                                 │
│     [ Video Iframe ]            │
│                                 │
├─────────────────────────────────┤
│ Качество: [1080p] [720p] [480p] │
│ Озвучка: [English] [Russian]    │
└─────────────────────────────────┘
```

---

## Стили (Tailwind CSS)

### Кнопки серверов
```tsx
className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
// Active: bg-gradient-to-r from-blue-500 to-purple-500
// Inactive: bg-white/10
```

### Плашки качества/озвучки
```tsx
className="px-3 py-1 rounded-md text-xs font-medium"
// Selected: bg-gradient-to-r from-blue-500 to-purple-500
// Unselected: bg-white/10
```

---

## Обработка ошибок

### Таймаут (10 секунд)
```typescript
useEffect(() => {
  if (!isLoading) return
  const timeout = setTimeout(() => {
    if (isLoading) setLoadTimeout(true)
  }, 10000)
  return () => clearTimeout(timeout)
}, [isLoading])
```

### Auto-failover
```typescript
const suggestAlternative = () => {
  if (currentServer === 'yani' && videocdnAvailable) return 'videocdn'
  if (currentServer === 'videocdn' && yaniAvailable) return 'yani'
  return null
}
```

---

## Производительность

### Клиентские запросы
Все запросы к VideoCDN выполняются на клиенте:
```typescript
const res = await fetch(url, {
  method: 'GET',
  headers: { 'Accept': 'application/json' },
})
```

**Преимущества:**
- ✅ Запрос с IP пользователя (не Vercel)
- ✅ Обход блокировок дата-центров
- ✅ Корректная работа с гео-ограничениями

### Оптимизации
- Мемоизация через `useMemo` для iframe URL
- `useCallback` для обработчиков
- Lazy загрузка VideoCDN данных

---

## Будущие улучшения

### 1. **Автоматический failover**
```typescript
// Автоматическое переключение при ошибке
if (loadTimeout && alternativeServer) {
  switchServer(alternativeServer)
}
```

### 2. **Preload следующего эпизода**
```typescript
// Предзагрузка данных для следующей серии
useEffect(() => {
  if (episode && nextEpisodeAvailable) {
    prefetchVideoCDN({ episode: episode + 1 })
  }
}, [episode])
```

### 3. **Сохранение настроек**
```typescript
// localStorage для предпочтений
localStorage.setItem('preferred_server', 'videocdn')
localStorage.setItem('preferred_quality', '1080p')
```

### 4. **Статистика buffering**
```typescript
// Сбор статистики для оптимизации
onBuffering={(time) => reportAnalytics({ bufferTime: time })}
```

---

## Примеры использования

### 1. В модальном окне аниме

```tsx
// components/anime/AniPlayerModal.tsx
import UniversalPlayer from './UniversalPlayer'

export default function AniPlayerModal() {
  const { currentVideo, currentEpisode, currentSeason, currentDubbing } = useStore()
  
  return (
    <div className="aspect-video">
      <UniversalPlayer
        type="anime"
        shikimoriId={currentVideo.shikimori_id}
        season={currentSeason}
        episode={currentEpisode}
        yaniVideos={videos}
        yaniDubbing={currentDubbing}
      />
    </div>
  )
}
```

### 2. На странице фильма

```tsx
// app/movies/[id]/page.tsx
import UniversalPlayer from '@/components/anime/UniversalPlayer'

export default function MovieDetail({ params }) {
  const movie = await fetchMovie(params.id)
  
  return (
    <div className="aspect-video">
      <UniversalPlayer
        type="movie"
        tmdbId={movie.id}
      />
    </div>
  )
}
```

### 3. На странице сериала

```tsx
// app/tv/[id]/page.tsx
import UniversalPlayer from '@/components/anime/UniversalPlayer'

export default function TVDetail({ params, searchParams }) {
  const show = await fetchTV(params.id)
  const season = Number(searchParams.season) || 1
  const episode = Number(searchParams.episode) || 1
  
  return (
    <div className="aspect-video">
      <UniversalPlayer
        type="tv"
        tmdbId={show.id}
        season={season}
        episode={episode}
      />
    </div>
  )
}
```

---

## Готово! 🎉

UniversalPlayer предоставляет:
- ✅ **Два сервера** с ручным переключением
- ✅ **Авто-обнаружение ошибок** (10с таймаут)
- ✅ **Кнопку запасного сервера** при ошибке
- ✅ **Выбор качества** для VideoCDN
- ✅ **Выбор озвучки** для VideoCDN
- ✅ **Поддержку сезонов/серий** для TV/Anime
- ✅ **Клиентские запросы** (обход блокировок Vercel)
- ✅ **Совместимость с Yani TV** для аниме
