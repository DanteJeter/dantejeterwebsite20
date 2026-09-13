const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
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



// Version 13: one property configuration drives the featured homepage card.
(function hydrateFeaturedProperty() {
  const property = window.PROPERTY_DATA;
  if (!property) return;
  const path = `${property.assetBase}/${property.hero}?v=${property.version}`;
  const image = document.getElementById("featured-property-image");
  if (image) {
    image.style.backgroundImage = `url("${path}"), url("assets/media-fallback.svg")`;
    image.dataset.mediaPath = path;
  }
  const price = document.getElementById("featured-property-price");
  if (price) price.textContent = property.price;
  const address = document.getElementById("featured-property-address");
  if (address) address.textContent = property.address;
  const summary = document.getElementById("featured-property-summary");
  if (summary) summary.textContent = `3 beds · 2 baths · 1,060 sq. ft. · Weirton, WV · MLS #${property.mls}`;
  const link = document.getElementById("featured-property-link");
  if (link) {
    link.href = property.page;
    link.textContent = `Explore ${property.address}`;
  }
})();


// Version 15: lifecycle-aware, manually prioritized listing platform.
(function renderHomepageListings(){
 const target=document.getElementById('homepage-listings');
 if(!target||!Array.isArray(window.LISTINGS_DATA)) return;
 const records=window.LISTINGS_DATA.filter(x=>x.featured).sort((a,b)=>(a.featuredOrder||99)-(b.featuredOrder||99)).slice(0,8);
 const statusClass=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-');
 target.innerHTML=records.map(item=>`<article class="property-card${item.placeholder?' property-card--placeholder':''}"><div class="property-card__image" style="background-image:url('${item.image}')" role="img" aria-label="${item.address}"><span class="listing-ribbon listing-ribbon--${statusClass(item.status)}">${item.status}</span></div><div class="property-card__body"><strong class="property-card__price">${item.price}</strong><h3>${item.address}</h3><p>${item.type==='Commercial'?`${item.subtype||'Commercial'} · ${item.acres||'—'} acres · ${item.bays||'Flexible space'}`:`${item.beds} beds · ${item.baths} baths · ${item.sqft} sq. ft.`} · ${item.cityStateZip}</p><a class="button button--light" href="${item.page}">${item.placeholder?'Listing Details Coming Soon':'Explore Property'}</a></div></article>`).join('');
})();

// Quiet reveal polish; disabled automatically for reduced-motion users.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12});
 document.querySelectorAll('.marketing-grid article,.community-grid article,.insight-grid article,.success-actions a').forEach(el=>{el.classList.add('reveal');observer.observe(el)});
}
