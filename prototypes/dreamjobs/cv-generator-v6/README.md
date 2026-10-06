# DreamJobs – Felturbózott jelentkezés · prototípus

Kattintható HTML/CSS/JS prototípus a csatolt (SingleFile-lal mentett) DreamJobs oldalakra építve.
Az AI **szimulált**: előre megírt, erre az állásra (StartUp HUB – Ügyfélkapcsolati munkatárs) és a demó CV-re
(Bogdan-Barna-CV-Product-Manager.pdf) szabott válaszokat ad, gépelés-animációval. Nincs backend, minden a böngésző
`localStorage`-ában tárolódik.

## Megnyitás

- **Legegyszerűbb:** dupla kattintás az `allas.html`-re (Chrome / Edge). Szerver nem kell.
- **Helyi szerverrel** (ha a böngésző korlátozza a `file://` oldalakat):
  ```bash
  python -m http.server 8765 --directory cv-generator-v2
  ```
  majd `http://localhost:8765/allas.html`.
- A PDF-letöltéshez internet kell (a html2pdf.js a cdnjs-ről töltődik). Offline a böngésző nyomtatási ablaka nyílik meg, ahonnan PDF-be lehet menteni.
- A feltöltött CV-k kiolvasásához is internet kell (pdf.js és mammoth.js a cdnjs-ről, tartalékként a jsdelivr-ről).

## Bemutató forgatókönyvek (bal alsó „Demó” gomb)

| # | Forgatókönyv | Mit mutat |
|---|---|---|
| 1 | Kijelentkezett jelentkezés | Jelentkezem → regisztráció/belépés ablak → a jelentkezési oldal (`cv-generator.html?mode=apply`) |
| 2 | Meglévő CV + AI motivációs levél | Jelentkezési oldal: „Meglévő önéletrajzommal jelentkezem” → feltöltés vagy mentett CV → AI motivációs levél → összegzés (adatok, hozzájárulások) → Mentés és jelentkezés → visszaigazolás |
| 3 | Új CV a CV-generátorral | Üres sablon, csak a regisztrációs név + e-mail van kitöltve → AI-segédek (bemutatkozás, tapasztalat-pontok, készségjavaslatok, kijelöléses átírás) → motivációs levél → Mentés és jelentkezés |
| 4 | AI CV-felturbózás | Feltöltés → kiolvasás és strukturálás → a kérdés-varázsló automatikusan megnyílik, 10 célzott kérdés → felturbózott, álláshoz igazított CV (változások kiemelve, Eredeti/Felturbózott váltó, illeszkedés 57% → 94%) → levél → jelentkezés |
| 5 | Önéletrajzaim | Kategóriák: Feltöltött · Generátorral készült · AI-val felturbózott; új CV feltöltése, szerkesztés, PDF-letöltés, duplikálás, törlés |
| 6 | Motivációs leveleim | Az álláshoz generált levelek; szerkesztés, letöltés, törlés (a Jelentkezéseim oldal ugyanebből a menüből érhető el) |
| 7 | Régi profil | A Self-Branding CV oldal, felül átirányító sávval az új CV-generátorra |
| ↺ | Demó visszaállítása | Törli a mentett állapotot, és visszaáll a kezdő adatokra |

A főmenüben a „Self-Branding CV” helyén a **CV-generátor** áll (a láblécben is). Az **Önéletrajzaim**, a **Motivációs leveleim** és a **Jelentkezéseim** a jobb felső (hamburger) profilmenüből érhető el; a CV-s rész gradienssel kiemelt blokkban van.

A CV-generátorban minden módban fel lehet tölteni egy meglévő önéletrajzot, vagy importálni lehet a LinkedIn profilt (szimulált kiolvasás); az önéletrajz tartalma törölhető, és újrakezdhető. Álláshoz kötött jelentkezésnél egy emlékeztető jelzi, hogy a jelentkezést a „Mentés és jelentkezés” lépésben véglegesíteni kell (más oldalakon is, ha befejezetlen piszkozat maradt).

## Bármilyen önéletrajz feltöltése

A feltöltött CV-t a prototípus **valóban kiolvassa** a böngészőben (`assets/cv-parser.js`), nem a demó adatait tölti be:

- **Formátumok:** PDF (szöveges, egy- vagy kéthasábos/oldalsávos is), DOCX, RTF, TXT; a régi .doc-ból csak nyers szöveg jön ki (figyelmeztetéssel). Szkennelt kép / fotó nem támogatott – erről hibaüzenet szól.
- **Felismerés:** név, címsor, e-mail, telefon, cím, irányítószám, város, születési adatok, állampolgárság, LinkedIn/Facebook/weboldal/WhatsApp; szakaszok magyar, angol és román címek alapján (bemutatkozás, tapasztalat, projektek, tanulmányok, kurzusok, készségek – alcsoportokkal –, nyelvek szinttel, jogosítvány, hobbik, érdeklődés, egyéb). A tételeknél pozíció, cég/intézmény, helyszín, kezdés–befejezés és leírás; az online kurzusok külön szakaszba kerülnek.
- **Nyelv:** a CV nyelvét is felismeri (HU/EN/RO); a szövegek eredeti nyelven maradnak, a szakaszcímek is ehhez igazodnak.
- A kiolvasás után egy sárga lista jelzi, mit érdemes átnézni (pl. bizonytalan tételhatárok).
- A **felturbózás** és a **motivációs levél** idegen CV-nél általános, de a kiolvasott adatokra épülő szövegeket ír (a kérdések válaszlehetőségei sem a demóra szabottak).
- Az Önéletrajzaim oldalon feltöltött CV-ket a háttérben szintén kiolvassuk, így azok felturbózhatók és levélhez használhatók.
- **Demó:** a csatolt `Bogdan-Barna-CV-Product-Manager.pdf` feltöltésekor a bemutató kedvéért továbbra is az előre strukturált, magyarra fordított változat jön be. A LinkedIn-import szimulált marad.

## Új önéletrajz: lépésről lépésre, AI-felturbózással

Új CV-nél (a jelentkezési ablak „Új önéletrajzot készítek” lehetőségéből vagy a menüből) nincs kezdőképernyő: egyből a **Lépésről lépésre** oldal nyílik meg. Piros folyamatjelzővel végigvezet a CV szakaszain (személyes adatok, bemutatkozás, tapasztalat, tanulmányok, készségek, nyelvek, hobbik), mellette élő előnézettel. A folyamat utolsó pontja az **AI felturbózás**: 10 rövid kérdés, amelyek alapján az AI felturbózza és a hirdetéshez igazítja a CV-t.

Az első lépés tetején a „Van már önéletrajzod?” sávból feltölthető egy meglévő CV, vagy importálható a LinkedIn-profil.

Mindkét vezetett mód később is elérhető a szerkesztő tetején.

A **motivációs levél** az önéletrajz mellett a hirdetést (feladatok) és a cég bemutatkozását (küldetés, értékek, képzési kultúra) is felhasználja, valamint a kérdéseknél megadott motivációt.

## Szerkesztés az előnézetben, nyelvi változatok

- Az élő előnézetben bármelyik részre (név, elérhetőség, szakasz, tapasztalat, készség, nyelv…) rá lehet kattintani: a bal oldalon kinyílik és fókuszba kerül a hozzá tartozó mező, az előnézetben pedig szaggatott keret jelöli a kijelölt részt. Fordítva is működik: egy mezőbe kattintva az előnézet kiemeli a hozzá tartozó részt.
- Az előnézet alatti sávban egyedi legördülők vannak: Sablon (élő bélyegképekkel), Betűtípus (minta a saját betűtípusával), Térköz, Szín (egyéni szín is), Nyelv.
- **Nyelv:** a CV angolra és románra fordítható (szimulált AI-fordítás). Mindegyik külön nyelvi változat, a magyar eredeti megmarad; a „Fordítás frissítése” újrafordít a magyarból. A demó CV és az AI által írt szövegek teljesen lefordulnak, a saját kézzel írt mondatok fordításához valódi AI kell (ilyenkor értesítés jelzi, mit érdemes átnézni). A motivációs levél magyar marad.

## CV-sablonok

Hat sablon közül lehet választani. Az új DreamJobs-sablonok a mappában lévő tervek alapján készültek, logóval:

- **DreamJobs Piros** (`A4 - 5.pdf`): nagybetűs piros vezetéknév, két oszlop piros elválasztóval, piros sarokdísz.
- **DreamJobs Kék** (`A4 - 4.pdf`): kék oldalsáv fotóval, adatokkal és készségsávokkal, fehér DreamJobs logóval.
- **DreamJobs Gradiens** (`A4 - 3.pdf`): lágy színátmenetes háttér, címke-oszlopos elrendezés, valamint „Ezek fontosak egy munkahelynél” / „Ilyen vagyok” körök.

Mellettük megmaradtak a korábbi sablonok is (Klasszikus sötét oldalsáv, Modern színes fejléc, Minimál). Betűtípusok: Poppins, Inter, Roboto, Montserrat, Lato, Open Sans, Nunito, Source Sans 3, Merriweather, Playfair Display, Zilla Slab, Arial, Georgia (a webes betűtípusokhoz internet kell, offline a rendszer betűtípusa jelenik meg).

Új szakaszként hozzáadható a **Bérigény**, az **Ezek fontosak egy munkahelynél** és az **Ilyen vagyok** is. A motivációs levél ugyanazt a sablont követi, mint a CV.

## Fájlok

```
allas.html          állásoldal (f8a162d7…htm alapján); a Jelentkezem gomb a jelentkezési oldalra visz
cv-generator.html   CV-generátor: szerkesztő + élő A4-előnézet, levél lépés, mentés/jelentkezés
oneletrajzaim.html        mentett önéletrajzok
motivacios-leveleim.html  mentett motivációs levelek
jelentkezeseim.html       elküldött jelentkezések
profil.html         régi Self-Branding CV profil (404f2fe9…htm), frissített menüvel
assets/
  dj.css            a mentett DreamJobs oldal CSS-e (Tailwind + Poppins)
  proto.css         a prototípus saját komponensei és a 3 DreamJobs CV-sablon
  store.js          állapot (localStorage), segédfüggvények
  mock-data.js      állások, a PDF-ből "kiolvasott" CV, kérdések
  ai-mock.js        szimulált AI (bemutatkozás, átírás, felturbózás, motivációs levél, illeszkedés)
  cv-parser.js      feltöltött CV kiolvasása (PDF/DOCX/RTF/TXT → szerkeszthető CV-szerkezet)
  cv-template.js    CV/levél renderelés + PDF-letöltés
  shell.js          fejléc állapot, profilmenü, Demó panel, toast
  apply-modal.js    Jelentkezem gomb → jelentkezési oldal; kijelentkezve regisztráció/belépés ablak
  cv-builder.js     CV-generátor
  documents.js      Önéletrajzaim / Motivációs leveleim / Jelentkezéseim
_build/build.py     újragenerálja a HTML oldalakat a mentett .htm fájlokból
```

Ha a `assets/*.js|css` fájlok változnak, futtasd újra: `python cv-generator-v2/_build/build.py`
(frissíti a gyorsítótár-ürítő verziót és a generált oldalakat). Az eredeti `.htm` fájlok nem módosulnak.

## Helyőrzők, nyitott kérdések

- **HR-statisztika:** a motivációs levél ajánlásában 53% szerepel (`assets/mock-data.js` → `DJP.HR_STAT`).
- **Illeszkedés %:** a prototípusban kulcsszó-alapú becslés a hirdetés követelményeire; élesben LLM-alapú pontozás javasolt.
- **Valós AI:** élesben a CV-kiolvasás (PDF/DOCX → strukturált JSON), a kérdésgenerálás, a felturbózás és a levélírás LLM-hívásokkal működne (ugyanazokkal a lépésekkel és adatszerkezettel, mint a prototípusban). A prototípus szabályalapú kiolvasója a tagolt CV-ket jól kezeli, a kreatív elrendezéseknél viszont hibázhat – lásd a TERV.md „Éles CV-kiolvasás” részét.
