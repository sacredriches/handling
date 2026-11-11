# Ground Handling Price Database (GitHub Pages kopyası)

Bu repoda her zaman yalnızca şu iki dosya bulunur. Yeni sürüm geldiğinde **ikisinin de üzerine yazılır**, yeni dosya veya klasör açılmaz:

| Dosya | Ne |
|---|---|
| `index.html` | Panel sayfası. Aktarım md dosyasının **Bölüm 8** kod bloğu, başına `<!DOCTYPE html>`, `<meta charset="utf-8">` ve viewport satırı eklenmiş hali. |
| `handling-database.json` | Veri. Aktarım md dosyasının **Bölüm 9** JSON bloğu, biçimi `{"airports": {ICAO: {...}}, "settings": {"fuel": {...}, "fx": {...}}}`. |

## Güncelleme (yeni aktarım md dosyası geldiğinde)

Claude'a şunu söyleyin:

> "Bu md dosyasından GitHub kopyasını çıkar: Bölüm 8 → `index.html` (başına doctype/charset/viewport ekle), Bölüm 9 → `handling-database.json` (`sort_keys`, tek satır). Artifact'tan veya eski panelden değil, md'den çıkar."

Sonra iki dosyayı repoya yükleyip mevcutların üzerine yazın.

## Yaygın hatalar

- **"The database is not available in this view"**: Sayfa, claude.ai'deki artifact'tan alınmış eski koddan çıkmış demektir; JSON'dan okuma kısmı yoktur. Sayfayı md'nin Bölüm 8'inden yeniden çıkarın.
- **Veri gelmiyor**: JSON dosyasının adı tam olarak `handling-database.json` olmalı (ör. `data.json` olmaz) ve `airports` bir liste değil, ICAO anahtarlı bir nesne olmalı.
- Sayfa salt okunurdur; fiyat girişi claude.ai'deki panelde yapılır, sonra yeni md ile buraya taşınır.
