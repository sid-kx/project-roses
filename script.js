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

  // ============ CUSTOM ORDER LOGIC ============

  // Primary ribbon colour (single select)
  const primaryRibbonOptions = document.querySelectorAll(
    "[data-ribbon-primary]"
  );

  primaryRibbonOptions.forEach((option) => {
    option.addEventListener("click", () => {
      primaryRibbonOptions.forEach((o) => o.classList.remove("is-selected"));
      option.classList.add("is-selected");
    });
  });

  // Secondary ribbon colour (optional single select; can be toggled off)
  const secondaryRibbonOptions = document.querySelectorAll(
    "[data-ribbon-secondary]"
  );

  secondaryRibbonOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const isAlreadySelected = option.classList.contains("is-selected");

      // Clear all first
      secondaryRibbonOptions.forEach((o) => o.classList.remove("is-selected"));

      // If it was not selected before, select it; if it was, leave all unselected (toggle off)
      if (!isAlreadySelected) {
        option.classList.add("is-selected");
      }
    });
  });

  // Add-ons and form submission
  const customOrderForm = document.querySelector("#custom-order-form");
  const customOrderSubmit = document.querySelector("#custom-order-submit");

  // Modal elements
  const orderModal = document.querySelector("#order-modal");
  const orderModalOverlay = document.querySelector("#order-modal-overlay");
  const orderModalCloseButtons = document.querySelectorAll(
    "[data-order-modal-close]"
  );

  const openOrderModal = () => {
    if (orderModal) {
      orderModal.classList.add("order-modal--open");
    }
    if (orderModalOverlay) {
      orderModalOverlay.classList.add("order-modal-overlay--open");
    }
  };

  const closeOrderModal = () => {
    if (orderModal) {
      orderModal.classList.remove("order-modal--open");
    }
    if (orderModalOverlay) {
      orderModalOverlay.classList.remove("order-modal-overlay--open");
    }
  };

  orderModalCloseButtons.forEach((btn) => {
    btn.addEventListener("click", closeOrderModal);
  });

  if (orderModalOverlay) {
    orderModalOverlay.addEventListener("click", (e) => {
      if (e.target === orderModalOverlay) {
        closeOrderModal();
      }
    });
  }

  const getSelectedRibbonColour = (selector) => {
    const el = document.querySelector(selector + ".is-selected");
    return el ? el.getAttribute("data-color") || null : null;
  };

  const buildFormDataFromUI = () => {
    const primaryColor = getSelectedRibbonColour("[data-ribbon-primary]");
    const secondaryColor = getSelectedRibbonColour("[data-ribbon-secondary]");

    // Add-on toggles (assume checkboxes or switches with these IDs)
    const addons = {
      glitter: document.querySelector("#addon-glitter")?.checked || false,
      crown: document.querySelector("#addon-crown")?.checked || false,
      butterfly: document.querySelector("#addon-butterfly")?.checked || false,
      writing: document.querySelector("#addon-writing")?.checked || false,
      gems: document.querySelector("#addon-gems")?.checked || false,
      dahliaQuantity:
        parseInt(
          document.querySelector("#addon-dahlia-qty")?.value || "0",
          10
        ) || 0,
      plumeriaQuantity:
        parseInt(
          document.querySelector("#addon-plumeria-qty")?.value || "0",
          10
        ) || 0,
    };

    const details =
      document.querySelector("#order-details")?.value.trim() || "";
    const name =
      document.querySelector("#customer-name")?.value.trim() || "";
    const phone =
      document.querySelector("#customer-phone")?.value.trim() || "";

    return {
      primaryColor,
      secondaryColor,
      addons,
      details,
      name,
      phone,
    };
  };

  const validateFormData = (data) => {
    const errors = [];

    if (!data.primaryColor) {
      errors.push("Please choose a primary ribbon colour.");
    }

    if (!data.name) {
      errors.push("Please enter your name.");
    }

    if (!data.phone) {
      errors.push("Please enter your phone number.");
    }

    if (
      data.addons.dahliaQuantity < 0 ||
      data.addons.dahliaQuantity > 100 ||
      data.addons.plumeriaQuantity < 0 ||
      data.addons.plumeriaQuantity > 100
    ) {
      errors.push("Flower quantities must be between 0 and 100.");
    }

    return errors;
  };

  const sendCustomOrder = async (data) => {
    // Placeholder stub for now – this is where a real backend call will go.
    // Example later:
    // await fetch("https://your-api-url.com/api/custom-order", { ... })
    console.log("Custom order submitted:", data);
  };

  if (customOrderForm && customOrderSubmit) {
    customOrderSubmit.addEventListener("click", async (e) => {
      e.preventDefault();

      const formData = buildFormDataFromUI();
      const errors = validateFormData(formData);

      if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
      }

      try {
        await sendCustomOrder(formData);
        customOrderForm.reset();

        // Clear selected classes after reset
        primaryRibbonOptions.forEach((o) => o.classList.remove("is-selected"));
        secondaryRibbonOptions.forEach((o) =>
          o.classList.remove("is-selected")
        );

        openOrderModal();
      } catch (err) {
        console.error(err);
        alert(
          "Something went wrong while submitting your order. Please try again."
        );
      }
    });
  }
});