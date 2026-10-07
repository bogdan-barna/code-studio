# DreamJobs – Felturbózott jelentkezés · prototípus

Kattintható HTML/CSS/JS prototípus a csatolt (SingleFile-lal mentett) DreamJobs oldalakra építve.
Az AI **szimulált**: előre megírt, erre az állásra (StartUp HUB – Ügyfélkapcsolati munkatárs) és a demó CV-re
(Kovacs-Anna-CV.pdf) szabott válaszokat ad, gépelés-animációval. Nincs backend, minden a böngésző
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
| 1 | Kijelentkezett jelentkezés | Demóban belépés nélkül (`DJP.SKIP_LOGIN = true` a shell.js-ben): Jelentkezem → egyből a jelentkezési oldal. `false`-ra állítva előbb a belépés oldal (`belepes.html`) jön. |
| 2 | Meglévő CV + AI motivációs levél | Jelentkezési oldal: „Meglévő önéletrajzommal jelentkezem” → feltöltés vagy mentett CV → Jelentkezés befejezése (adatok, hozzájárulások; ajánló: „Motivációs levél generálása” → levél oldal → vissza) → Mentés és jelentkezés → visszaigazolás |
| 3 | Új CV a CV-generátorral | Üres sablon, csak a regisztrációs név + e-mail van kitöltve → AI-segédek (bemutatkozás, tapasztalat-pontok, készségjavaslatok, kijelöléses átírás) → Jelentkezés befejezése (opcionális AI motivációs levél) → Mentés és jelentkezés |
| 4 | AI CV-felturbózás | Feltöltés → kiolvasás és strukturálás → a kérdés-varázsló automatikusan megnyílik, 5 célzott kérdés → felturbózott, álláshoz igazított CV (változások kiemelve, Eredeti/Felturbózott váltó, illeszkedés 57% → 94%) → Jelentkezés befejezése (opcionális AI motivációs levél) → jelentkezés |
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
- **Demó:** a csatolt `Kovacs-Anna-CV.pdf` feltöltésekor a bemutató kedvéért továbbra is az előre strukturált, magyarra fordított változat jön be. A LinkedIn-import szimulált marad.

## Új önéletrajz: lépésről lépésre, AI-val

Új CV-nél (a jelentkezési oldal „Új önéletrajzot készítek” lehetőségéből vagy a menüből) egyből a **lépésről lépésre** oldal nyílik meg, 10 kérdéssel:
szakmai megnevezés, szakmai bemutatkozás, munkatapasztalat, feladatok és eredmények, tanulmányok, alapkészségek, eszközök és technológiák,
fontos projektek (opcionális), tanúsítványok és nyelvek (opcionális), jövőbeli szerepkör. Minden lépés a hozzá illő mezőkkel: pl. munkatapasztalatnál pozíciónként munkakör, cégnév, kezdés, befejezés („jelenleg is itt dolgozom”), több pozícióval; tanulmányoknál képzettség, szak, intézmény, év; készségeknél és eszközöknél címkék; nyelveknél nyelv + szint. A javaslatok kattintásra kitöltik a mezőket.
Az utolsó kérdés után az **„Önéletrajz elkészítése AI-val”** gombra az AI megírja a CV-t (címsor, bemutatkozás, tapasztalat-pontok, eredmények, tanulmányok,
készségek, eszközök, projektek, nyelvek, tanúsítványok), az álláshoz igazítva. A válaszok az eszköztár „Újragenerálás” menüjéből módosíthatók.

Meglévő CV-vel a jelentkezési oldal „Meglévő önéletrajzommal jelentkezem” útja való (feltöltés vagy mentett CV, utána opcionális felturbózás).

## Felturbózás: 5 kérdés

Meglévő CV felturbózása 5 kérdéssel: ügyfélkapcsolati tapasztalat, szoftverek/CRM, számszerűsíthető eredmények, román nyelvtudás, motiváció.
A jelentkezési oldalon a „Felturbózom ehhez az álláshoz” már a feltöltés alatt bejelölhető; a CV kiolvasása után egyből jönnek a kérdések, újrafeltöltés nélkül.

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

## Jelentkezés: két lépés

A lépésjelző minden jelentkezési útnál két lépést mutat: **Önéletrajz → Jelentkezés befejezése** (kijelentkezve előtte a **Fiók**, a `belepes.html` oldalon).
A motivációs levél nem külön lépés: a befejezés oldalán egy ajánló doboz kínálja fel (DreamJobs-statisztika: motivációs levéllel nagyobb eséllyel keresnek meg).
A „Motivációs levél generálása” a levél oldalára visz; a generálás után automatikusan visszajön a befejezés oldal, ahol a levél már a jelentkezés része (Szerkesztés linkkel).
