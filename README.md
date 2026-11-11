# Ground Handling Price Database (GitHub Pages)

Site: https://sacredriches.github.io/handling/

Panel sekmesi görüntüleme, Manage sekmesi düzenleme içindir. Veri Firebase'de (Firestore) tutulur: bir kişinin kaydı herkesin ekranına anında gelir. Kayıt için sağ alttan **Sign in to edit** ile Google hesabıyla giriş yapılır; sadece düzenleyici listesindeki hesaplar kayıt yapabilir.

## Dosyalar

| Dosya | Ne |
|---|---|
| `index.html` | Panel sayfası. Aktarım md dosyasının **Bölüm 8** kod bloğu; başına doctype/charset/viewport, ilk `<script>` etiketinden hemen önce de Firebase'in iki satırı eklenmiş hali (aşağıda). |
| `firebase-config.js` | Firebase proje ayarları. Boşsa site `handling-database.json`'dan salt okunur açılır. |
| `firebase-db.js` | Paneli Firebase'e bağlayan katman (giriş/çıkış, Download JSON, ilk yükleme). |
| `firestore.rules` | Firebase güvenlik kuralları (konsola yapıştırılır). |
| `handling-database.json` | Yedek / ilk yükleme verisi. Firebase kurulduktan sonra güncel veri Firebase'dedir. |

## Firebase kurulumu (bir kez)

1. https://console.firebase.google.com → **Add project** (ör. `handling-panel`; Google Analytics gerekmez).
2. **Build → Firestore Database → Create database** → konum `eur3` (veya yakın bir bölge) → *production mode*.
3. **Rules** sekmesi → `firestore.rules` içeriğini yapıştır → **Publish**.
4. **Build → Authentication → Get started → Sign-in method → Google** → Enable → Save.
   **Settings → Authorized domains → Add domain** → `sacredriches.github.io`.
5. **Firestore → Data → Start collection** → Collection ID `editors` → Document ID = düzenleyicinin Google e-postası (küçük harf), alan ekleme gerekmez (ör. `name` / `Deniz`). Her düzenleyici için bir doküman.
6. **Project settings (çark) → Your apps → Web (</>)** → uygulama adı ver → çıkan `firebaseConfig` içindeki `apiKey`, `authDomain`, `projectId`, `appId` değerlerini `firebase-config.js`'e yaz ve repoya yükle.
7. Siteyi aç → **Sign in to edit** → düzenleyici hesabıyla gir → **Import data** (veritabanı boşken bir kez görünür; `handling-database.json`'daki bütün meydanları Firebase'e yazar).

Düzenleyici eklemek/çıkarmak: Firestore'da `editors` koleksiyonuna doküman ekle/sil. Kod değişmez.

## Yeni aktarım md dosyası geldiğinde (sayfa kodu güncellemesi)

Veri artık Firebase'de güncellendiği için normalde sadece **sayfa kodu** değişir. Claude'a şunu söyleyin:

> "Bu md dosyasının Bölüm 8'inden `index.html` çıkar: başına `<!DOCTYPE html>`, `<meta charset="utf-8">`, viewport ekle; ilk `<script>` etiketinden hemen önce `<script src="firebase-config.js"></script>` ve `<script src="firebase-db.js"></script>` satırlarını ekle. Artifact'tan veya eski panelden değil, md'den çıkar."

Sonra yalnızca `index.html`'in üzerine yazın. Diğer dosyalara dokunulmaz.

Claude'la yeni bir aktarım md dosyası hazırlarken güncel veriyi vermek için sitede **Download JSON**'a basın; inen `handling-database.json` md'nin Bölüm 9'uyla aynı biçimdedir.

## Yaygın hatalar

- **"The database is not available in this view"**: `index.html` md'den değil eski panelden çıkmış; yeniden md'den çıkarın.
- **"You do not have edit permission"**: Giriş yapılmamış ya da e-posta `editors` koleksiyonunda yok.
- **Google girişi açılmıyor**: Authentication → Authorized domains'e `sacredriches.github.io` eklenmemiş.
