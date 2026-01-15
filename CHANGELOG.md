# SonicStencil Változási Napló

## [1.2.1] - 2024-08-01

### Javítva
- **PDF Generátor SVG Hiba:** A `jsPDF` nem tudott SVG képeket feldolgozni. A hiba javítva lett egy "SVG -> Canvas -> PNG" konverziós lépés beiktatásával, ami a böngészőben, futásidőben történik. Ez a megoldás kompatibilissé teszi a dinamikusan generált SVG effekteket a PDF könyvtárral anélkül, hogy a teljesítmény romlana.

### Hozzáadva
- **Projekt Újraépítési Promptok:** Létrehoztunk egy `Prompts` mappát, ami három, rendkívül részletes promptot tartalmaz. Ezekkel a promptokkal az alkalmazás a nulláról, lépésről-lépésre újraépíthető, biztosítva a konzisztenciát és a tudás megőrzését.

## [1.2.0] - 2024-08-01

Ez a verzió a teljesítményre, a felhasználói élményre és a projekt karbantarthatóságára fókuszál.

### Hozzáadva
- **Lábléc (Footer):** Az alkalmazás alján megjelent egy új lábléc, ami dinamikusan mutatja az aktuális évet, a copyright információt és a szoftver verziószámát.
- **Folyamatjelző (Progress Bar):** A PDF generálás közben egy részletes folyamatjelző sáv és egy szöveges üzenet tájékoztatja a felhasználót az előrehaladásról (pl. "Generating front pages: 50%").
- **Verziókövetés:** Létrejött ez a `CHANGELOG.md` fájl és egy központi `version.js` a verziószám tárolására, hogy a változások követhetőek legyenek.

### Módosítva
- **PDF Generátor Újraírva:** A PDF generálás logikája teljesen át lett írva. A korábbi, lassú `html2canvas` alapú "képernyőfotózás" helyett a rendszer most már közvetlenül a PDF vászonra rajzolja az elemeket (szövegek, QR kódok, SVG effektek) a `jsPDF` natív funkcióival.
- **Állapotkezelés (`state.js`):** Az állapotkezelő egy új `progress` objektummal bővült, ami a generálás állapotát tárolja.

### Javítva
- **Teljesítmény:** A PDF generálás sebessége drasztikusan megnőtt, a felhasználói élmény sokkal folyamatosabb lett, kiküszöbölve a korábbi lassúságot és a böngésző esetleges "fagyását" nagyobb adatmennyiségnél.
