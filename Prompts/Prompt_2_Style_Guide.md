**Ez a harmadik és egyben utolsó prompt a sorozatból. Az előző két promptban definiáltuk a fejlesztési keretrendszert és az alkalmazás logikáját. Most a teljes vizuális megjelenést és a felhasználói élményt (UI/UX) határozzuk meg.**

**Feladatod: A három promptban leírtak alapján építsd fel a teljes "SonicStencil" alkalmazást. Kezdd az `index.html` vázzal, majd haladj a JavaScript modulokkal. A végeredmény egy teljes, működő, a specifikációnak megfelelő webalkalmazás legyen.**

---

### Vizuális Stíluskalauz: SonicStencil

**Általános Hangulat:** Professzionális, modern, "dark mode" esztétika, ami egy high-tech stúdió vagy prémium szoftver érzetét kelti. A fókusz a letisztultságon és a könnyű használhatóságon van, finom vizuális effektekkel.

**Technológia:** A stílusozáshoz kizárólag a **Tailwind CSS** utility-first osztályait használjuk, a CDN-ről betöltött verziót. Egyéni CSS-t csak a legszükségesebb esetekben (pl. scrollbar) írunk az `index.html` `<style>` blokkjába.

### 1. Színpaletta

- **Elsődleges Háttér:** Nagyon sötét szürke (`bg-gray-900`).
- **Másodlagos Háttér (panelek, kártyák):** Sötét szürke (`bg-gray-800`).
- **Harmadlagos Háttér (kiemelések, hover):** Közép szürke (`bg-gray-700`).
- **Szegélyek:** Sötét, alig látható szürke (`border-gray-700` vagy `border-gray-800`).
- **Fő Akcentus Szín:** Élénk zöld (`bg-green-600`), hover esetén sötétebb (`bg-green-700`). Ezt használjuk gombokhoz, aktív állapotokhoz, fókusz jelzésekhez.
- **Másodlagos Akcentus Színek:** Lila (`bg-purple-600` az AI gombhoz), Piros (`bg-red-600` a törlés/bezárás gombokhoz).
- **Szöveg Színek:**
  - Általános szöveg: Fehér (`text-white`).
  - Másodlagos szöveg (címkék, leírások): Világos szürke (`text-gray-300` vagy `text-gray-400`).
  - Inaktív/Placeholder szöveg: Sötétebb szürke (`text-gray-500`).

### 2. Tipográfia

- **Betűtípusok (Google Fonts import az `index.html`-ben):**
  - **Címsorok, Logó, Kiemelt Szövegek:** `Montserrat`, extra vastag (`font-black`, `tracking-tighter`).
  - **Általános UI Szövegek (címkék, gombok):** `Montserrat`, félkövér vagy normál (`font-bold`, `font-normal`).
  - A kártya előnézeten megjelenő betűtípusokat a `state`-ből, dinamikusan kell beállítani.
- **Betűméretek:** Használj reszponzív, a Tailwind skáláján alapuló méreteket (`text-xs`, `text-sm`, `text-lg`, `text-xl`, stb.).

### 3. Elrendezés (Layout)

- **Fő Struktúra:** `flex flex-col` a `body`-n, ami egy `min-h-screen` magasságú konténerben helyezkedik el.
  - `Header`: Fix magasságú, a tetején helyezkedik el.
  - `Main Content Area`: `flex-grow`, `flex` elrendezésű, ami a fennmaradó helyet kitölti.
    - `Sidebar`: Fix szélességű (`w-80`), a bal oldalon.
    - `Main Area`: `flex-1`, kitölti a maradék helyet.
  - `Footer`: Fix magasságú, az alján helyezkedik el.
- **Reszponzivitás:** `md:` breakpoint használatával válts mobil és asztali nézet között.
  - **Mobilon:** A `Sidebar` alapértelmezetten rejtett, egy "hamburger" ikonnal hozható elő, ami a tartalom fölé csúszik be. Az előnézetek nem látszanak, helyettük "View Preview" gombok vannak, amik modális ablakban nyitják meg őket. A fő "Generate" gomb egy lebegő akciógomb (FAB) a jobb alsó sarokban.
  - **Asztalon:** A `Sidebar` látható (de egy gombbal becsukható), a `Main Area` mellette helyezkedik el. Az előnézetek a jobb oldalon, egy fix szélességű, görgethető oszlopban jelennek meg (`sticky` pozícióval).

### 4. Komponens Stílusok

- **Gombok (`Button.js`):**
  - Alapállapot: Akcentus zöld háttér (`bg-green-600`), fehér szöveg, lekerekített sarkok (`rounded-md`), enyhe árnyék (`shadow-lg`).
  - Hover: Sötétebb zöld (`hover:bg-green-700`).
  - Fókusz: Zöld "ring" effekt (`focus:ring-2 focus:ring-green-500`).
  - Inaktív (`disabled`): Szürke háttér (`bg-gray-500`), nem kattintható kurzor.
- **Csúszkák (`Slider.js`):**
  - A csúszka sávja szürke (`bg-gray-600`), a "thumb" (gomb) és az aktív sáv zöld (`accent-green-500`).
  - Mellette egy kis beviteli mező a pontos érték megadásához, sötét háttérrel (`bg-gray-900`).
- **Panelek/Kártyák (Accordions, Previews):**
  - Háttér: `bg-gray-800`.
  - Szegély: `border border-gray-700`.
  - Sarkok: Lekerekített (`rounded-lg`).
  - Fejléc: Kicsit sötétebb vagy eltérő háttér (`bg-gray-700/50`) a tartalomtól való elválasztáshoz.
- **Harmonika Panelek (`Accordion.js`):**
  - A fejléc kattintható, a nyíl ikon animáltan forog (`transition-transform`). A tartalom kecsesen jelenik meg/tűnik el (a `hidden` osztály kapcsolgatásával).
- **Modális Ablak (`EnlargedPreviewModal.js`):**
  - A háttér egy áttetsző fekete réteg (`bg-black/80`).
  - A modális panel a képernyő közepén jelenik meg, a panelekéhez hasonló stílussal.
  - A zoomolható tartalom `transform: scale()` CSS tulajdonsággal van méretezve, `transform-origin: center`.
- **Toast Értesítések (`Toast.js`):**
  - A jobb felső sarokban jelennek meg.
  - Siker esetén zöld (`bg-green-500/80`), hiba esetén piros (`bg-red-500/80`) háttérrel, enyhén áttetsző és elmosott (`backdrop-blur-sm`) effekttel.
- **Fájl Feltöltő (`FileUpload.js`):**
  - A "drag and drop" terület `drag-over` eseményre egy szaggatott zöld keretet kap, és a háttér színe enyhén megváltozik.

### 5. Interakciók és Animációk

- **Általános:** Használj finom áttűnéseket (`transition-all`, `duration-200` vagy `duration-300`) a hover effekteknél, gomboknál és a panelek láthatóságának változásánál.
- **Sidebar:** A be- és kicsúszás `transition-transform` segítségével történjen (`ease-in-out`).
- **Betöltő Képernyő:** A progress bar animáltan töltődjön (`transition-all`). A teljes képernyő enyhe áttűnéssel jelenjen meg (`transition-opacity`).

**Most már rendelkezel minden információval. Építsd fel az alkalmazást a három prompt alapján!**