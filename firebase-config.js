/* Firebase ayarları. Firebase konsolu → Project settings → Your apps → Web app → Config.
   apiKey boş kalırsa sayfa Firebase'e bağlanmaz; handling-database.json'dan salt okunur açılır.
   (Bu değerler gizli değildir; erişimi firestore.rules korur.)
   Düzenleme yetkisi: Firestore'da "editors" koleksiyonuna, doküman adı Google e-posta adresi (küçük harf) olan boş bir doküman eklenir. */
window.HFP_FIREBASE = {
  apiKey: "AIzaSyDRtV4lDb4s3rzv7yjzKzLnyAY3VJPpnwY",
  authDomain: "handling-dcc2c.firebaseapp.com",
  projectId: "handling-dcc2c",
  appId: "1:19060662706:web:654ed745bfd0bde4e584ab"
};
