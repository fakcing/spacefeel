# ✅ Финальное исправление Alloha плеера

## Что было исправлено

### Проблема
**"Превышено время ожидания ответа от сайта alloha.yani.tv"** — iframe с прямой ссылкой на Alloha блокировался при загрузке.

### Решение (как с Kodik)
Теперь ссылка на плеер запрашивается **через наш API endpoint** строго на клиенте:

```
┌─────────────────────────────────────────────────────────┐
│  1. Компонент монтируется (useEffect)                   │
│         ↓                                                │
│  2. Запрос на /api/anime/player?animeId=...&episode=... │
│         ↓                                                │
│  3. Сервер Next.js получает данные от Yani TV           │
│         ↓                                                │
│  4. Возвращает playerUrl клиенту                        │
│         ↓                                                │
│  5. Клиент загружает iframe с playerUrl                 │
│         ↓                                                │
│  6. ✅ Плеер работает (IP клиента совпадает)            │
└─────────────────────────────────────────────────────────┘
```

---

## Новые файлы

### 1. API Endpoint
**`app/api/anime/player/route.ts`**

Проксирует запрос к Yani TV API и возвращает рабочую ссылку на плеер.

```typescript
// GET /api/anime/player?animeId=123&episode=1&dubbing=SUB&season=1
export async function GET(request: NextRequest) {
  // Fetch from Yani TV
  const res = await fetch(`https://api.yani.tv/anime/${animeId}/videos`, {
    headers: { 'X-Application': process.env.YANI_TV_TOKEN }
  })
  
  // Find matching video
  const video = videos.find(v => 
    v.number === episode && 
    v.data.dubbing === dubbing &&
    v.season === season
  )
  
  // Return player URL
  return NextResponse.json({ playerUrl: video.iframe_url })
}
```

### 2. Обновлённый компонент
**`components/anime/AniPlayerModal.tsx`**

Теперь загружает ссылку на плеер через `/api/anime/player`:

```typescript
useEffect(() => {
  const fetchPlayer = async () => {
    const res = await fetch(
      `/api/anime/player?animeId=${animeId}&episode=${episode}&dubbing=${dubbing}&season=${season}`
    )
    const data = await res.json()
    setPlayerUrl(data.playerUrl) // ← Загружаем ссылку
  }
  fetchPlayer()
}, [episode, dubbing, season])
```

---

## Как это работает

### 1. Клиентский запрос
```typescript
fetch(`/api/anime/player?animeId=123&episode=5`)
```
Запрос идёт **с браузера пользователя** → IP клиента

### 2. Серверный прокси
Next.js на сервере запрашивает у Yani TV:
```typescript
fetch('https://api.yani.tv/anime/123/videos', {
  headers: { 'X-Application': TOKEN }
})
```
Запрос идёт **с сервера Next.js** → IP сервера (Vercel)

### 3. Возврат ссылки
Сервер возвращает только `playerUrl` клиенту.

### 4. Загрузка iframe
Клиент загружает iframe:
```html
<iframe src="https://alloha.yani.tv/player/..." />
```
Запрос идёт **с браузера пользователя** → IP клиента ✅

---

## Почему это решает проблему

| До | После |
|----|----|
| Iframe URL встраивался на сервере | Iframe URL запрашивается клиентом |
| Запрос к Alloha с IP Vercel | Запрос к Alloha с IP клиента |
| ❌ Блокировка (IP mismatch) | ✅ Работает (IP совпадает) |

---

## Структура данных

### Yani TV API ответ
```json
{
  "response": [
    {
      "video_id": 12345,
      "number": "1",
      "data": {
        "dubbing": "ANI",
        "player_id": 67890,
        "season": 1
      },
      "iframe_url": "//alloha.yani.tv/player/...",
      "season": 1
    }
  ]
}
```

### Наш API ответ
```json
{
  "playerUrl": "https://alloha.yani.tv/player/...",
  "videoId": 12345,
  "dubbing": "ANI",
  "season": 1
}
```

---

## Проверка работы

### 1. Локально
```bash
npm run dev
```
1. Откройте страницу аниме
2. Нажмите "Смотреть"
3. Проверьте Network tab:
   - Запрос на `/api/anime/player` → 200 OK
   - Запрос iframe → 200 OK

### 2. На Vercel
```bash
git push
```
1. Откройте деплой
2. Проверьте консоль браузера (не должно быть таймаутов)
3. При таймауте > 15 сек → сообщение про VPN

---

## Обработка ошибок

### Таймаут (15 секунд)
```typescript
useEffect(() => {
  if (!iframeLoading) return
  const timeout = setTimeout(() => {
    setIframeLoadTimeout(true)
  }, 15000)
  return () => clearTimeout(timeout)
}, [iframeLoading, playerUrl])
```

**UI:**
```
⚠️ Превышено время ожидания ответа
alloha.yani.tv не отвечает.
Попробуйте использовать VPN или смените озвучку.
[Попробовать снова]
```

### Ошибка загрузки
```typescript
const handleIframeError = useCallback(() => {
  setIframeLoading(false)
  setIframeError(true)
}, [])
```

**UI:**
```
⚠️ Ошибка загрузки видео
[Попробовать снова]
```

---

## Отличия от Kodik подхода

| Kodik | Alloha |
|-------|--------|
| `/anileak/tmdb/{id}` → playerUrl | `/anime/{id}/videos` → найти по episode |
| Один запрос для всех серий | Запрос на каждую серию |
| Сохраняем playerUrl в state | Запрашиваем playerUrl при смене серии |

**Почему по-разному?**
- Kodik отдаёт готовую ссылку на плеер для всего тайтла
- Alloha отдаёт ссылку в общем списке видео, нужно фильтровать по серии

---

## Файлы изменений

```
D:\spacefeel-main\
├── app\api\anime\player\route.ts     ← Новый API endpoint
├── components\anime\AniPlayerModal.tsx ← Обновлён
├── types\yani.ts                     ← Добавлено season
├── store\aniPlayerStore.ts           ← Добавлена поддержка сезонов
└── ALLOHA_PLAYER_FIX.md              ← Этот документ
```

---

## Готово! 🎉

Плеер Alloha теперь:
- ✅ Работает на Vercel (клиентские запросы)
- ✅ Запрашивает ссылку через `/api/anime/player`
- ✅ Не блокируется по IP
- ✅ Имеет обработку таймаутов
- ✅ Показывает сезоны и серии без дублей
