// ============ NAVBAR INTERACTIONS ============

document.addEventListener("DOMContentLoaded", () => {
  console.log("Roses site script loaded");
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

  let scrollAnimationFrame = null;

  const smoothScrollTo = (targetY, duration = 650) => {
    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    // easeInOutQuad for a nice smooth feel
    const easeInOutQuad = (t) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuad(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        scrollAnimationFrame = requestAnimationFrame(step);
      } else {
        scrollAnimationFrame = null;
      }
    };

    if (scrollAnimationFrame) {
      cancelAnimationFrame(scrollAnimationFrame);
    }
    scrollAnimationFrame = requestAnimationFrame(step);
  };

  const scrollToTarget = (targetSelector) => {
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    const elementPosition =
      targetEl.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerHeight + 4; // tiny buffer

    smoothScrollTo(offsetPosition, 650);
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
  const secondaryRibbonOptions = document.querySelectorAll(
    "[data-ribbon-secondary]"
  );
  // Hidden inputs for form submission
  const primaryColorHidden = document.querySelector("#primary-color-input");
  const secondaryColorHidden = document.querySelector("#secondary-color-input");
  const bouquetSizeHidden = document.querySelector("#bouquet-size-input");
  const normalRoseCountHidden = document.querySelector("#normal-rose-count-input");
  const totalFlowersHidden = document.querySelector("#total-flowers-input");
  const glitterHidden = document.querySelector("#glitter-choice-input");
  const gemsHidden = document.querySelector("#gems-choice-input");
  const writingHidden = document.querySelector("#writing-choice-input");
  const crownHidden = document.querySelector("#crown-choice-input");
  const butterflyHidden = document.querySelector("#butterfly-choice-input");
  const finalPriceHidden = document.querySelector("#final-price-input");

  primaryRibbonOptions.forEach((option) => {
    option.addEventListener("click", () => {
      primaryRibbonOptions.forEach((o) => o.classList.remove("is-selected"));
      option.classList.add("is-selected");

      const color = option.getAttribute("data-color") || "";
      if (primaryColorHidden) primaryColorHidden.value = color;
    });
  });

  // Secondary ribbon colour (optional single select; can be toggled off)
  secondaryRibbonOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const isAlreadySelected = option.classList.contains("is-selected");

      secondaryRibbonOptions.forEach((o) => o.classList.remove("is-selected"));

      let color = "";
      if (!isAlreadySelected) {
        option.classList.add("is-selected");
        color = option.getAttribute("data-color") || "";
      }
      if (secondaryColorHidden) secondaryColorHidden.value = color;
    });
  });


  // Add-ons and form submission
  const customOrderForm = document.querySelector("#custom-order-form");
  const customOrderSubmit = document.querySelector("#custom-order-submit");

  // ============ FLOWER COUNT PANEL & ROSE SLIDER ============

  const dahliaInput = document.querySelector("#addon-dahlia-qty");
  const plumeriaInput = document.querySelector("#addon-plumeria-qty");
  const flowerCountValue = document.querySelector("#flower-count-value");

  // New: base bouquet size selector (rose slider)
  const roseSlider = document.querySelector("#rose-count-slider");
  const roseCountDisplay = document.querySelector("#rose-count-display");

  // Discrete bouquet sizes, indexed by the range slider (0–5)
  const ROSE_SIZE_STEPS = [7, 9, 12, 15, 20, 30];

  // Pricing table (matches the Pricing section on the site)
  const ROSE_BOUQUET_PRICES = {
    7: 15,
    9: 20,
    12: 25,
    15: 30,
    20: 40,
    30: 50,
  };

  const ADDON_PRICES = {
    crown: 3,
    butterfly: 1,
    writing: 3,
    glitterPerRose: 0.75,
    gemsPerRose: 0.5,
    dahliaPerFlower: 5,
    plumeriaPerFlower: 5,
  };

  const parseQty = (inputEl) => {
    if (!inputEl) return 0;
    const raw = inputEl.value.trim();
    const n = parseInt(raw || "0", 10);
    return Number.isNaN(n) || n < 0 ? 0 : n;
  };

  const getBaseBouquetSize = () => {
    // If we have a slider, map its index to one of the discrete sizes.
    if (roseSlider) {
      const idx = parseInt(roseSlider.value || "0", 10);
      if (Number.isNaN(idx)) {
        return ROSE_SIZE_STEPS[0];
      }
      const clampedIndex = Math.min(
        Math.max(idx, 0),
        ROSE_SIZE_STEPS.length - 1
      );
      return ROSE_SIZE_STEPS[clampedIndex];
    }

    // Fallback: if no slider exists, just use the special flower total
    const dahliaQty = parseQty(dahliaInput);
    const plumeriaQty = parseQty(plumeriaInput);
    return dahliaQty + plumeriaQty;
  };

  const getFlowerCounts = () => {
    const dahliaQty = parseQty(dahliaInput);
    const plumeriaQty = parseQty(plumeriaInput);
    const specialTotal = dahliaQty + plumeriaQty;

    const baseTotal = getBaseBouquetSize();
    const roseCount = Math.max(baseTotal - specialTotal, 0);

    return { dahliaQty, plumeriaQty, baseTotal, specialTotal, roseCount };
  };

  const updateCostBreakdown = () => {
    const costList = document.querySelector("#cost-breakdown-list");
    const costTotalEl = document.querySelector("#cost-total-amount");

    if (!costList || !costTotalEl) return;

    const {
      dahliaQty,
      plumeriaQty,
      baseTotal,
      roseCount,
    } = getFlowerCounts();

    const items = [];

    // --- Base bouquet (normal roses only, priced by count) ---
    const bouquetPrice = ROSE_BOUQUET_PRICES[baseTotal] || 0;
    if (bouquetPrice > 0) {
      items.push({
        label: `Base bouquet (${baseTotal} flowers)`,
        qty: 1,
        unitPrice: bouquetPrice,
        subtotal: bouquetPrice,
      });
    }

    // --- Special flowers: Dahlia & Plumeria ($5 / flower each) ---
    if (dahliaQty > 0) {
      const unit = ADDON_PRICES.dahliaPerFlower;
      items.push({
        label: "Dahlia flowers",
        qty: dahliaQty,
        unitPrice: unit,
        subtotal: dahliaQty * unit,
      });
    }

    if (plumeriaQty > 0) {
      const unit = ADDON_PRICES.plumeriaPerFlower;
      items.push({
        label: "Plumeria flowers",
        qty: plumeriaQty,
        unitPrice: unit,
        subtotal: plumeriaQty * unit,
      });
    }

    // --- Add-ons ---
    // Crowns, butterflies, writing: flat price
    // Glitter & gems: per rose (only count actual roses in the bouquet)
    const addonDefs = [
      {
        id: "#addon-crown",
        label: "Crown",
        type: "flat",
        price: ADDON_PRICES.crown,
      },
      {
        id: "#addon-butterfly",
        label: "Butterfly",
        type: "flat",
        price: ADDON_PRICES.butterfly,
      },
      {
        id: "#addon-writing",
        label: "Writing",
        type: "flat",
        price: ADDON_PRICES.writing,
      },
      {
        id: "#addon-glitter",
        label: "Glitter (roses only)",
        type: "perRose",
        price: ADDON_PRICES.glitterPerRose,
      },
      {
        id: "#addon-gems",
        label: "Gems (roses only)",
        type: "perRose",
        price: ADDON_PRICES.gemsPerRose,
      },
    ];

    addonDefs.forEach((def) => {
      const checkbox = document.querySelector(def.id);
      if (!checkbox || !checkbox.checked) return;

      let qty = 1;
      let unitPrice = def.price;
      let subtotal = 0;

      if (def.type === "perRose") {
        // If there are no normal roses in the bouquet, there is nothing to apply the add-on to.
        if (roseCount <= 0) return;
        qty = roseCount;
        subtotal = qty * unitPrice;
      } else {
        subtotal = unitPrice;
      }

      items.push({
        label:
          def.type === "perRose"
            ? `${def.label} × ${qty} roses`
            : def.label,
        qty,
        unitPrice,
        subtotal,
      });
    });

    // --- Render list and total ---
    costList.innerHTML = "";
    let total = 0;

    items.forEach((item) => {
      total += item.subtotal;

      const li = document.createElement("li");
      li.className = "cost-row";

      const labelSpan = document.createElement("span");
      labelSpan.className = "cost-label";
      labelSpan.textContent =
        item.qty === 1 ? item.label : `${item.label}`;

      const amountSpan = document.createElement("span");
      amountSpan.className = "cost-amount";
      amountSpan.textContent = `$${item.subtotal.toFixed(2)}`;

      li.appendChild(labelSpan);
      li.appendChild(amountSpan);
      costList.appendChild(li);
    });

    costTotalEl.textContent = `$${total.toFixed(2)}`;
    if (finalPriceHidden) {
      finalPriceHidden.value = total.toFixed(2);
    }
  };

  const updateFlowerCount = () => {
    const { baseTotal, roseCount } = getFlowerCounts();

    // Update the "TOTAL FLOWERS" panel
    if (flowerCountValue) {
      flowerCountValue.textContent = baseTotal.toString();
    }

    // Update the normal rose count display (next to / under the slider)
    if (roseCountDisplay) {
      roseCountDisplay.textContent = roseCount.toString();
    }

    // Update hidden bouquet/rose/total flower counts
    if (bouquetSizeHidden) {
      bouquetSizeHidden.value = String(baseTotal);
    }
    if (normalRoseCountHidden) {
      normalRoseCountHidden.value = String(roseCount);
    }
    if (totalFlowersHidden) {
      totalFlowersHidden.value = String(baseTotal);
    }

    // Refresh the cost panel whenever counts change
    updateCostBreakdown();
  };

  // Wire up listeners for the special flower quantity inputs
  if (dahliaInput) {
    dahliaInput.addEventListener("input", updateFlowerCount);
    dahliaInput.addEventListener("change", updateFlowerCount);
  }

  if (plumeriaInput) {
    plumeriaInput.addEventListener("input", updateFlowerCount);
    plumeriaInput.addEventListener("change", updateFlowerCount);
  }

  // Wire up the slider (if present) and ensure its range matches our steps
  if (roseSlider) {
    // Ensure sensible defaults in case they aren't set in HTML
    if (!roseSlider.hasAttribute("min")) roseSlider.min = "0";
    if (!roseSlider.hasAttribute("max"))
      roseSlider.max = String(ROSE_SIZE_STEPS.length - 1);
    if (!roseSlider.hasAttribute("step")) roseSlider.step = "1";
    if (!roseSlider.value) roseSlider.value = "3";

    roseSlider.addEventListener("input", updateFlowerCount);
    roseSlider.addEventListener("change", updateFlowerCount);
  }

  // When any add-on checkbox changes, refresh the cost panel
  const addonCheckboxes = document.querySelectorAll(
    "#addon-glitter, #addon-crown, #addon-butterfly, #addon-writing, #addon-gems"
  );
  addonCheckboxes.forEach((input) => {
    input.addEventListener("change", updateCostBreakdown);
  });

  // Initialize on load so the panels are never empty
  updateFlowerCount();

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
    const dahliaQuantity =
      parseInt(
        document.querySelector("#addon-dahlia-qty")?.value || "0",
        10
      ) || 0;
    const plumeriaQuantity =
      parseInt(
        document.querySelector("#addon-plumeria-qty")?.value || "0",
        10
      ) || 0;

    const addons = {
      glitter: document.querySelector("#addon-glitter")?.checked || false,
      crown: document.querySelector("#addon-crown")?.checked || false,
      butterfly: document.querySelector("#addon-butterfly")?.checked || false,
      writing: document.querySelector("#addon-writing")?.checked || false,
      gems: document.querySelector("#addon-gems")?.checked || false,
      dahliaQuantity,
      plumeriaQuantity,
    };

    const details =
      document.querySelector("#order-details")?.value.trim() || "";
    const name =
      document.querySelector("#customer-name")?.value.trim() || "";
    const phone =
      document.querySelector("#customer-phone")?.value.trim() || "";

    // Derive rose & total flower counts from the same logic as the UI
    const baseTotal = getBaseBouquetSize();
    const specialTotal = dahliaQuantity + plumeriaQuantity;
    const roseCount = Math.max(baseTotal - specialTotal, 0);
    const totalFlowers = baseTotal;

    // Populate hidden bouquet/rose/total flower counts
    if (bouquetSizeHidden) {
      bouquetSizeHidden.value = String(baseTotal);
    }
    if (normalRoseCountHidden) {
      normalRoseCountHidden.value = String(roseCount);
    }
    if (totalFlowersHidden) {
      totalFlowersHidden.value = String(totalFlowers);
    }

    // Populate hidden add-on fields
    if (glitterHidden) {
      glitterHidden.value = addons.glitter ? "yes" : "no";
    }
    if (gemsHidden) {
      gemsHidden.value = addons.gems ? "yes" : "no";
    }
    if (writingHidden) {
      writingHidden.value = addons.writing ? "yes" : "no";
    }
    if (crownHidden) {
      crownHidden.value = addons.crown ? "yes" : "no";
    }
    if (butterflyHidden) {
      butterflyHidden.value = addons.butterfly ? "yes" : "no";
    }

    return {
      primaryColor,
      secondaryColor,
      addons,
      details,
      name,
      phone,
      roseCount,
      totalFlowers,
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

  const handleCustomOrderSubmit = (e) => {
    if (e) e.preventDefault();

    // Make sure counts and costs are up to date before reading values
    updateFlowerCount();
    updateCostBreakdown();

    const formData = buildFormDataFromUI();
    const errors = validateFormData(formData);

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // Allow the normal HTML form submission to FormSubmit
    customOrderForm.submit();
  };

  // Attach handler to the form submit (works even if the button ID changes)
  if (customOrderForm) {
    customOrderForm.addEventListener("submit", handleCustomOrderSubmit);
  }

  // Also attach directly to the button if it exists and is type="button"
  if (customOrderSubmit) {
    customOrderSubmit.addEventListener("click", handleCustomOrderSubmit);
  }
});