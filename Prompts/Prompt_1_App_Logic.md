**Ez a második prompt a három részes sorozatból. Az előző promptban lefektetett keretrendszer alapján most részletezzük az alkalmazás teljes logikai felépítését és funkcionális működését.**

**Feladatod: Értelmezd ezt a specifikációt, és készülj fel a fejlesztésre. Ne kezdj el kódot írni, amíg nem kaptad meg a harmadik, vizuális stílust leíró promptot!**

---

### Alkalmazás Áttekintése: SonicStencil

A SonicStencil egy webalkalmazás, amivel a felhasználók professzionális minőségű, testreszabható kártyákat és zsetonokat (tokeneket) hozhatnak létre, elsősorban zenei kvízekhez. Az alkalmazás lehetővé teszi adatok importálását Excel/CSV fájlokból, a dizájn finomhangolását egy részletes kezelőpanelen, és a végeredmény nyomtatásra kész PDF formátumban történő legenerálását.

### 1. Központi Állapotkezelés (`state.js`)

Az alkalmazás lelke egy központi állapotkezelő, ami egyetlen objektumban tárolja a teljes UI állapotot.

- **State Objektum (`state`):** Tartalmazza a következő kulcsokat:
  - `designConfig`: Egy mélyen beágyazott objektum, ami a kártya és az oldal minden vizuális beállítását tárolja (méretek, színek, betűtípusok, effektek, stb.). Az alapértelmezett struktúrát a `constants.js` definiálja.
  - `cardData`: Egy tömb, ami a felhasználó által feltöltött kártyaadatokat (artist, title, year, qr_url) tartalmazza.
  - `editableSample`: Egyetlen kártya objektum, ami a felhasználói felületen látható előnézetek és a szerkesztő mezők alapját képezi. Fájl feltöltésekor az első adatsorral frissül.
  - `isLoading`: Logikai (boolean) érték, ami jelzi, ha egy hosszan tartó művelet (pl. fájlfeldolgozás, PDF generálás) van folyamatban. Amikor `true`, egy teljes képernyős töltőképernyőt kell megjeleníteni.
  - `progress`: Objektum (`{ percentage: number, message: string }`), ami a `isLoading` állapothoz kapcsolódik, és a folyamatjelző sáv állapotát vezérli.
  - `toasts`: Tömb, ami az aktív "toast" értesítéseket tárolja (üzenet, típus, id).
  - `language`: Az aktuális nyelvi beállítás (pl. 'hu', 'en').
  - `isModalOpen`, `modalContent`: A felugró ablak (modal) állapotát és tartalmát vezérlik.
  - További UI állapotok: `sidebarVisible`, `openAccordions`, `isMobileMenuOpen`, stb.

- **Pub/Sub Minta:**
  - `subscribe(keys, listener)`: Egy komponens feliratkozhat az állapot bizonyos kulcsainak (`keys`) változására. Ha a megadott kulcsok bármelyike változik, a `listener` függvény lefut.
  - `updateState(newState)`: Egyetlen függvény, ami az állapotot módosítja. Összefésüli a jelenlegi állapotot a `newState` objektummal, majd értesíti (`notify`) az érintett feliratkozókat.
  - `t(key)`: Egy nemzetköziesítési (i18n) segédfüggvény, ami a `language` állapot alapján visszaadja a megadott kulcsú szöveget a `locales.js`-ből.

### 2. Fő Komponensek és Logikájuk

- **`App.js`:**
  - `renderApp`: Kirajzolja az alkalmazás alapvető HTML vázát (header, sidebar, main content, footer, modal, toast containerek). Nem tartalmazza a komponensek belső logikáját, csak a helyüket jelöli ki.
  - `handleFileParse`: Fogad egy fájl objektumot, meghívja a `fileParser.js`-t, validálja az eredményt (ellenőrzi a kötelező fejléceket), majd a `setCardData` akcióval frissíti az állapotot. Hibakezelést is végez.
  - `handleGeneratePdf`: Elindítja a PDF generálási folyamatot. Beállítja az `isLoading` állapotot `true`-ra, és egy `onProgress` callback függvényt ad át a `pdfGenerator`-nak, amivel a `progress` állapotot frissíti.

- **`index.js` (`main` függvény):**
  - Meghívja a `renderApp`-ot az alapváz létrehozásához.
  - Lekéri az összes komponens konténer elemét (pl. `document.getElementById('header-container')`).
  - Minden komponenshez meghívja a saját `render` függvényét, hogy feltöltse a konténerét tartalommal.
  - Beállítja a `subscribe` hívásokat, hogy az állapotváltozások célzottan csak a megfelelő komponenseket rajzolják újra. Például a `language` változása csak a `renderHeader`-t hívja meg újra. A teljesítménykritikus frissítéseket (pl. csúszkák) `debounce`-olja.

- **`Header.js`:**
  - Megjeleníti az alkalmazás címét, egy nyelvválasztót és gombokat a konfiguráció mentéséhez/betöltéséhez.
  - A gombok logikája:
    - **Mentés:** `prompt()`-tal bekér egy nevet, majd a jelenlegi `designConfig`-ot elmenti a `localStorage`-be a megadott néven.
    - **Betöltés:** Megnyit egy modális ablakot, ami listázza a `localStorage`-ből a mentett konfigurációkat. Egy kiválasztása betölti azt az állapotba.
    - **Letöltés:** A `designConfig` objektumot JSON stringgé alakítja és letölteti a felhasználóval `.json` fájlként.

- **`Sidebar.js`:**
  - A legkomplexebb komponens, ami az összes dizájn beállítást tartalmazza, harmonika (accordion) panelekbe rendezve.
  - Minden beviteli elem (csúszka, színválasztó, legördülő menü, kapcsoló) `change` vagy `input` eseménye meghívja a `updateDesignConfig` állapotmódosító függvényt.
  - A megjelenített beállítások dinamikusan változnak az `appMode` (`card` vagy `token`) alapján.
  - Tartalmaz egy "Generate PDF" gombot, ami az `onGeneratePdf` (azaz a `handleGeneratePdf`) függvényt hívja meg.
  - **AI Háttér Generálás:** Van egy "Surprise Me" gomb. Erre kattintva meghívja a `lib/ai.js`-ben lévő `generateAiBackground` függvényt. Ez a függvény a `@google/genai` SDK-t használva egy előre definiált prompt alapján képet generál, majd a base64 kódolt kép-stringet visszaadva frissíti a `designConfig.vinyl.aiBackground` állapotot.

- **Előnézetek (`CardPreview.js`, `PagePreview.js`):**
  - A `designConfig` és az `editableSample` állapotok alapján renderelik a kártya és a teljes oldal előnézetét.
  - Az előnézetek tartalmaznak egy "nagyítás" gombot, ami egy modális ablakban, nagyobb méretben jeleníti meg a tartalmat (`EnlargedPreviewModal.js`).
  - A `Card.js` komponens felelős egyetlen kártya (elő- vagy hátlap) HTML reprezentációjának előállításáért.
  - A QR kódokat aszinkron módon kell renderelni a `qrcode` könyvtárral, miután a kártya HTML-je már a DOM-ban van.

### 3. Könyvtárak és Segédfüggvények (`lib/`)

- **`fileParser.js`:**
  - A fájlkiterjesztés alapján eldönti, hogy az `xlsx` vagy a `papaparse` könyvtárat használja.
  - A fájlt beolvassa és JSON objektumok tömbjévé alakítja, ahol minden objektum egy-egy sort reprezentál. Promise-alapú, aszinkron működésű.

- **`pdfGenerator.js`:**
  - A `jsPDF` könyvtárat használja.
  - A `designConfig` és `cardData` állapotok alapján, ciklusokkal járja végig a kártyákat.
  - **Közvetlen Rajzolás:** NEM használ HTML-t vászonra konvertáló technikát (mint a `html2canvas`). Ehelyett a `jsPDF` beépített rajzoló parancsaival (`.rect()`, `.text()`, `.addImage()`) hozza létre a kártegységeket közvetlenül a PDF-ben a maximális teljesítmény érdekében.
  - A vizuális effekteket (pl. bakelit) SVG stringként generálja le, majd egy `SVG -> Canvas -> PNG` konverzió után képként illeszti be a PDF-be.
  - A generálás minden fő lépésénél (pl. "előlapok generálása", "hátlapok generálása") meghívja az `onProgress` callback-et a százalékos előrehaladás és egy üzenet átadásával.

**Nyugtázás:** Kérlek, erősítsd meg, hogy megértetted az alkalmazás logikai felépítését. A következő, utolsó prompt fogja részletezni a teljes vizuális dizájnt és stílusirányzatot.