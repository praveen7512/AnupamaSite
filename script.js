/* ============================================================
   CONFIG: fill these in. Empty values hide the matching button.
   PHONE / WHATSAPP: use international format, e.g. "+91 98xxxxxxxx"
   ============================================================ */
const CONFIG = {
  EMAIL: "",      // TODO: e.g. "anupama@example.com"
  PHONE: "",      // TODO: e.g. "+91 9xxxxxxxxx"
  WHATSAPP: "",   // TODO: number for WhatsApp (leave empty to reuse PHONE, or set to "-" to hide)
  LINKEDIN: "https://www.linkedin.com/in/anupama-p-7a628165/",
};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const digits = (n) => (n || "").replace(/[^\d]/g, "");

  // Year
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // Contact links
  const wa = CONFIG.WHATSAPP === "-" ? "" : (CONFIG.WHATSAPP || CONFIG.PHONE);
  const map = {
    email: CONFIG.EMAIL && { href: "mailto:" + CONFIG.EMAIL, val: CONFIG.EMAIL },
    phone: CONFIG.PHONE && { href: "tel:+" + digits(CONFIG.PHONE), val: CONFIG.PHONE },
    whatsapp: digits(wa) && { href: "https://wa.me/" + digits(wa) },
    linkedin: CONFIG.LINKEDIN && { href: CONFIG.LINKEDIN },
  };
  $$(".clink").forEach((a) => {
    const d = map[a.dataset.kind];
    if (!d) { a.hidden = true; return; }
    a.href = d.href; a.hidden = false;
    if (d.val) $(".cval", a).textContent = d.val;
  });

  // Printable resume: fill contact line from CONFIG, hide empty items
  $$("[data-cfg]").forEach((el) => {
    const k = el.dataset.cfg, v = CONFIG[k];
    if (!v) { el.remove(); return; }
    const a = el.querySelector("a") || el;
    a.textContent = k === "LINKEDIN" ? v.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : v;
    if (a.tagName === "A") a.href = k === "EMAIL" ? "mailto:" + v : k === "PHONE" ? "tel:+" + digits(v) : v;
  });
  if (/[?&]print=1/.test(location.search)) addEventListener("load", () => setTimeout(() => print(), 400));

  // Contact form -> mailto (needs EMAIL)
  const form = $("#contact-form"), note = $("#form-note");
  if (form) {
    if (!CONFIG.EMAIL) {
      // No email configured: keep the form but explain; LinkedIn remains available.
      note.textContent = "Email isn't set up yet. Please reach out via LinkedIn for now.";
      $("button[type=submit]", form).disabled = true;
      $("button[type=submit]", form).style.opacity = .5;
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!CONFIG.EMAIL) return;
      if (!form.reportValidity()) return;
      const f = Object.fromEntries(new FormData(form));
      const subject = `Opportunity for Anupama P.${f.org ? " – " + f.org : ""}`;
      const body = `Hi Anupama,\n\n${f.message}\n\nBest regards,\n${f.name}${f.org ? "\n" + f.org : ""}\n${f.from}`;
      location.href = `mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      note.textContent = "Opening your email app…";
    });
  }

  // Download resume: fall back to printable page if the PDF isn't there (e.g. file:// or not uploaded)
  const dl = $("#download-resume");
  if (dl && location.protocol.startsWith("http")) {
    fetch(dl.getAttribute("href"), { method: "HEAD" }).then((r) => {
      if (!r.ok) { dl.removeAttribute("download"); dl.href = "resume.html?print=1"; }
    }).catch(() => {});
  }

  // Mobile nav
  const toggle = $(".nav-toggle"), links = $("#nav-links");
  if (toggle && links) toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  if (links) $$("a", links).forEach((a) => a.addEventListener("click", () => {
    links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
  }));

  // Nav border on scroll
  const nav = $(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Reveal on scroll
  const els = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  } else els.forEach((el) => el.classList.add("in"));
  addEventListener("beforeprint", () => els.forEach((el) => el.classList.add("in")));
})();
