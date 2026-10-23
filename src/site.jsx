import React, { useEffect, useMemo, useState } from "react";
import pages from "./content/pages.json";

const fragments = import.meta.glob("./content/*.html", {
  eager: true,
  import: "default",
  query: "?raw",
});

const pageByPath = new Map(pages.map((page) => [page.path, page]));
const sitePrefix = window.location.hostname.endsWith(".github.io") ? "/pracowniaterapii" : "";
const menuItems = [
  ["Psychoterapia", "/psychoterapia/"],
  ["Oferta", "/oferta/"],
  ["Gabinet", "/gabinet/"],
  ["O mnie", "/o-mnie/"],
  ["Artykuły", "/artykuly/"],
  ["Kontakt", "/kontakt/"],
  ["Psychoterapia grupowa", "/psychoterapia-grupowa/"],
];

function siteUrl(path) {
  return `${sitePrefix}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizePath(pathname) {
  let path = pathname;
  if (sitePrefix && (path === sitePrefix || path.startsWith(`${sitePrefix}/`))) {
    path = path.slice(sitePrefix.length) || "/";
  }
  path = decodeURI(path).replace(/index\.html$/, "");
  if (path === "" || path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

function rewriteUrl(value, sourcePath) {
  if (!value || /^(?:mailto:|tel:|javascript:|data:|blob:|#)/i.test(value)) return value;
  const originalUrl = new URL(value, `https://pracowniaterapii.com.pl${sourcePath}`);
  if (!["pracowniaterapii.com.pl", "www.pracowniaterapii.com.pl"].includes(originalUrl.hostname)) {
    return value;
  }

  const routePath = normalizePath(originalUrl.pathname);
  const path = pageByPath.has(routePath) ? routePath : originalUrl.pathname;
  return `${siteUrl(path)}${originalUrl.search}${originalUrl.hash}`;
}

function prepareContent(html, sourcePath) {
  const parsed = new DOMParser().parseFromString(html, "text/html");

  parsed.querySelectorAll("[href]").forEach((element) => {
    element.setAttribute("href", rewriteUrl(element.getAttribute("href"), sourcePath));
  });
  parsed.querySelectorAll("[src]").forEach((element) => {
    element.setAttribute("src", rewriteUrl(element.getAttribute("src"), sourcePath));
  });
  parsed.querySelectorAll("[srcset]").forEach((element) => {
    const srcset = element.getAttribute("srcset");
    element.setAttribute(
      "srcset",
      srcset
        .split(",")
        .map((candidate) => {
          const [url, ...descriptor] = candidate.trim().split(/\s+/);
          return [rewriteUrl(url, sourcePath), ...descriptor].join(" ");
        })
        .join(", "),
    );
  });
  parsed.querySelectorAll("[style]").forEach((element) => {
    element.setAttribute(
      "style",
      element.getAttribute("style").replace(
        /url\((['"]?)(.*?)\1\)/gi,
        (_, quote, url) => `url(${quote}${rewriteUrl(url, sourcePath)}${quote})`,
      ),
    );
  });

  return parsed.body.innerHTML;
}

function Icon({ name }) {
  return <i className={`fa fa-${name}`} aria-hidden="true" />;
}

function Header({ path, menuOpen, setMenuOpen, searchOpen, setSearchOpen }) {
  return (
    <header id="masthead" className="site-header">
      <div className="site-header-topbar">
        <div className="site-topbar-left">
          <a
            className="header-social-icon social-email"
            href="mailto:martyna.cygon.pracownia@gmail.com"
            title="Wyślij email"
            aria-label="Wyślij email"
          >
            <Icon name="envelope-o" />
          </a>
          <a
            className="header-social-icon social-facebook"
            href="https://www.facebook.com/pracowniaterapii/"
            target="_blank"
            rel="noreferrer"
            title="Zobacz profil na Facebooku"
            aria-label="Zobacz profil na Facebooku"
          >
            <Icon name="facebook" />
          </a>
          <span className="site-topbar-left-ad">
            <Icon name="map-marker" /> <a href={siteUrl("/gabinet/")}>Wrocław</a>
          </span>
        </div>
        <div className="site-topbar-right">
          <span className="site-topbar-right-no">
            <Icon name="phone" /> <a href="tel:690305605">Zadzwoń: 690 305 605</a>
          </span>
          <button
            className="menu-search"
            type="button"
            aria-label={searchOpen ? "Zamknij wyszukiwanie" : "Otwórz wyszukiwanie"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Icon name="search" />
          </button>
        </div>
        <div className="clearboth" />
      </div>
      <div className={`search-block${searchOpen ? " is-open" : ""}`}>
        <form role="search" method="get" className="search-form" action={siteUrl("/")}>
          <label>
            <input
              type="search"
              className="search-field"
              placeholder="Wpisz frazę i naciśnij enter…"
              name="s"
            />
          </label>
          <button type="submit" className="search-submit" aria-label="Szukaj">
            <Icon name="search" />
          </button>
        </form>
      </div>
      <div className="site-container">
        <div className="site-branding">
          <h1 className="site-title">
            <a href={siteUrl("/")} title="Pracownia Terapii i Rozwoju">
              Pracownia Terapii i Rozwoju
            </a>
          </h1>
          <h2 className="site-description">Martyna Korzec</h2>
        </div>
      </div>
      <nav
        id="site-navigation"
        className="main-navigation vogue-mobile-nav-skin-dark"
        aria-label="Menu główne"
      >
        <button
          className="header-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name="bars" />
          <span>menu</span>
        </button>
        <div id="main-menu" className="main-menu-container">
          <button
            className="main-menu-close"
            type="button"
            aria-label="Zamknij menu"
            onClick={() => setMenuOpen(false)}
          >
            <Icon name="angle-right" />
            <Icon name="angle-left" />
          </button>
          <div className="menu-menu-glowne-container">
            <ul id="primary-menu" className="menu">
              {menuItems.map(([label, href]) => (
                <li
                  key={href}
                  className={`menu-item menu-item-type-post_type menu-item-object-page${
                    path === href ? " current-menu-item" : ""
                  }`}
                >
                  <a href={siteUrl(href)} aria-current={path === href ? "page" : undefined}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

function BookingWidget() {
  return (
    <section className="local-doctor-widget local-doctor-widget--sidebar" aria-label="Profil Martyny Korzec">
      <div className="local-doctor-widget__profile">
        <img
          className="local-doctor-widget__portrait"
          src={siteUrl("/wp-content/uploads/2016/11/psycholog-martyna-cygon-400.jpg")}
          alt="Martyna Korzec"
          width="88"
          height="88"
          loading="lazy"
        />
        <div className="local-doctor-widget__identity">
          <h3 className="local-doctor-widget__name">mgr Martyna Korzec (Cygoń)</h3>
          <p className="local-doctor-widget__role">Psycholożka · Psychoterapeutka</p>
        </div>
      </div>
      <p className="local-doctor-widget__summary">
        Umów się na wizytę lub sprawdź dostępne terminy.
      </p>
      <div className="local-doctor-widget__actions">
        <a
          className="local-doctor-widget__button"
          href="https://osrodekprzystan.nakiedy.pl/"
          target="_blank"
          rel="noreferrer"
        >
          Umów wizytę
        </a>
        <a className="local-doctor-widget__button local-doctor-widget__button--secondary" href="tel:690305605">
          Zadzwoń: 690 305 605
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="colophon" className="site-footer site-footer-social">
      <div className="site-footer-icons">
        <div className="site-container">
          <a
            className="footer-social-icon footer-social-email"
            href="mailto:martyna.cygon.pracownia@gmail.com"
            title="Wyślij email"
            aria-label="Wyślij email"
          >
            <Icon name="envelope-o" />
          </a>
          <a
            className="footer-social-icon footer-social-facebook"
            href="https://www.facebook.com/pracowniaterapii/"
            target="_blank"
            rel="noreferrer"
            title="Zobacz profil na Facebooku"
            aria-label="Zobacz profil na Facebooku"
          >
            <Icon name="facebook" />
          </a>
          <div className="site-footer-social-ad">
            <Icon name="map-marker" /> <a href={siteUrl("/gabinet/")}>Wrocław</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function HomeHero({ html, sourcePath }) {
  const content = useMemo(() => prepareContent(html, sourcePath), [html, sourcePath]);
  return <div className="home-hero" dangerouslySetInnerHTML={{ __html: content }} />;
}

export default function App() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const page = pageByPath.get(pathname);

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.title = page
      ? page.title
      : "Strony nie znaleziono – Pracownia Terapii i Rozwoju";
    document.body.className = page?.bodyClass ?? "error404";
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    document.body.classList.toggle("show-main-menu", menuOpen);
    document.body.classList.toggle("show-site-search", searchOpen);
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  function handleClick(event) {
    const anchor = event.target.closest("a");
    if (
      !anchor ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      anchor.target ||
      anchor.hasAttribute("download")
    ) {
      return;
    }

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    const nextPath = normalizePath(url.pathname);
    if (!pageByPath.has(nextPath)) return;
    if (nextPath === pathname && url.hash) return;

    event.preventDefault();
    window.history.pushState({}, "", `${siteUrl(nextPath)}${url.search}${url.hash}`);
    setPathname(nextPath);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  const content = page ? fragments[`./content/${page.fragment}.html`] : "";
  const preparedContent = useMemo(
    () => (content ? prepareContent(content, page.sourcePath) : ""),
    [content, page],
  );

  useEffect(() => {
    if (!page) return;
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(decodeURIComponent(hash))?.scrollIntoView();
  }, [page]);

  return (
    <div id="page" className="hfeed site" onClick={handleClick}>
      <Header
        path={pathname}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
      />
      {page?.hero && (
        <HomeHero
          html={fragments["./content/home-hero.html"]}
          sourcePath={page.sourcePath}
        />
      )}
      <div className={`site-container content-has-sidebar${page?.layout === "full" ? " home-content" : ""}`}>
        <div
          id="primary"
          className={`content-area${page?.layout === "full" ? " content-area-full" : ""}`}
        >
          {page ? (
            <main
              id="main"
              className="site-main"
              dangerouslySetInnerHTML={{ __html: preparedContent }}
            />
          ) : (
            <main id="main" className="site-main">
              <div className="error-404 not-found">
                <h1 className="page-title">Strony nie znaleziono</h1>
                <p>Nie możemy znaleźć strony pod tym adresem.</p>
                <a href={siteUrl("/")}>Wróć na stronę główną</a>
              </div>
            </main>
          )}
        </div>
        {page?.layout !== "full" && (
          <aside id="secondary" className="widget-area" aria-label="Umów wizytę">
            <BookingWidget />
          </aside>
        )}
        <div className="clearboth" />
      </div>
      <Footer />
      <button
        className={`scroll-to-top${showBackToTop ? " is-visible" : ""}`}
        type="button"
        aria-label="Przewiń do góry"
        tabIndex={showBackToTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <Icon name="angle-up" />
      </button>
    </div>
  );
}
