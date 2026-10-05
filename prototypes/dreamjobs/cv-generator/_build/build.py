"""
DreamJobs prototípus – build szkript.

A DJ PROTOTYPE mappában lévő, SingleFile-lal mentett DreamJobs oldalakból
legenerálja a prototype/ mappa HTML oldalait és a közös assets fájlokat.
Az eredeti .htm fájlokat nem módosítja.

Futtatás:  python prototype/_build/build.py
"""
import base64
import re
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent                      # prototype/
SRC = OUT.parent                       # DJ PROTOTYPE/
ASSETS = OUT / "assets"

JOB_LOGGED_IN = SRC / "f8a162d7-942c-4987-8ad1-1acae9e0909c.htm"   # állás + belépve + jelentkezési modal
JOB_LOGGED_OUT = SRC / "a30f0171-0e9a-4e47-8795-059bc485fa9a.htm"  # állás kijelentkezve
PROFILE = SRC / "404f2fe9-113c-46d2-bbaa-8108a106c992.htm"         # Self-Branding CV profil
DEMO_CV_PDF = SRC / "Bogdan-Barna-CV-Product-Manager.pdf"

# a CV-generátorban választható további betűtípusok
FONTS_LINK = ('<link rel=preconnect href="https://fonts.googleapis.com"><link rel=preconnect href="https://fonts.gstatic.com" crossorigin>'
              '<link rel=stylesheet href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700'
              '&family=Montserrat:wght@400;500;600;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;600;700&family=Nunito:wght@400;600;700'
              '&family=Source+Sans+3:wght@400;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;600;700&display=swap">')
BUILD = int(time.time())  # gyorsítótár-ürítő verzió a saját fájlokhoz
PROTO_HEAD = f'<link rel=stylesheet href="assets/proto.css?v={BUILD}">'
COMMON_JS = ["store.js", "logo-data.js", "i18n.js", "mock-data.js", "ai-mock.js", "cv-template.js", "shell.js"]


def read(p):
    return p.read_text(encoding="utf-8")


def scripts(extra):
    return "".join(f'<script src="assets/{name}?v={BUILD}"></script>' for name in COMMON_JS + extra)


def cut(s, start_marker, end_marker, start_from=0):
    """Visszaadja [start, end) pozíciót: start_marker elejétől end_marker végéig."""
    a = s.find(start_marker, start_from)
    if a < 0:
        raise ValueError(f"nem található: {start_marker[:60]}")
    b = s.find(end_marker, a)
    if b < 0:
        raise ValueError(f"nem található: {end_marker[:60]}")
    return a, b + len(end_marker)


def css_var_data_uri(s, n):
    m = re.search(r"--sf-img-%d:\s*url\(\"?(data:[^\")]+)\"?\)" % n, s)
    return m.group(1) if m else None


def save_data_uri(uri, stem):
    head, data = uri.split(",", 1)
    ext = {"image/png": "png", "image/jpeg": "jpg", "image/svg+xml": "svg"}[head[5:].split(";")[0]]
    raw = base64.b64decode(data) if ";base64" in head else data.encode()
    (ASSETS / f"{stem}.{ext}").write_bytes(raw)
    return f"assets/{stem}.{ext}"


def rewrite_menu(html, add_documents=False):
    """Self-Branding CV -> CV-generátor a fejlécben és a láblécben (az Önéletrajzaim / Motivációs leveleim a profilmenüben van)."""
    def header_link(m):
        cls = re.search(r'class="([^"]*)"', m.group(0)).group(1)
        cls = cls.replace("router-link-active router-link-exact-active ", "")
        out = f'<a href="cv-generator.html" class="{cls} djp-nav-cvgen" data-djp-nav=cvgen>CV-generátor</a>'
        if add_documents:
            out += f'<a href="dokumentumaim.html" class="{cls}" data-djp-nav=docs>Dokumentumaim</a>'
        return out

    html = re.sub(r'<a href=https://dreamjobs\.ro/hu/user/[^ >]+/profile [^>]*>Self-Branding CV</a>', header_link, html)
    html = re.sub(r'(<a class="[^"]*") href=https://sbp\.dreamjobs\.ro/hu/self-branding-profile-landing target=_blank>Self-Branding CV</a>',
                  r'\1 href="cv-generator.html">CV-generátor</a>', html)
    # a logó a demóban az állásoldalra mutasson
    html = re.sub(r'<a href=https://dreamjobs\.ro/hu class="', '<a href="allas.html" class="', html)
    return html


def strip_csp(html):
    """A SingleFile által beszúrt CSP blokkolná a saját CSS/JS fájlokat."""
    return re.sub(r'<meta http-equiv=content-security-policy content="[^"]*">', "", html)


def inject_before_body_end(html, snippet):
    i = html.rfind("</body>")
    return html[:i] + snippet + html[i:] if i >= 0 else html + snippet


def build():
    ASSETS.mkdir(exist_ok=True)
    job = read(JOB_LOGGED_IN)
    job_out = read(JOB_LOGGED_OUT)

    # --- közös CSS (Tailwind + DJ osztályok + beágyazott Poppins/Zilla Slab) az új oldalakhoz
    styles = re.findall(r"<style[^>]*>(.*?)</style>", job, re.S)
    (ASSETS / "dj.css").write_text("\n".join(styles), encoding="utf-8")

    # --- logó + cég logó
    logo = save_data_uri(css_var_data_uri(job, 11), "dj-logo")
    company = save_data_uri(css_var_data_uri(job, 15), "startuphub-logo")
    (ASSETS / "logo-data.js").write_text(
        "window.DJP=window.DJP||{};DJP.LOGO=%r;DJP.COMPANY_LOGO=%r;" % (css_var_data_uri(job, 11), css_var_data_uri(job, 15)),
        encoding="utf-8")
    if DEMO_CV_PDF.exists():
        (ASSETS / DEMO_CV_PDF.name).write_bytes(DEMO_CV_PDF.read_bytes())

    # --- fejlécek, lábléc
    a, b = cut(job, "<header", "</header>")
    header_in = rewrite_menu(job[a:b])
    a2, b2 = cut(job_out, "<header", "</header>")
    header_out = rewrite_menu(job_out[a2:b2])
    # a kijelentkezett menüben is legyen CV-generátor
    m = re.search(r'<a href=https://dreamjobs\.ro/hu/podcasts class="([^"]*)">Podcast</a>', header_out)
    if m:
        header_out = header_out.replace(m.group(0), m.group(0) +
                                        f'<a href="cv-generator.html" class="{m.group(1)} djp-nav-cvgen" data-djp-nav=cvgen>CV-generátor</a>')
    fa, _ = cut(job, "<section id=dj-footer", "</footer>")
    _, fb = cut(job, "<section class=bg-dj-red>", "</section>", fa)
    footer = rewrite_menu(job[fa:fb])

    # --- allas.html: a statikus modalt kivesszük, a kijelentkezett fejlécet template-be tesszük
    page = strip_csp(rewrite_menu(job))
    ma = page.find('<section class="dj-jobprofile-modal-container')
    mb = page.find("</section>", ma) + len("</section>")
    page = page[:ma] + page[mb:]
    page = page.replace("<header ", "<header data-djp-header ", 1)
    page = page.replace("<head>", "<head>", 1)
    page = page.replace("</head>", PROTO_HEAD + "</head>", 1) if "</head>" in page else page.replace("<body>", PROTO_HEAD + "<body>", 1)
    tpl = f'<template id="djp-header-loggedout">{header_out}</template>'
    page = inject_before_body_end(page, tpl + '<div id="djp-modal-root"></div>' + scripts(["apply-modal.js"]))
    page = page.replace("<body>", '<body data-djp-page="job">', 1)
    (OUT / "allas.html").write_text(page, encoding="utf-8")

    # --- profil.html: csak a menü frissül
    prof = strip_csp(rewrite_menu(read(PROFILE)))
    prof = prof.replace("<body>", PROTO_HEAD + '<body data-djp-page="profile">', 1)
    prof = inject_before_body_end(prof, scripts([]))
    (OUT / "profil.html").write_text(prof, encoding="utf-8")

    # --- új oldalak a DJ fejléccel/lábléccel
    def new_page(name, title, page_id, body, extra_js, with_footer=True):
        html = (
            "<!DOCTYPE html><html lang=hu><head><meta charset=utf-8>"
            f"<title>{title}</title>"
            '<meta name=viewport content="width=device-width, initial-scale=1">'
            f'<link rel=icon href="{logo}">'
            '<link rel=stylesheet href="assets/dj.css">' + FONTS_LINK + PROTO_HEAD +
            f'</head><body data-djp-page="{page_id}"><div id=__nuxt><div><main>'
            + header_in.replace("<header ", "<header data-djp-header ", 1)
            + body + (footer if with_footer else "") +
            "</main></div></div>" + scripts(extra_js) + "</body></html>"
        )
        (OUT / name).write_text(html, encoding="utf-8")

    new_page("cv-generator.html", "CV-generátor – DreamJobs", "builder",
             '<div id="djp-builder" class="djp-builder"></div>', ["cv-builder.js"], with_footer=False)
    for fname, title, pid in [("oneletrajzaim.html", "Önéletrajzaim", "cvs"),
                              ("motivacios-leveleim.html", "Motivációs leveleim", "letters"),
                              ("jelentkezeseim.html", "Jelentkezéseim", "apps")]:
        new_page(fname, title + " – DreamJobs", pid, '<div id="djp-docs" class="djp-docs"></div>', ["documents.js"])
    (OUT / "dokumentumaim.html").write_text(
        '<!DOCTYPE html><meta charset=utf-8><meta http-equiv=refresh content="0;url=oneletrajzaim.html">', encoding="utf-8")

    # index -> allas
    (OUT / "index.html").write_text(
        '<!DOCTYPE html><meta charset=utf-8><meta http-equiv=refresh content="0;url=allas.html">'
        '<title>DreamJobs prototípus</title><a href="allas.html">Tovább a prototípusra</a>',
        encoding="utf-8")
    print("OK:", logo, company, "->", OUT)


if __name__ == "__main__":
    build()
