const contactNumber = "2349065162970";
const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const themeButton = document.querySelector("#theme-toggle");
const dialog = document.querySelector("#quote-dialog");
const quoteForm = document.querySelector("#quote-form");
const quoteService = document.querySelector("#quote-service");
const detailField = quoteForm.elements.details;
let loadBrief = "";

function setTheme(theme, persist = false) {
  const isLight = theme === "light";
  document.documentElement.dataset.theme = isLight ? "light" : "dark";
  const label = `Switch to ${isLight ? "dark" : "light"} mode`;
  themeButton.setAttribute("aria-label", label);
  themeButton.title = label;
  document.querySelector('meta[name="theme-color"]').content = isLight ? "#f4f3ee" : "#111211";
  if (persist) {
    try { localStorage.setItem("5forge-theme", isLight ? "light" : "dark"); } catch {}
  }
}

setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
themeButton.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light", true);
});

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  siteNav.classList.remove("is-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

function openQuote(service = "") {
  if (service) quoteService.value = service;
  dialog.showModal();
  quoteForm.elements.name.focus();
}

document.querySelectorAll("[data-open-quote]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.closest(".site-nav")) closeMenu();
    openQuote(button.dataset.service || "");
  });
});

document.querySelectorAll("[data-close-quote]").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => {
  loadBrief = "";
  quoteForm.reset();
});

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(quoteForm);
  const lines = [
    "Hello 5 FORGE, I would like to discuss a project in Abuja.",
    "",
    `Name: ${data.get("name")}`,
    `Phone: ${data.get("phone")}`,
    `Area: ${data.get("area")}`,
    `Service: ${data.get("service")}`,
    `Details: ${data.get("details") || "I would like to discuss the next steps."}`,
    loadBrief,
  ].filter(Boolean);
  const url = `https://wa.me/${contactNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
  dialog.close();
  quoteForm.reset();
  loadBrief = "";
});

const loadOptions = [...document.querySelectorAll("[data-load]")];
const loadTotal = document.querySelector("#load-total");
const loadCount = document.querySelector("#load-count");
const plannerQuote = document.querySelector("#planner-quote");

function updateLoadPlanner() {
  const chosen = loadOptions.filter((input) => input.checked);
  const watts = chosen.reduce((total, input) => total + Number(input.dataset.load), 0);
  loadTotal.textContent = watts >= 1000 ? `${(watts / 1000).toFixed(2)} kW` : `${watts} W`;
  loadCount.textContent = chosen.length ? `${chosen.length} essential load${chosen.length === 1 ? "" : "s"} selected` : "Select your essentials above";
  loadBrief = chosen.length ? `Appliances to discuss: ${chosen.map((input) => input.value).join(", ")} (rough connected load: ${watts} W).` : "";
}

loadOptions.forEach((input) => input.addEventListener("change", updateLoadPlanner));
plannerQuote.addEventListener("click", () => {
  const chosen = loadOptions.some((input) => input.checked);
  if (!chosen) {
    document.querySelector(".load-picker").scrollIntoView({ behavior: "smooth", block: "center" });
    loadOptions[0].focus();
    return;
  }
  quoteService.value = "Solar load assessment";
  detailField.value = loadBrief.replace("Appliances to discuss: ", "");
  openQuote("Solar load assessment");
});

const filterButtons = document.querySelectorAll(".filter-button");
const workCards = document.querySelectorAll(".work-card");
filterButtons.forEach((button) => button.addEventListener("click", () => {
  filterButtons.forEach((filter) => {
    const selected = filter === button;
    filter.classList.toggle("is-selected", selected);
    filter.setAttribute("aria-pressed", String(selected));
  });
  workCards.forEach((card) => {
    card.hidden = button.dataset.filter !== "all" && card.dataset.category !== button.dataset.filter;
  });
}));

const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach((section) => sectionObserver.observe(section));
}

const progress = document.querySelector(".reading-progress span");
let frame = false;
window.addEventListener("scroll", () => {
  if (frame) return;
  frame = true;
  requestAnimationFrame(() => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${total > 0 ? (window.scrollY / total) * 100 : 0}%`;
    frame = false;
  });
}, { passive: true });

document.querySelector("#year").textContent = new Date().getFullYear();
