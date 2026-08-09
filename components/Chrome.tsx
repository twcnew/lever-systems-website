"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Brand } from "./icons";
import { NAV_CTA, NAV_ITEMS, type NavGroupItem, type NavItem } from "@/lib/navContent";

function TopNavDropdown({ group }: { group: NavGroupItem }) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      className={`topnav__group${open ? " is-open" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      ref={rootRef}
    >
      <button
        type="button"
        className="topnav__group-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {group.label}
        <span className="topnav__group-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      <div className="topnav__menu" id={menuId} role="menu">
        {group.items.map((item) =>
          item.disabled || !item.href ? (
            <span
              className="topnav__menu-item topnav__menu-item--disabled"
              key={item.label}
              role="menuitem"
              aria-disabled="true"
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span className="topnav__menu-badge">{item.badge}</span>
              ) : null}
            </span>
          ) : (
            <Link
              className="topnav__menu-item"
              href={item.href}
              key={item.label}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

function DrawerNavGroup({ group }: { group: NavGroupItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`drawer__group${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="drawer__group-trigger"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {group.label}
        <span className="drawer__group-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      <div className="drawer__sub">
        {group.items.map((item) =>
          item.disabled || !item.href ? (
            <span
              className="drawer__sub-item drawer__sub-item--disabled"
              key={item.label}
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span className="drawer__sub-badge">{item.badge}</span>
              ) : null}
            </span>
          ) : (
            <Link className="drawer__sub-item" href={item.href} key={item.label}>
              {item.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

function renderNavItem(item: NavItem) {
  if (item.type === "group") {
    return <TopNavDropdown group={item} key={item.label} />;
  }

  return (
    <Link href={item.href} key={item.label}>
      {item.label}
    </Link>
  );
}

function renderDrawerItem(item: NavItem) {
  if (item.type === "group") {
    return <DrawerNavGroup group={item} key={item.label} />;
  }

  return (
    <Link href={item.href} key={item.label}>
      {item.label}
    </Link>
  );
}

export function TopNav() {
  return (
    <nav className="topnav is-glass" data-nav>
      <Link className="topnav__brand" href="/">
        <Brand />
      </Link>
      <div className="topnav__links">
        {NAV_ITEMS.map(renderNavItem)}
      </div>
      <div className="topnav__right">
        <Link className="topnav__cta" href={NAV_CTA.href}>
          <span>{NAV_CTA.label}</span>
        </Link>
        <button className="topnav__burger" data-burger aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

export function Drawer() {
  return (
    <div className="drawer" data-drawer>
      <button className="drawer__close" data-drawer-close aria-label="Close menu">
        ✕
      </button>
      {NAV_ITEMS.map(renderDrawerItem)}
      <Link className="drawer__cta" href={NAV_CTA.href}>
        {NAV_CTA.label}
      </Link>
    </div>
  );
}
