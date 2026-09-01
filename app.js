/* ============================================================
   MAWLYNGBNA ADVENTURE — APP LOGIC
   Reads config (defaults + any admin overrides saved in
   localStorage), renders the form as a 2-page flow:
     Page 1: visitor details, package, add-ons, payment mode pick
     Page 2: only the chosen payment method's details + total,
             with Back / Submit buttons. Submit opens WhatsApp
             with every answer pre-filled.
   ============================================================ */

const STORAGE_KEY = "mawlyngbna_config_v1";

/** Merge saved admin overrides on top of the shipped defaults. */
function loadConfig() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(DEFAULT_CONFIG);
  try {
    const parsed = JSON.parse(saved);
    // shallow+nested merge so a partial save never loses defaults
    return {
      ...structuredClone(DEFAULT_CONFIG),
      ...parsed,
      payment: { ...DEFAULT_CONFIG.payment, ...(parsed.payment || {}) },
      homestay: { ...DEFAULT_CONFIG.homestay, ...(parsed.homestay || {}) },
      camping: { ...DEFAULT_CONFIG.camping, ...(parsed.camping || {}) },
      pricing: { ...DEFAULT_CONFIG.pricing, ...(parsed.pricing || {}) },
      limits: { ...DEFAULT_CONFIG.limits, ...(parsed.limits || {}) },
      packages: parsed.packages && parsed.packages.length ? parsed.packages : DEFAULT_CONFIG.packages
    };
  } catch (e) {
    console.warn("Config parse failed, using defaults", e);
    return structuredClone(DEFAULT_CONFIG);
  }
}

const CONFIG = loadConfig();
// Shorthand used everywhere below to read the editable text strings.
const L = CONFIG.labels || {};

/* ----------------------------------------------------------------
   Steppers (+ / -) are wired FIRST and on their own, before any
   other rendering. That way, if something later in setup throws
   (a bad admin override, a missing config field, etc.) the +/-
   buttons for participants and children still work — this was the
   root cause of the "child +/- button not working" bug: one script
   error anywhere earlier in the file used to stop every listener
   below it from ever being attached.
------------------------------------------------------------------- */
const stepperLimits = {
  participants: [CONFIG.limits?.minParticipants ?? 1, CONFIG.limits?.maxParticipants ?? 50],
  children: [CONFIG.limits?.minChildren ?? 0, CONFIG.limits?.maxChildren ?? 50],
  hsAdults: [0, CONFIG.limits?.maxParticipants ?? 50],
  hsChildren: [CONFIG.limits?.minChildren ?? 0, CONFIG.limits?.maxChildren ?? 50]
};

function setupSteppers() {
  document.querySelectorAll("[data-stepper]").forEach(wrap => {
    const key = wrap.dataset.stepper;
    const [min, max] = stepperLimits[key] || [0, 99];
    const input = wrap.querySelector(".stepper-value");
    const decBtn = wrap.querySelector('[data-action="dec"]');
    const incBtn = wrap.querySelector('[data-action="inc"]');
    if (!input || !decBtn || !incBtn) return;

    function update(val) {
      if (Number.isNaN(val)) val = min;
      val = Math.max(min, Math.min(max, val));
      input.value = String(val);
      decBtn.disabled = val <= min;
      incBtn.disabled = val >= max;
      safeRecalcTotal();
    }
    decBtn.addEventListener("click", () => update((parseInt(input.value, 10) || 0) - 1));
    incBtn.addEventListener("click", () => update((parseInt(input.value, 10) || 0) + 1));
    update(parseInt(input.value, 10));
    if (Number.isNaN(parseInt(input.value, 10))) update(min);
  });
}
setupSteppers();

/* ---------------- Everything else, defensively ---------------- */
try { renderLabels(); } catch (e) { console.error("Label render failed", e); }
try { renderHeader(); } catch (e) { console.error("Header render failed", e); }
try { renderPackages(); } catch (e) { console.error("Package render failed", e); }
try { renderAddonSections(); } catch (e) { console.error("Add-on render failed", e); }
try { renderPaymentDetailText(); } catch (e) { console.error("Payment detail render failed", e); }
try { setupPaymentReveal(); } catch (e) { console.error("Payment reveal setup failed", e); }
try { setupCopyButtons(); } catch (e) { console.error("Copy buttons setup failed", e); }
try { setupQrDownload(); } catch (e) { console.error("QR download setup failed", e); }
try { setupNavigation(); } catch (e) { console.error("Page navigation setup failed", e); }
try { setupClearForm(); } catch (e) { console.error("Clear form setup failed", e); }
try { setupAdminTrigger(); } catch (e) { console.error("Admin trigger setup failed", e); }
safeRecalcTotal();

/* ---------------- Render every static piece of text on the page ----------------
   Every label, placeholder, note, error message, and button text a
   visitor can see comes from CONFIG.labels (config.js), so editing
   that file — or the Admin Dashboard's "Text on the form" section —
   changes the live site with nothing hard-coded in the HTML. */
function setText(id, value) { const el = document.getElementById(id); if (el && value !== undefined) el.textContent = value; }
function setPlaceholder(id, value) { const el = document.getElementById(id); if (el && value !== undefined) el.placeholder = value; }

function renderLabels() {
  setText("topNote", L.topNote);
  setText("requiredNote", L.requiredNote);

  setText("nameLabel", L.nameLabel);
  setPlaceholder("f_name", L.namePlaceholder);
  setText("err_name", L.nameError);

  setText("whatsappLabel", L.whatsappLabel);
  setPlaceholder("f_whatsapp", L.whatsappPlaceholder);
  setText("err_whatsapp", L.whatsappError);

  setText("dateLabel", L.dateLabel);
  setText("err_date", L.dateError);

  setText("participantsLabel", L.participantsLabel);
  setText("childrenLabel", L.childrenLabel);

  setText("packageQuestionLabel", L.packageQuestionLabel);
  const flatChildPrice = CONFIG.pricing?.childFlatPrice ?? 0;
  setText("packageChildNote", (L.packageChildNote ?? "").replace("{price}", String(flatChildPrice)));
  setText("err_package", L.packageError);

  setText("specialLabel", L.specialLabel);
  setPlaceholder("f_special", L.specialPlaceholder);

  setText("paymentModeLabel", L.paymentModeLabel);
  setText("pm_upi_label", L.payUpiOption);
  setText("pm_bank_label", L.payBankOption);
  setText("pm_qr_label", L.payQrOption);
  setText("err_payment", L.paymentModeError);

  setText("hs_yes_label", L.homestayYesOption);
  setText("hs_no_label", L.homestayNoOption);
  setText("cp_yes_label", L.campingYesOption);
  setText("cp_no_label", L.campingNoOption);

  setText("clearFormBtn", L.clearFormBtn);
  setText("nextBtn", L.nextBtn);

  setText("page2Title", L.page2Title);
  setText("payUpiHeading", L.payUpiHeading);
  setText("upiIdRowLabel", L.upiIdRowLabel);
  setText("payBankHeading", L.payBankHeading);
  setText("accountRowLabel", L.accountRowLabel);
  setText("ifscRowLabel", L.ifscRowLabel);
  setText("payQrHeading", L.payQrHeading);
  setText("scanAndPayText", L.scanAndPayText);
  setText("qrDownloadBtn", L.downloadQrBtn);
  setText("copyBtnUpi2", L.copyUpiBtn);

  ["copyBtnUpi", "copyBtnAcc", "copyBtnIfsc"].forEach(id => setText(id, L.copyBtnText));

  setText("estimatedTotalLabel", L.estimatedTotalLabel);
  setText("totalLabel", L.totalLabel);
  setText("totalFooterNote", L.totalFooterNote);

  setText("backBtn", L.backBtn);
  setText("submitBtn", L.submitBtn);

  // Page indicator starts on page 1
  setText("pageIndicator", L.page1Indicator);
}

/* ---------------- Render header text ---------------- */
function renderHeader() {
  document.getElementById("formTitle").textContent = CONFIG.formTitle;
  document.getElementById("formSubtitle").textContent = CONFIG.formSubtitle;
  document.title = CONFIG.formTitle;
}

/* ---------------- Render packages (multi-select) ---------------- */
function renderPackages() {
  const packageListEl = document.getElementById("packageList");
  packageListEl.innerHTML = "";
  CONFIG.packages.forEach((pkg) => {
    const row = document.createElement("div");
    row.className = "choice-row";
    row.innerHTML = `
      <input type="checkbox" name="package" value="${pkg.id}" id="pkg_${pkg.id}">
      <label for="pkg_${pkg.id}">${pkg.label} <span class="choice-price">= \u20B9${pkg.price} ${L.perPersonText ?? "per person"}</span></label>
    `;
    packageListEl.appendChild(row);
    row.querySelector("input").addEventListener("change", () => {
      document.getElementById("err_package").classList.remove("show");
      safeRecalcTotal();
    });
  });
}

/* ---------------- Home stay / Camping sections ---------------- */
function renderAddonSections() {
  const homestayCard = document.getElementById("homestayCard");
  const campingCard = document.getElementById("campingCard");

  if (!CONFIG.homestay.enabled) {
    homestayCard.style.display = "none";
  } else {
    const hs = CONFIG.homestay;
    const prefix = L.notePrefix ?? "note : ";
    document.getElementById("homestayTitle").textContent = hs.title;
    document.getElementById("homestayNote").textContent = `${prefix}${hs.note}`;
    setText("homestayAdultsLabel", L.homestayAdultsLabel);
    setText("homestayChildrenLabel", L.homestayChildrenLabel);
  }

  if (!CONFIG.camping.enabled) {
    campingCard.style.display = "none";
  } else {
    const prefix = L.notePrefix ?? "note : ";
    document.getElementById("campingTitle").textContent = CONFIG.camping.title;
    document.getElementById("campingNote").textContent =
      `${prefix}${CONFIG.camping.note} \u20B9 ${CONFIG.camping.price}`;
  }

  document.querySelectorAll('input[name="camping"]').forEach(el => {
    el.addEventListener("change", safeRecalcTotal);
  });

  const hsCountWrap = document.getElementById("homestayCountWrap");
  function syncHomestayCountVisibility() {
    const on = document.querySelector('input[name="homestay"]:checked')?.value === "yes";
    if (hsCountWrap) hsCountWrap.hidden = !on;
  }
  document.querySelectorAll('input[name="homestay"]').forEach(el => {
    el.addEventListener("change", () => { syncHomestayCountVisibility(); safeRecalcTotal(); });
  });
  syncHomestayCountVisibility();
}

/* ---------------- Payment detail text (page 2) ---------------- */
function renderPaymentDetailText() {
  document.getElementById("upiIdText").textContent = CONFIG.payment.upiId;
  document.getElementById("upiIdText2").textContent = CONFIG.payment.upiId;
  document.getElementById("bankAccText").textContent = CONFIG.payment.bankAccount;
  document.getElementById("bankIfscText").textContent = CONFIG.payment.bankIFSC;
  document.getElementById("qrImage").src = CONFIG.payment.qrImageUrl;
}

/* ---------------- Adaptive price calculator ---------------- */
function formatRupees(n) {
  return "\u20B9" + Math.round(n).toLocaleString("en-IN");
}

/** Recomputes the total from whatever is currently selected on the form.
    Activities are priced per person, and a visitor can tick more than
    one activity — each ticked activity adds its own line below. A
    child (below 17) costs a flat rate (pricing.childFlatPrice) on
    every activity, EXCEPT activities marked childPaysFullPrice: true,
    where a child pays the same per-person price as an adult.
    Home stay has its own adult/child headcount, separate from the
    "Number of participants" / "Number of child" counts above. */
function computeTotal() {
  const participants = parseInt(document.getElementById("f_participants").value, 10) || 0;
  const children = parseInt(document.getElementById("f_children").value, 10) || 0;
  const pkgIds = Array.from(document.querySelectorAll('input[name="package"]:checked')).map(el => el.value);
  const pkgs = CONFIG.packages.filter(p => pkgIds.includes(p.id));
  const homestayOn = CONFIG.homestay.enabled && document.querySelector('input[name="homestay"]:checked')?.value === "yes";
  const campingOn = CONFIG.camping.enabled && document.querySelector('input[name="camping"]:checked')?.value === "yes";
  const childFlatPrice = CONFIG.pricing?.childFlatPrice ?? 0;

  const lines = [];
  let total = 0;

  const adultWord = participants === 1 ? (L.adultWord ?? "adult") : (L.adultsWord ?? "adults");
  const childWordFor = n => n === 1 ? (L.childWord ?? "child") : (L.childrenWord ?? "children");
  const freeText = L.freeText ?? "free";

  pkgs.forEach(pkg => {
    if (participants > 0) {
      const sub = pkg.price * participants;
      lines.push({ label: `${pkg.label} \u00d7 ${participants} ${adultWord}`, amount: sub });
      total += sub;
    }
    if (children > 0) {
      if (pkg.childPaysFullPrice) {
        const sub = pkg.price * children;
        lines.push({ label: `${pkg.label} \u00d7 ${children} ${childWordFor(children)}`, amount: sub });
        total += sub;
      } else if (childFlatPrice > 0) {
        const sub = childFlatPrice * children;
        lines.push({ label: `${pkg.label} \u2014 ${children} ${childWordFor(children)} \u00d7 \u20B9${childFlatPrice}`, amount: sub });
        total += sub;
      } else {
        lines.push({ label: `${pkg.label} \u2014 ${children} ${childWordFor(children)} (${freeText})`, amount: 0 });
      }
    }
  });

  if (homestayOn) {
    const hs = CONFIG.homestay;
    const firstPrice = hs.firstPersonPrice ?? 0;
    const extraPrice = hs.extraPersonPrice ?? 0;
    const hsAdults = parseInt(document.getElementById("f_hs_adults")?.value, 10) || 0;
    const hsChildren = parseInt(document.getElementById("f_hs_children")?.value, 10) || 0;
    const hsAdultWord = hsAdults === 1 ? (L.adultWord ?? "adult") : (L.adultsWord ?? "adults");

    if (hsAdults > 0) {
      const adultSub = firstPrice + Math.max(0, hsAdults - 1) * extraPrice;
      lines.push({ label: `${hs.title} \u2014 ${hsAdults} ${hsAdultWord}`, amount: adultSub });
      total += adultSub;

      if (hsChildren > 0) {
        const freeText2 = L.homeStayFreeWithAdultText ?? "(free, travelling with an adult)";
        lines.push({ label: `${hs.title} \u2014 ${hsChildren} ${childWordFor(hsChildren)} ${freeText2}`, amount: 0 });
      }
    } else if (hsChildren > 0) {
      // No adults in the home stay booking — children are charged the same as adults would be.
      const childSub = firstPrice + Math.max(0, hsChildren - 1) * extraPrice;
      const chargedText = L.homeStayChargedAsAdultText ?? "(no adult in booking, charged as adult)";
      lines.push({ label: `${hs.title} \u2014 ${hsChildren} ${childWordFor(hsChildren)} ${chargedText}`, amount: childSub });
      total += childSub;
    }
  }

  if (campingOn) {
    const headcount = participants + children;
    const sub = CONFIG.camping.perPerson ? CONFIG.camping.price * headcount : CONFIG.camping.price;
    lines.push({ label: CONFIG.camping.perPerson ? `${CONFIG.camping.title} \u00d7 ${headcount}` : CONFIG.camping.title, amount: sub });
    total += sub;
  }

  return { lines, total, pkgs };
}

function recalcTotal() {
  const { lines, total } = computeTotal();
  const breakdownEl = document.getElementById("totalBreakdown");
  const totalEl = document.getElementById("totalAmount");
  if (!breakdownEl || !totalEl) return;

  if (lines.length === 0) {
    breakdownEl.innerHTML = `<div class="b-empty">${L.emptyBreakdownNote ?? "Select a package to see pricing"}</div>`;
  } else {
    breakdownEl.innerHTML = lines.map(l =>
      `<div class="b-row"><span>${l.label}</span><span class="amt">${formatRupees(l.amount)}</span></div>`
    ).join("");
  }
  totalEl.textContent = formatRupees(total);
}
function safeRecalcTotal() { try { recalcTotal(); } catch (e) { console.error("recalcTotal failed", e); } }

/* ---------------- Payment mode → page 2 reveal ---------------- */
const PAY_LABELS = {
  upi: L.payUpiOption ?? "UPI ID",
  bank: L.payBankOption ?? "Bank Transfer",
  qr: L.payQrOption ?? "QR Code"
};

function setupPaymentReveal() {
  document.querySelectorAll('input[name="paymentMode"]').forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.checked) document.getElementById("err_payment").classList.remove("show");
    });
  });
}

/** Shows only the payment-detail block matching the chosen mode on page 2,
    and sets that page's heading. Called right before page 2 becomes visible. */
function revealChosenPaymentDetail() {
  const mode = document.querySelector('input[name="paymentMode"]:checked')?.value;
  const detailUpi = document.getElementById("detailUpi");
  const detailBank = document.getElementById("detailBank");
  const detailQr = document.getElementById("detailQr");
  detailUpi.hidden = mode !== "upi";
  detailBank.hidden = mode !== "bank";
  detailQr.hidden = mode !== "qr";
  const title = document.getElementById("page2Title");
  const basePage2Title = L.page2Title ?? "Payment";
  if (title) title.textContent = mode ? `${basePage2Title} \u2014 ${PAY_LABELS[mode]}` : basePage2Title;
}

/* ---------------- Copy buttons ---------------- */
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function setupCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const targetId = btn.dataset.copyTarget;
      const text = document.getElementById(targetId).textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast((L.copiedToastPrefix ?? "Copied: ") + text);
      btn.classList.add("copied");
      const original = btn.textContent;
      btn.textContent = L.copiedBtnText ?? "Copied!";
      setTimeout(() => { btn.classList.remove("copied"); btn.textContent = original; }, 1400);
    });
  });
}

/* ---------------- QR download ---------------- */
function setupQrDownload() {
  document.getElementById("qrDownloadBtn").addEventListener("click", async () => {
    const url = CONFIG.payment.qrImageUrl;
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "mawlyngbna-payment-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Cross-origin images can't be fetched as a blob — open in a new tab instead.
      window.open(url, "_blank");
    }
  });
}

/* ---------------- Validation ---------------- */
function digitsOnly(str) { return (str || "").replace(/\D/g, ""); }

/** Validates everything collected on page 1 (name, WhatsApp, date, package, payment mode). */
function validatePage1() {
  let ok = true;

  const name = document.getElementById("f_name").value.trim();
  toggleError("err_name", "f_name", name.length === 0);
  if (name.length === 0) ok = false;

  const whatsapp = digitsOnly(document.getElementById("f_whatsapp").value);
  const whatsappBad = whatsapp.length < 10;
  toggleError("err_whatsapp", "f_whatsapp", whatsappBad);
  if (whatsappBad) ok = false;

  const date = document.getElementById("f_date").value;
  toggleError("err_date", "f_date", !date);
  if (!date) ok = false;

  const pkgChosen = document.querySelectorAll('input[name="package"]:checked').length > 0;
  document.getElementById("err_package").classList.toggle("show", !pkgChosen);
  if (!pkgChosen) ok = false;

  const payChosen = document.querySelector('input[name="paymentMode"]:checked');
  document.getElementById("err_payment").classList.toggle("show", !payChosen);
  if (!payChosen) ok = false;

  return ok;
}

function toggleError(errId, inputId, isBad) {
  document.getElementById(errId).classList.toggle("show", isBad);
  document.getElementById(inputId).classList.toggle("invalid", isBad);
}

/* ---------------- Page navigation ---------------- */
const pageIndicator = document.getElementById("pageIndicator");

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
  const headerCard = document.getElementById("headerCard");
  if (headerCard) headerCard.style.display = pageId === "page-2" ? "none" : "";
  if (pageIndicator) {
    pageIndicator.textContent = pageId === "page-2" ? (L.page2Indicator ?? "Page 2 of 2") : (L.page1Indicator ?? "Page 1 of 2");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupNavigation() {
  // live-clear errors as the visitor fixes fields
  ["f_name", "f_whatsapp", "f_date"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => validatePage1());
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (!validatePage1()) {
      showToast(L.fillRequiredToast ?? "Please fill in all required fields.");
      return;
    }
    revealChosenPaymentDetail();
    safeRecalcTotal();
    showPage("page-2");
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    showPage("page-1");
  });

  const form = document.getElementById("bookingForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Defensive re-check in case the visitor navigated back and cleared something.
    if (!validatePage1()) {
      showToast(L.fillRequiredToast ?? "Please fill in all required fields.");
      showPage("page-1");
      return;
    }

    const name = document.getElementById("f_name").value.trim();
    const whatsapp = document.getElementById("f_whatsapp").value.trim();
    const date = document.getElementById("f_date").value;
    const participants = parseInt(document.getElementById("f_participants").value, 10) || 0;
    const children = parseInt(document.getElementById("f_children").value, 10) || 0;
    const pkgIds = Array.from(document.querySelectorAll('input[name="package"]:checked')).map(el => el.value);
    const pkgs = CONFIG.packages.filter(p => pkgIds.includes(p.id));
    const homestay = CONFIG.homestay.enabled ? (document.querySelector('input[name="homestay"]:checked')?.value || "no") : null;
    const hsAdults = homestay === "yes" ? (parseInt(document.getElementById("f_hs_adults")?.value, 10) || 0) : 0;
    const hsChildren = homestay === "yes" ? (parseInt(document.getElementById("f_hs_children")?.value, 10) || 0) : 0;
    const camping = CONFIG.camping.enabled ? (document.querySelector('input[name="camping"]:checked')?.value || "no") : null;
    const special = document.getElementById("f_special").value.trim();
    const payMode = document.querySelector('input[name="paymentMode"]:checked').value;
    const payLabel = PAY_LABELS[payMode];
    const childFlatPrice = CONFIG.pricing?.childFlatPrice ?? 0;

    const rupee = n => `₹${Math.round(n).toLocaleString("en-IN")}`;
    const plural = (n, one, many) => (n === 1 ? one : many);
    const fmtDate = iso => {
      if (!iso) return "";
      const d = new Date(iso + "T00:00:00");
      if (isNaN(d)) return iso;
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    };
    const sep = "━━━━━━━━━━━━━━━━━━━━";

    const lines = [];
    lines.push("🌿 MAWLYNGBNA ADVENTURE 🌿");
    lines.push(sep);
    lines.push("🎫 NEW BOOKING CONFIRMATION");
    lines.push("");
    lines.push("👤 CUSTOMER DETAILS");
    lines.push(`• Name: ${name}`);
    lines.push(`• 📱 WhatsApp: ${whatsapp}`);
    lines.push(`• 📅 Visit Date: ${fmtDate(date)}`);
    lines.push("");
    lines.push("👥 PARTICIPANTS");
    lines.push(`• 🧑 Adults: ${participants}`);
    lines.push(`• 🧒 Children: ${children}`);
    lines.push(`• 👨‍👩‍👧 Total Guests: ${participants + children}`);
    lines.push("");
    lines.push(sep);

    // ---------- Adventure package(s) ----------
    let packageTotal = 0;
    if (pkgs.length > 0) {
      lines.push("🎯 ADVENTURE PACKAGE");
      lines.push("");
      pkgs.forEach((pkg, idx) => {
        lines.push(pkgs.length > 1 ? `Package ${idx + 1} — ${pkg.label}` : pkg.label);
        lines.push("");
        let pkgSub = 0;
        if (participants > 0) {
          const sub = pkg.price * participants;
          pkgSub += sub;
          lines.push(`🧑 ${plural(participants, "Adult", "Adults")}`);
          lines.push(`${participants} × ${rupee(pkg.price)} = ${rupee(sub)}`);
          lines.push("");
        }
        if (children > 0) {
          if (pkg.childPaysFullPrice) {
            const sub = pkg.price * children;
            pkgSub += sub;
            lines.push(`🧒 ${plural(children, "Child", "Children")}`);
            lines.push(`${children} × ${rupee(pkg.price)} = ${rupee(sub)}`);
            lines.push("");
          } else if (childFlatPrice > 0) {
            const sub = childFlatPrice * children;
            pkgSub += sub;
            lines.push(`🧒 ${plural(children, "Child", "Children")}`);
            lines.push(`${children} × ${rupee(childFlatPrice)} = ${rupee(sub)}`);
            lines.push("");
          } else {
            lines.push(`🧒 ${plural(children, "Child", "Children")}`);
            lines.push(`${children} × ₹0 = FREE`);
            lines.push("");
          }
        }
        lines.push(`➡️ Package Total: ${rupee(pkgSub)}`);
        lines.push("");
        packageTotal += pkgSub;
      });
      lines.push(sep);
    }

    // ---------- Homestay ----------
    let homestayTotal = 0;
    const homestayOn = homestay === "yes";
    if (homestay !== null) {
      lines.push("🏠 HOMESTAY");
      lines.push("");
      if (homestayOn) {
        const hs = CONFIG.homestay;
        const firstPrice = hs.firstPersonPrice ?? 0;
        const extraPrice = hs.extraPersonPrice ?? 0;

        lines.push(`👥 Homestay Guests: ${hsAdults + hsChildren}`);
        lines.push(`• 🧑 Adults: ${hsAdults}`);
        lines.push(`• 🧒 Children: ${hsChildren}`);
        lines.push("");
        lines.push("🍳 Includes: Breakfast");
        lines.push("Maggi & Roti");
        lines.push("");

        if (hsAdults > 0) {
          const adultSub = firstPrice + Math.max(0, hsAdults - 1) * extraPrice;
          homestayTotal += adultSub;
          lines.push(`🧑 ${plural(hsAdults, "Adult", "Adults")} Homestay`);
          lines.push(`${hsAdults} × ${rupee(firstPrice)} = ${rupee(adultSub)}`);
          lines.push("");
          if (hsChildren > 0) {
            lines.push(`🧒 ${plural(hsChildren, "Child", "Children")}`);
            lines.push(`${hsChildren} × ₹0 = FREE`);
            lines.push("(Child travelling with an adult)");
            lines.push("");
          }
        } else if (hsChildren > 0) {
          const childSub = firstPrice + Math.max(0, hsChildren - 1) * extraPrice;
          homestayTotal += childSub;
          lines.push(`🧒 ${plural(hsChildren, "Child", "Children")} Homestay`);
          lines.push(`${hsChildren} × ${rupee(firstPrice)} = ${rupee(childSub)}`);
          lines.push("(No adult in booking, charged as adult)");
          lines.push("");
        }
        lines.push(`➡️ Homestay Total: ${rupee(homestayTotal)}`);
      } else {
        lines.push("Homestay Required: NO");
      }
      lines.push("");
      lines.push(sep);
    }

    // ---------- Camping ----------
    let campingTotal = 0;
    const campingOn = camping === "yes";
    if (camping !== null) {
      lines.push("⛺ CAMPING");
      lines.push("");
      lines.push(`🏕️ Camping Required: ${campingOn ? "YES" : "NO"}`);
      if (campingOn) {
        const headcount = participants + children;
        lines.push(`👥 Camping Guests: ${headcount}`);
        lines.push("");
        if (CONFIG.camping.perPerson) {
          campingTotal = CONFIG.camping.price * headcount;
          lines.push(`${headcount} × ${rupee(CONFIG.camping.price)} = ${rupee(campingTotal)}`);
        } else {
          campingTotal = CONFIG.camping.price;
          lines.push(`${rupee(campingTotal)}`);
        }
        lines.push("");
        lines.push(`➡️ Camping Total: ${rupee(campingTotal)}`);
      }
      lines.push("");
      lines.push(sep);
    }

    if (special) {
      lines.push(`📝 Special Request: ${special}`);
      lines.push("");
      lines.push(sep);
    }

    const grandTotal = packageTotal + homestayTotal + campingTotal;

    // ---------- Final price ----------
    lines.push("💰 FINAL PRICE");
    lines.push("");
    if (pkgs.length > 0) lines.push(`🎯 Adventure Package      ${rupee(packageTotal)}`);
    if (homestayOn) lines.push(`🏠 Homestay + Breakfast   ${rupee(homestayTotal)}`);
    if (campingOn) lines.push(`⛺ Camping                ${rupee(campingTotal)}`);
    lines.push(sep);
    lines.push(`💵 TOTAL AMOUNT: ${rupee(grandTotal)}`);
    lines.push("");

    // ---------- Payment ----------
    lines.push("💳 PAYMENT");
    lines.push(`• Payment Mode: ${payLabel}`);
    lines.push("• Payment Status: ⏳ Pending Confirmation");
    lines.push("");
    lines.push(sep);

    // ---------- Booking summary ----------
    lines.push("📋 BOOKING SUMMARY");
    lines.push("");
    lines.push(`📅 ${fmtDate(date)}`);
    lines.push(`👥 ${participants + children} Guests — ${participants} ${plural(participants, "Adult", "Adults")} + ${children} ${plural(children, "Child", "Children")}`);
    lines.push(`🎯 ${pkgs.length} Adventure ${plural(pkgs.length, "Package", "Packages")}`);
    if (homestayOn) lines.push(`🏠 Homestay: ${hsAdults + hsChildren} Guests`);
    if (campingOn) lines.push(`⛺ Camping: ${participants + children} Guests`);
    if (homestayOn) lines.push("🍳 Breakfast Included");
    lines.push(`💰 Total: ${rupee(grandTotal)}`);
    lines.push("");
    lines.push("🌿 Thank you for choosing Mawlyngbna Adventure! 🌿");

    const message = lines.join("\n");
    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = waUrl;
  });
}

/* ---------------- Clear form ---------------- */
function setupClearForm() {
  document.getElementById("clearFormBtn").addEventListener("click", () => {
    const form = document.getElementById("bookingForm");
    form.reset();
    document.querySelectorAll(".field-error").forEach(el => el.classList.remove("show"));
    document.querySelectorAll("input.invalid").forEach(el => el.classList.remove("invalid"));
    document.querySelectorAll("[data-stepper]").forEach(wrap => {
      const key = wrap.dataset.stepper;
      const min = stepperLimits[key] ? stepperLimits[key][0] : 0;
      const input = wrap.querySelector(".stepper-value");
      if (input) input.value = min;
      const decBtn = wrap.querySelector('[data-action="dec"]');
      const incBtn = wrap.querySelector('[data-action="inc"]');
      if (decBtn) decBtn.disabled = true;
      if (incBtn) incBtn.disabled = false;
    });
    document.getElementById("detailUpi").hidden = true;
    document.getElementById("detailBank").hidden = true;
    document.getElementById("detailQr").hidden = true;
    const hsCountWrap = document.getElementById("homestayCountWrap");
    if (hsCountWrap) hsCountWrap.hidden = true;
    safeRecalcTotal();
    showPage("page-1");
  });
}

/* ---------------- Secret admin dashboard trigger ----------------
   Tap the invisible bottom-right corner 5 times within 3 seconds
   to open the admin dashboard. Nothing is visible or labeled,
   so casual visitors will never find it by accident.
------------------------------------------------------------------ */
function setupAdminTrigger() {
  const zone = document.getElementById("adminTrigger");
  let taps = 0;
  let timer = null;
  zone.addEventListener("click", () => {
    taps += 1;
    clearTimeout(timer);
    timer = setTimeout(() => { taps = 0; }, 3000);
    if (taps >= 5) {
      taps = 0;
      window.location.href = "admin.html";
    }
  });
}
