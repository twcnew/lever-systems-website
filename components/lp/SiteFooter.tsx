"use client";

import { FormEvent, useState } from "react";
import { Brand } from "../icons";
import { InkAnnotate } from "../system/InkAnnotate";
import { FounderNameInk } from "../system/FounderNameInk";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { FOOTER_CONTENT } from "@/lib/footerContent";
import { withBasePath } from "@/lib/basePath";

export function SiteFooter() {
  const { founder } = ABOUT_CONTENT;
  const [subscribeNote, setSubscribeNote] = useState("");

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribeNote(FOOTER_CONTENT.subscribe.comingSoon);
  };

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer__inner">
        <div className="site-footer__subscribe">
          <p className="site-footer__subscribe-label">
            {FOOTER_CONTENT.subscribe.label}
          </p>
          <form
            className="site-footer__subscribe-form"
            data-newsletter-form
            onSubmit={handleSubscribe}
          >
            <label className="site-footer__sr-only" htmlFor="footer-email">
              Email address
            </label>
            <input
              id="footer-email"
              className="site-footer__email-input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={FOOTER_CONTENT.subscribe.placeholder}
            />
            <button className="site-footer__email-submit" type="submit">
              Join
            </button>
            {subscribeNote ? (
              <p className="site-footer__subscribe-note" aria-live="polite">
                {subscribeNote}
              </p>
            ) : null}
          </form>
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
