const parallaxElements = Array.from(document.querySelectorAll("[data-parallax]"));
const heroVideos = Array.from(document.querySelectorAll(".hero-video"));
const form = document.getElementById("demo-form");
const statusMessage = document.getElementById("form-status");
const submitButton = form?.querySelector('button[type="submit"]');
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxCounter = document.getElementById("lightbox-counter");
const lightboxCloseButton = document.getElementById("lightbox-close");
const lightboxStage = document.getElementById("lightbox-stage");
const galleryButtons = Array.from(document.querySelectorAll(".feature-image-button"));
const schoolSearchInput = document.getElementById("school-search");
const schoolSearchStatus = document.getElementById("school-search-status");
const schoolSearchEmpty = document.getElementById("school-search-empty");
const schoolCards = Array.from(document.querySelectorAll("[data-school-card]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let lightboxImages = [];
let lightboxIndex = 0;
let lightboxAlt = "";
let lastFocusedElement = null;
let touchStartX = 0;

function setReducedMotionState(mediaQuery) {
  document.body.classList.toggle("reduce-motion", mediaQuery.matches);

  heroVideos.forEach((video) => {
    if (mediaQuery.matches) {
      video.pause();
      video.removeAttribute("autoplay");
    } else if (video.dataset.userPaused !== "true") {
      video.setAttribute("autoplay", "");
      const playAttempt = video.play();

      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {
          video.dataset.userPaused = "true";
        });
      }
    }
  });
}

function updateParallax() {
  if (prefersReducedMotion.matches) {
    parallaxElements.forEach((element) => {
      element.style.transform = "";
    });
    return;
  }

  const offset = window.scrollY * 0.18;
  parallaxElements.forEach((element) => {
    const speed = Number(element.dataset.parallax || 0);
    element.style.transform = `translate3d(0, ${Math.round(offset * speed)}px, 0)`;
  });
}

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "form-status";

  if (type) {
    statusMessage.classList.add(`is-${type}`);
  }
}

function validateForm(data) {
  const trimmed = {
    name: data.name.trim(),
    email: data.email.trim(),
    school: data.school.trim(),
    message: data.message.trim()
  };

  if (!trimmed.name || !trimmed.email || !trimmed.message) {
    return { valid: false, message: "Please fill in your name, email, and a short message.", data: trimmed };
  }

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email);
  if (!emailIsValid) {
    return { valid: false, message: "Please enter a valid email address.", data: trimmed };
  }

  return { valid: true, data: trimmed };
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const submission = validateForm({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    school: String(formData.get("school") || ""),
    message: String(formData.get("message") || "")
  });

  if (!submission.valid) {
    setStatus(submission.message, "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  setStatus("Sending your request...", "");

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission.data)
    });

    let result = {};
    try {
      result = await response.json();
    } catch (_error) {
      result = {};
    }

    if (!response.ok) {
      throw new Error(result.message || "Something went wrong. Please try again.");
    }

    form.reset();
    setStatus("Thanks. Your demo request has been sent and we will follow up soon.", "success");
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send Demo Request";
  }
}

function updateSchoolDirectory() {
  if (!schoolSearchInput || !schoolCards.length) {
    return;
  }

  const query = schoolSearchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  schoolCards.forEach((card) => {
    const haystack = String(card.dataset.search || "").toLowerCase();
    const matches = !query || haystack.includes(query);
    card.classList.toggle("hidden", !matches);
    if (matches) {
      visibleCount += 1;
    }
  });

  if (schoolSearchStatus) {
    schoolSearchStatus.textContent = query
      ? `${visibleCount} matching school site${visibleCount === 1 ? "" : "s"}`
      : `${schoolCards.length} live school site${schoolCards.length === 1 ? "" : "s"} currently available`;
  }

  if (schoolSearchEmpty) {
    schoolSearchEmpty.classList.toggle("hidden", visibleCount !== 0);
  }
}

function updateLightboxImage() {
  if (!lightboxImages.length) {
    return;
  }

  lightboxImage.src = lightboxImages[lightboxIndex];
  lightboxImage.alt = lightboxAlt;

  const multiple = lightboxImages.length > 1;
  lightboxPrev.classList.toggle("hidden", !multiple);
  lightboxNext.classList.toggle("hidden", !multiple);
  lightboxCounter.textContent = multiple ? `${lightboxIndex + 1} / ${lightboxImages.length}` : "";
}

function trapFocus(event) {
  if (!lightbox.classList.contains("active") || event.key !== "Tab") {
    return;
  }

  const focusable = Array.from(
    lightbox.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
  );

  if (!focusable.length) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openLightbox(images, startIndex = 0, alt = "") {
  lightboxImages = images;
  lightboxIndex = startIndex;
  lightboxAlt = alt;
  lastFocusedElement = document.activeElement;

  updateLightboxImage();
  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxCloseButton.focus();
}

function closeLightbox() {
  if (!lightbox.classList.contains("active")) {
    return;
  }

  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.src = "";
  lightboxImage.alt = "";
  lightboxCounter.textContent = "";
  lightboxImages = [];
  lightboxIndex = 0;

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function showPrevImage() {
  if (lightboxImages.length <= 1) {
    return;
  }

  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  updateLightboxImage();
}

function showNextImage() {
  if (lightboxImages.length <= 1) {
    return;
  }

  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  updateLightboxImage();
}

function handleKeydown(event) {
  if (!lightbox.classList.contains("active")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    showPrevImage();
  }

  if (event.key === "ArrowRight") {
    showNextImage();
  }

  trapFocus(event);
}

galleryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const images = (button.dataset.gallery || "")
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);

    if (!images.length) {
      return;
    }

    openLightbox(images, 0, button.dataset.alt || "");
  });
});

if (lightboxCloseButton && lightboxPrev && lightboxNext && lightbox && lightboxStage) {
  lightboxCloseButton.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", showPrevImage);
  lightboxNext.addEventListener("click", showNextImage);

  lightbox.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.lightboxClose === "true") {
      closeLightbox();
    }
  });

  lightboxStage.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  lightboxStage.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) < 40) {
        return;
      }

      if (swipeDistance > 0) {
        showPrevImage();
      } else {
        showNextImage();
      }
    },
    { passive: true }
  );
}

document.addEventListener("keydown", handleKeydown);
window.addEventListener("scroll", updateParallax, { passive: true });
window.addEventListener("resize", updateParallax);
prefersReducedMotion.addEventListener("change", setReducedMotionState);

if (form) {
  form.addEventListener("submit", handleFormSubmit);
}

if (schoolSearchInput) {
  schoolSearchInput.addEventListener("input", updateSchoolDirectory);
}

setReducedMotionState(prefersReducedMotion);
updateParallax();
updateSchoolDirectory();
