/* Firebase ayarları. Firebase konsolu → Project settings → Your apps → Web app → Config.
   apiKey boş kalırsa sayfa Firebase'e bağlanmaz; handling-database.json'dan salt okunur açılır.
   (Bu değerler gizli değildir; erişimi firestore.rules korur.)
   Düzenleme yetkisi: Firestore'da "editors" koleksiyonuna, doküman adı Google e-posta adresi (küçük harf) olan boş bir doküman eklenir. */
window.HFP_FIREBASE = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};
