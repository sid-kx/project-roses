// ============ NAVBAR INTERACTIONS ============

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

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

  // Optional: smooth scrolling offset adjustment for sticky navbar
  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      const targetEl = document.querySelector(targetId);

      if (targetEl) {
        e.preventDefault();
        const elementPosition =
          targetEl.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight + 4; // tiny buffer

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
});