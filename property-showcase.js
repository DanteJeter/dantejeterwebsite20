
// Version 13 media system: a single configuration is the source of truth.
(function hydratePropertyMedia() {
  const property = window.PROPERTY_DATA;
  if (!property) return;

  // Version 17: hydrate visible property facts from the single master record.
  const headline = document.querySelector(".property-hero-content h1");
  const location = document.querySelector(".hero-location");
  const description = document.querySelector(".hero-description");
  const price = document.querySelector(".price-card > strong");
  const statusLocation = document.querySelector(".status-row span:not(.status-pill)");
  if (headline && property.headline) headline.textContent = property.headline;
  if (location) location.textContent = `${property.address} · ${property.cityStateZip}`;
  if (description && property.heroDescription) description.textContent = property.heroDescription;
  if (price) price.textContent = property.price;
  if (statusLocation) statusLocation.textContent = property.cityStateZip;

  // Version 17.1: every At a Glance value reads from the master property record.
  document.querySelectorAll("[data-property-field]").forEach((node) => {
    const field = node.dataset.propertyField;
    let value = property[field];
    if (value === undefined || value === null || value === "") return;
    if (node.dataset.propertyFormat === "acres") value = `Approximately ${value} acres`;
    node.textContent = String(value);
  });

  const factNodes = [...document.querySelectorAll(".price-card .facts-inline > div")];
  (property.detailFacts || []).forEach((fact, index) => {
    const node = factNodes[index];
    if (!node) return;
    const value = node.querySelector("b");
    const label = node.querySelector("span");
    if (value) value.textContent = fact.value;
    if (label) label.textContent = fact.label;
  });

  document.querySelectorAll(".js-lead-form").forEach((form) => {
    if (form.dataset.formType === "Showing Request") {
      form.dataset.listingId = property.id;
      form.dataset.propertyAddress = `${property.address}, ${property.cityStateZip}`;
    }
  });

  document.title = `${property.address} | Dante Jeter, REALTOR®`;

  const versioned = (file) => `${property.assetBase}/${file}?v=${property.version}`;
  const fallback = "assets/media-fallback.svg";

  const hero = document.querySelector(".property-hero-image");
  if (hero) {
    hero.style.backgroundImage = `linear-gradient(rgba(9,18,14,.08), rgba(9,18,14,.08)), url("${versioned(property.hero)}"), url("${fallback}")`;
    hero.dataset.mediaPath = versioned(property.hero);
  }

  const gallery = document.getElementById("property-gallery");
  if (gallery) {
    gallery.innerHTML = "";
    property.photos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `gallery-item${index === 0 ? " gallery-item-large" : ""}`;
      button.dataset.galleryIndex = String(index);
      button.setAttribute("aria-label", `Open photo: ${photo.alt}`);
      const image = document.createElement("img");
      image.src = versioned(photo.file);
      image.alt = photo.alt;
      image.decoding = "async";
      image.loading = index === 0 ? "eager" : "lazy";
      image.addEventListener("error", () => {
        if (!image.dataset.fallbackApplied) {
          image.dataset.fallbackApplied = "true";
          image.src = fallback;
          image.alt = `${photo.alt} — image temporarily unavailable`;
        }
      });
      button.appendChild(image);
      gallery.appendChild(button);
    });
  }

  const floorPlanGrid = document.getElementById("property-floor-plans");
  const floorPlanSection = document.getElementById("floor-plans-section");
  if (floorPlanGrid) {
    const plans = property.floorPlans || [];
    if (!plans.length && floorPlanSection) floorPlanSection.hidden = true;
    floorPlanGrid.innerHTML = plans.map((plan) => `
      <figure class="floor-plan-card">
        <a href="${versioned(plan.file)}" target="_blank" rel="noopener">
          <img src="${versioned(plan.file)}" alt="${plan.alt}" loading="lazy" decoding="async">
        </a>
        <figcaption>${plan.alt}</figcaption>
      </figure>`).join("");
  }

  const video = document.getElementById("property-walkthrough");
  const source = document.getElementById("property-walkthrough-source");
  if (video && source && property.video) {
    video.poster = versioned(property.videoPoster);
    source.src = versioned(property.video);
    video.dataset.mediaVersion = String(property.version);
    video.load();
    video.addEventListener("error", () => {
      const notice = document.createElement("p");
      notice.className = "media-error-notice";
      notice.innerHTML = `The walkthrough could not load. <a href="${versioned(property.video)}">Open the video directly</a>.`;
      if (!video.parentElement.querySelector(".media-error-notice")) video.after(notice);
    });
  }
})();

const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

const LEAD_ENDPOINT = "https://formspree.io/f/xnjevznr";
const THANK_YOU_PAGE = "./thank-you.html";

function getTrackingData() {
  const params = new URLSearchParams(window.location.search);
  return {
    pageUrl: window.location.href,
    propertyUrl: window.location.href,
    leadSource: params.get("source") || params.get("utm_source") || "Website",
    campaign: params.get("campaign") || params.get("utm_campaign") || "Organic Website",
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    referringWebsite: document.referrer || "Direct",
    deviceType: /Mobi|Android/i.test(navigator.userAgent)
      ? "Mobile"
      : /Tablet|iPad/i.test(navigator.userAgent)
        ? "Tablet"
        : "Desktop",
    browser: navigator.userAgent
  };
}

function normalizeForm(form) {
  const raw = Object.fromEntries(new FormData(form).entries());
  const fullName = raw["seller-name"] || "";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const contact = raw["seller-contact"] || "";
  const formType = form.dataset.formType || "Website Inquiry";
  const propertyAddress =
    raw.propertyAddress ||
    raw["property-address"] ||
    form.dataset.propertyAddress ||
    "";

  return {
    _subject: `${formType}${propertyAddress ? ` — ${propertyAddress}` : ""}`,
    formType,
    firstName: raw.firstName || raw["first-name"] || parts[0] || "",
    lastName: raw.lastName || raw["last-name"] || parts.slice(1).join(" ") || "",
    email: raw.email || (contact.includes("@") ? contact : ""),
    phone: raw.phone || (!contact.includes("@") ? contact : ""),
    propertyAddress,
    listingId: form.dataset.listingId || "",
    preferredShowingDate: raw.preferredShowingDate || raw.date || "",
    preferredShowingTime: raw.preferredShowingTime || raw.time || "",
    preferredContactMethod: raw.preferredContactMethod || "",
    preApproved: raw.preApproved || "",
    workingWithAgent: raw.workingWithAgent || "",
    message: raw.message || (raw.timeline ? `Selling timeline: ${raw.timeline}` : ""),
    ...getTrackingData()
  };
}

function getFormMessage(form) {
  let message = form.querySelector(".form-message");
  if (!message) {
    message = document.createElement("p");
    message.className = "form-message";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    form.appendChild(message);
  }
  return message;
}

function setSubmittingState(form, isSubmitting) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  button.disabled = isSubmitting;
  button.classList.toggle("is-loading", isSubmitting);
  button.setAttribute("aria-busy", String(isSubmitting));
}

async function submitLead(form) {
  const message = getFormMessage(form);

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  setSubmittingState(form, true);
  message.textContent = "Sending your request…";
  message.classList.remove("is-error", "is-success");

  try {
    const payload = normalizeForm(form);
    const response = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = "Your request could not be sent.";
      try {
        const result = await response.json();
        if (Array.isArray(result.errors) && result.errors.length) {
          errorMessage = result.errors.map((error) => error.message).join(" ");
        }
      } catch (_) {
        // Formspree may return a non-JSON response during a temporary outage.
      }
      throw new Error(errorMessage);
    }

    sessionStorage.setItem(
      "leadSubmission",
      JSON.stringify({
        type: payload.formType,
        property: payload.propertyAddress
      })
    );

    message.textContent = "Thank you. Your information has been received successfully.";
    message.classList.add("is-success");
    form.reset();

    window.setTimeout(() => {
      window.location.assign(THANK_YOU_PAGE);
    }, 650);
  } catch (error) {
    console.error("Formspree submission failed:", error);
    message.textContent = `${error.message || "We could not send your request."} Please call Dante at (304) 617-6896.`;
    message.classList.add("is-error");
    setSubmittingState(form, false);
  }
}

document.querySelectorAll(".js-lead-form").forEach((form) => {
  form.action = LEAD_ENDPOINT;
  form.method = "POST";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitLead(form);
  });
});


const priceInput = document.getElementById("home-price");
const downInput = document.getElementById("down-payment");
const rateInput = document.getElementById("interest-rate");
const termInput = document.getElementById("loan-term");

const paymentOutput = document.getElementById("monthly-payment");
const loanOutput = document.getElementById("loan-amount");
const downValueOutput = document.getElementById("down-payment-value");
const termOutput = document.getElementById("term-value");
const rateOutput = document.getElementById("rate-value");

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateMortgage() {
  const price = Math.max(Number(priceInput?.value) || 0, 0);
  const downPercent = Math.min(Math.max(Number(downInput?.value) || 0, 0), 100);
  const annualRate = Math.max(Number(rateInput?.value) || 0, 0);
  const years = Math.max(Number(termInput?.value) || 30, 1);

  const downAmount = price * (downPercent / 100);
  const principal = Math.max(price - downAmount, 0);
  const numberOfPayments = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  let monthlyPayment = 0;

  if (principal > 0) {
    monthlyPayment =
      monthlyRate === 0
        ? principal / numberOfPayments
        : principal *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  paymentOutput.textContent = currency(monthlyPayment);
  loanOutput.textContent = currency(principal);
  downValueOutput.textContent = currency(downAmount);
  termOutput.textContent = `${years} years`;
  rateOutput.textContent = `${annualRate.toFixed(2)}%`;
}

[priceInput, downInput, rateInput, termInput].forEach((input) => {
  input?.addEventListener("input", calculateMortgage);
  input?.addEventListener("change", calculateMortgage);
});

calculateMortgage();

const galleryItems = [...document.querySelectorAll(".gallery-item")];
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const closeButton = document.querySelector(".lightbox-close");
const previousButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");
const openGalleryButton = document.querySelector("[data-open-gallery]");

let activeImage = 0;

function showImage(index) {
  if (!galleryItems.length) return;
  activeImage = (index + galleryItems.length) % galleryItems.length;

  const image = galleryItems[activeImage].querySelector("img");
  const caption = null;

  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = "";
}

function openLightbox(index = 0) {
  showImage(index);
  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  } else {
    lightbox.setAttribute("open", "");
  }
}

galleryItems.forEach((item, index) => {
  item.addEventListener("click", () => openLightbox(index));
});

openGalleryButton?.addEventListener("click", () => openLightbox(0));
closeButton?.addEventListener("click", () => lightbox.close());
previousButton?.addEventListener("click", () => showImage(activeImage - 1));
nextButton?.addEventListener("click", () => showImage(activeImage + 1));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox?.open) return;
  if (event.key === "ArrowLeft") showImage(activeImage - 1);
  if (event.key === "ArrowRight") showImage(activeImage + 1);
  if (event.key === "Escape") lightbox.close();
});

// Version 15 property lifecycle and related-listing support.
(function(){const all=Array.isArray(window.LISTINGS_DATA)?window.LISTINGS_DATA:[];const propertyId=window.PROPERTY_DATA?.id||window.PROPERTY_DATA?.slug||'';const current=all.find(x=>x.id===propertyId);const pill=document.getElementById('property-status-pill');if(current&&pill){pill.textContent=current.status;pill.classList.add('status-'+current.status.toLowerCase().replace(/[^a-z0-9]+/g,'-'));}const target=document.getElementById('related-listings');if(!target)return;const related=all.filter(x=>x.id!==propertyId&&x.status!=='Sold').slice(0,3);target.innerHTML=related.map(x=>`<article><div style="background-image:url('${x.image}')"><span>${x.status}</span></div><h3>${x.address}</h3><p>${x.price} · ${x.cityStateZip}</p><a href="${x.page}">${x.placeholder?'Details coming soon':'Explore property'} →</a></article>`).join('');})();
