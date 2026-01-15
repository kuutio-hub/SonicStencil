**Feladat:** Egy professzionális, egyoldalas webalkalmazás (SPA) létrehozása, amelynek neve "SonicStencil".

**Ez az első prompt egy három részes sorozatból. A feladatod most az, hogy megértsd és nyugtázd ezeket a keretszabályokat. Ne kezdj el kódot írni, amíg nem kaptad meg a következő, alkalmazáslogikát leíró promptot!**

---

### 1. Technikai Keretrendszer és Megkötések (Kötelező)

- **Célplatform:** Az alkalmazásnak 100%-ban kompatibilisnek kell lennie a **GitHub Pages** szolgáltatással. Ez azt jelenti, hogy csak statikus fájlokat (HTML, CSS, JavaScript) tartalmazhat.
- **Nyelvi Megkötések:** Kizárólag **HTML5**, **CSS3** és **ECMAScript 6+ (ES6+) Vanilla JavaScript** használható.
- **TILOS:** Szigorúan tilos TypeScript (`.ts`, `.tsx`), JSX, vagy bármilyen más, fordítást vagy build lépést igénylő technológia használata (pl. Vite, Webpack, Babel, SASS/LESS).
- **Futtatás:** Minden fájlnak közvetlenül, statikus szerver környezetben futtathatónak kell lennie, további eszközök nélkül. Az alkalmazásnak az `index.html` betöltésekor azonnal működnie kell.
- **Függőségek:** Minden külső könyvtárat (pl. `jsPDF`, `@google/genai`, `xlsx`) kizárólag CDN-ről, az `index.html`-ben található `<script type="importmap">` blokkon keresztül szabad betölteni. Ez biztosítja a build-mentes megközelítést.

### 2. Kódszervezés és Architektúra

- **Fájlstruktúra:** A projekt gyökérkönyvtára a `src/` mappának tekintendő. Ne hozz létre extra `src` almenüt. A struktúra legyen logikus és moduláris:
  - `index.html`: Az alkalmazás belépési pontja.
  - `index.js`: A fő alkalmazáslogika, ami inicializálja a komponenseket és menedzseli az állapotváltozásokat.
  - `state.js`: A globális állapotkezelő (state management).
  - `App.js`: A fő alkalmazás komponens váza, ami összeköti a különböző részeket.
  - `components/`: A felhasználói felület (UI) újrafelhasználható komponensei (pl. `Header.js`, `Sidebar.js`, `Card.js`).
  - `components/ui/`: Kisebb, atomi UI elemek (pl. `Button.js`, `Slider.js`, `Icon.js`).
  - `lib/`: Külső logikát vagy komplex műveleteket végző segédfüggvények (pl. `pdfGenerator.js`, `fileParser.js`, `ai.js`).
  - `i18n/`: Nemzetköziesítési (i18n) fájlok, pl. `locales.js`.
  - `constants.js`: Az alkalmazásban használt konstansok (pl. alapértelmezett konfiguráció).
- **Programozási Paradigma:** Használj funkcionális és moduláris megközelítést. Minden komponens egy külön `.js` fájlban legyen, ami exportál egy vagy több `render` függvényt. Az állapotváltozásokat egy központi `state.js` kezelje egy "publish-subscribe" mintával.

### 3. Minőségi Elvárások

- **Reszponzivitás:** Az alkalmazásnak tökéletesen kell működnie és kinéznie asztali és mobil eszközökön is. Használj `tailwindcss` utility osztályokat a reszponzív dizájnhoz.
- **Teljesítmény:** A kód legyen optimalizált és gyors. Kerüld a felesleges DOM manipulációkat. Használj `debounce` technikát a sűrűn ismétlődő események (pl. csúszka mozgatása) kezelésére.
- **Karbantarthatóság:** A kód legyen tiszta, olvasható, jól dokumentált (ahol szükséges), és kövesse a "Don't Repeat Yourself" (DRY) elvet.
- **Verziókövetés:** Minden lényegi változtatás után frissíteni kell a `version.js` fájlban a verziószámot és egy bejegyzést kell írni a `CHANGELOG.md`-be. A verziózás formátuma: `MAJOR.MINOR.PATCH` (pl. `1.2.1`).

### 4. Kommunikáció és Kimenet

- **Válasz Formátuma:** Ha a feladat kódot módosítani, a válaszod kizárólag egy XML blokk legyen, ami tartalmazza a megváltozott fájlok teljes tartalmát.
- **Hibakezelés:** Az alkalmazásnak kecsesen kell kezelnie a hibákat (pl. hibás fájlformátum, sikertelen API hívás) és érthető visszajelzést kell adnia a felhasználónak "toast" értesítések formájában.

**Nyugtázás:** Kérlek, erősítsd meg, hogy megértetted ezeket a szabályokat. A következő prompt fogja részletezni az alkalmazás konkrét funkcióit és logikai felépítését.