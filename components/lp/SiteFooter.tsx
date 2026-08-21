"use client";

import { Brand } from "../icons";
import { InkAnnotate } from "../system/InkAnnotate";
import { FounderNameInk } from "../system/FounderNameInk";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { FOOTER_CONTENT } from "@/lib/footerContent";
import { withBasePath } from "@/lib/basePath";
import { track } from "@/lib/analytics";

function socialNetwork(label: string): "linkedin" | "x" {
  return label.toLowerCase().includes("linkedin") ? "linkedin" : "x";
}

export function SiteFooter() {
  const { founder } = ABOUT_CONTENT;

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer__inner">
        <div className="site-footer__subscribe">
          <p className="site-footer__subscribe-label">
            {FOOTER_CONTENT.subscribe.label}
          </p>
          <a
            className="site-footer__subscribe-link"
            href={FOOTER_CONTENT.subscribe.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track("social_outbound_clicked", {
                network: "linkedin",
                location: "footer_notes",
                href: FOOTER_CONTENT.subscribe.href,
              })
            }
          >
            {FOOTER_CONTENT.subscribe.cta}
            <span aria-hidden="true"> ↗</span>
          </a>
        </div>
        <div className="site-footer__author">
          <p className="site-footer__author-label">{FOOTER_CONTENT.author.label}</p>
          <div className="site-footer__author-panel">
            <div className="site-footer__author-cell site-footer__author-cell--name">
              <FounderNameInk
                name={founder.name}
                className="site-footer__author-name-ink"
                timing="early"
                size="footer"
              />
              <span className="site-footer__author-role">{founder.role}</span>
            </div>
            <div className="site-footer__author-cell site-footer__author-cell--brand">
              <Brand />
            </div>
            <div className="site-footer__author-cell site-footer__author-cell--portrait">
              <div className="site-footer__portrait-frame">
                <img
                  className="site-footer__portrait"
                  src={withBasePath(founder.footerPhoto ?? founder.photo)}
                  alt={founder.name}
                  loading="lazy"
                  decoding="async"
                  width={900}
                  height={824}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="site-footer__credits">
          <div className="site-footer__brand-block">
            <p className="site-footer__brand-name">
              <InkAnnotate variant="circle">{FOOTER_CONTENT.brand.name}</InkAnnotate>
            </p>
            <p className="site-footer__brand-tagline">
              {FOOTER_CONTENT.brand.tagline}
            </p>
          </div>
          <div className="site-footer__legal">
            <nav className="site-footer__social" aria-label="Social links">
              {FOOTER_CONTENT.social.map((link, index) => (
                <span className="site-footer__social-item" key={link.label}>
                  {index > 0 ? (
                    <span className="site-footer__social-sep" aria-hidden="true">
                      ·
                    </span>
                  ) : null}
                  <a
                    className="site-footer__social-link"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track("social_outbound_clicked", {
                        network: socialNetwork(link.label),
                        location: "footer",
                        href: link.href,
                      })
                    }
                  >
                    {link.label}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                </span>
              ))}
            </nav>
            <p className="site-footer__copyright">&copy; {FOOTER_CONTENT.year}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
