# WOS İttifak Takip Platformu

Whiteout Survival ittifakını **canlı takip eden** web paneli. Üyelerin güç/fırın
gelişimini WOS resmi API'sinden 7/24 otomatik çeker; chat ve etkinlik skorlarını
tablet + AI Vision (`duaey/gpt`) ile okur.

## Mimari

```
Tablet (Auto.js) ──screenshot──▶ /api/ingest ──▶ Vision AI (duaey/gpt) ──▶ DB
WOS resmi API ──güç/fırın──▶ /api/poll (cron) ──▶ DB
DB ──▶ Web paneli (dashboard, üyeler, etkinlik, chat)
```

## Özellikler
- **Dashboard:** toplam güç, aktif/AFK sayaçları, en çok gelişen/durgun üyeler
- **Üye listesi & detay:** güç trend grafiği, fırın, 7 günlük değişim, aktiflik durumu
- **Etkinlikler:** skor tabloları (Vision'dan otomatik) + katılmayanlar
- **Chat:** tabletten yakalanıp AI ile okunan mesajlar
- **Yönetim:** toplu UID ekleme, manuel güncelleme tetikleme

## Kurulum

```bash
npm install
cp .env.example .env        # DATABASE_URL ve secret'ları doldur
npx prisma db push          # şemayı veritabanına uygula
npm run dev                 # http://localhost:3000
```

> **Not:** `prisma generate` / `db push` ilk çalıştırmada Prisma motor binary'lerini
> indirir; internet erişimi gerekir.

## Veri kaynakları

| Veri | Yöntem | Otomatik? |
|------|--------|-----------|
| Güç, Fırın, İsim | WOS resmi API (`/api/poll`) | ✅ 7/24 (cron) |
| Aktiflik / AFK | Güç değişim trendinden hesap | ✅ |
| Etkinlik skoru | Tablet → `/api/ingest` → Vision | 📷 yarı-oto |
| Chat | Tablet → `/api/ingest` → Vision | 📷 yarı-oto |

## Otomatik güncelleme (cron)

- **Vercel:** `vercel.json` içindeki cron her 6 saatte `/api/poll` çağırır.
- **Kendi sunucun:** `npm run poll` komutunu sistem cron'una ekle.
- Manuel: `/api/poll` endpoint'ine `Authorization: Bearer $CRON_SECRET` ile istek.

## Ortam değişkenleri
`.env.example` dosyasına bakın: `DATABASE_URL`, `WOS_API_SALT`, `INGEST_SECRET`,
`VISION_SERVICE_URL`, `VISION_SERVICE_KEY`, `CRON_SECRET`.

## İlgili repolar
- **`duaey/gpt`** — AI Vision parse servisi (görüntü → JSON)
- **`duaey/wos/tablet/`** — tablet Auto.js scripti

## ⚠️ Not
Tablet otomasyonu (Auto.js) oyunun kullanım şartları açısından risk taşır; gözcü
hesap ban yiyebilir. Güç/fırın takibi (resmi API) ise güvenlidir.
