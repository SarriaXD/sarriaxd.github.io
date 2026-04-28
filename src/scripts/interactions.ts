// Restrained interactions: scroll reveal, magnetic buttons, soft cursor follower,
// and a card-local mouse spotlight. All effects respect prefers-reduced-motion.

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ----- Scroll Reveal (IntersectionObserver, one-shot) ---------------------
const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
if (revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
  );
  revealEls.forEach((el) => io.observe(el));
}

// ----- Card mouse spotlight ----------------------------------------------
if (!reduced) {
  document.querySelectorAll<HTMLElement>("#craft article").forEach((card) => {
    card.addEventListener("pointermove", (ev) => {
      const r = card.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });
}

// ----- Magnetic buttons (subtle pull toward cursor) ----------------------
if (!reduced) {
  document.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
    const strength = 0.22;
    let raf = 0;
    let tx = 0, ty = 0;

    const apply = () => {
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };

    el.addEventListener("pointermove", (ev) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = (ev.clientX - cx) * strength;
      ty = (ev.clientY - cy) * strength;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    });

    el.addEventListener("pointerleave", () => {
      tx = 0; ty = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    });
  });
}

// ----- Soft cursor follower (desktop, fine pointer only) -----------------
const fine = window.matchMedia("(pointer: fine)").matches;
if (fine && !reduced) {
  const dot = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  dot.style.cssText = [
    "position:fixed",
    "left:0",
    "top:0",
    "width:24px",
    "height:24px",
    "border-radius:9999px",
    "border:1px solid rgba(255,255,255,0.35)",
    "background:radial-gradient(closest-side, rgba(255,255,255,0.12), transparent 70%)",
    "transform:translate3d(-100px,-100px,0)",
    "transition:opacity 400ms ease, width 350ms cubic-bezier(.22,1,.36,1), height 350ms cubic-bezier(.22,1,.36,1), border-color 350ms ease, background 350ms ease",
    "pointer-events:none",
    "z-index:80",
    "mix-blend-mode:difference",
    "opacity:0",
  ].join(";");
  document.body.appendChild(dot);

  let mx = -100, my = -100;
  let dx = -100, dy = -100;
  let visible = false;

  window.addEventListener("pointermove", (ev) => {
    mx = ev.clientX;
    my = ev.clientY;
    if (!visible) {
      dot.style.opacity = "1";
      visible = true;
    }
  });

  window.addEventListener("pointerleave", () => {
    dot.style.opacity = "0";
    visible = false;
  });

  const tick = () => {
    dx += (mx - dx) * 0.18;
    dy += (my - dy) * 0.18;
    dot.style.transform = `translate3d(${dx - 12}px, ${dy - 12}px, 0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const grow = () => {
    dot.style.width = "56px";
    dot.style.height = "56px";
    dot.style.borderColor = "rgba(255,255,255,0.6)";
  };
  const shrink = () => {
    dot.style.width = "24px";
    dot.style.height = "24px";
    dot.style.borderColor = "rgba(255,255,255,0.35)";
  };

  const interactive = "a, button, .magnetic, [role='button']";
  document.querySelectorAll<HTMLElement>(interactive).forEach((el) => {
    el.addEventListener("pointerenter", grow);
    el.addEventListener("pointerleave", shrink);
  });
}

// ----- Hero parallax (very subtle) ----------------------------------------
if (!reduced) {
  const hero = document.querySelector<HTMLElement>("#top");
  if (hero) {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 600);
        hero.style.setProperty("--hero-shift", `${y * 0.12}px`);
        const headline = hero.querySelector<HTMLElement>("h1");
        if (headline) headline.style.transform = `translateY(${y * 0.06}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }
}

export {};
