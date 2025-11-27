// ============ NAVBAR INTERACTIONS ============

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  // Mobile nav toggle (hamburger)
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      navLinks.classList.toggle("nav-open");
    });

    // Close mobile nav when a link is clicked
    navLinks.addEventListener("click", (event) => {
      if (event.target.matches("a")) {
        navToggle.classList.remove("active");
        navLinks.classList.remove("nav-open");
      }
    });
  }

  // ===== Smooth scrolling with navbar offset =====
  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;

  const scrollToTarget = (targetSelector) => {
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    const elementPosition =
      targetEl.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerHeight + 4; // tiny buffer

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  // Smooth scroll for navbar links (anchors)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");

      if (targetId && targetId !== "#") {
        e.preventDefault();
        scrollToTarget(targetId);
      }
    });
  });

  // Smooth scroll for non-anchor elements (e.g. hero buttons)
  document.querySelectorAll("[data-scroll-target]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const targetSelector = el.getAttribute("data-scroll-target");
      if (!targetSelector) return;

      e.preventDefault();
      scrollToTarget(targetSelector);
    });
  });

  // ============ PRICING STICKER SPIN ON SCROLL ============
  const pricingSection = document.querySelector("#pricing");
  const pricingSticker = document.querySelector(".pricing-sticker");

  if (pricingSection && pricingSticker && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            pricingSticker.classList.add("spin-active");
          } else {
            pricingSticker.classList.remove("spin-active");
          }
        });
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(pricingSection);
  }
});