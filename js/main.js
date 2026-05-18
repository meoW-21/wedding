(function () {
  "use strict";

  // Анимация появления элементов при скролле
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll("section .container, .hero-content, .form-card")
    .forEach((el) => {
      el.style.opacity = 0;
      el.style.transform = "translateY(12px)";
      el.style.transition = "opacity 1s ease, transform 0.8s ease";
      observer.observe(el);
    });

  // Hero всегда видим
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    heroContent.style.opacity = 1;
    heroContent.style.transform = "none";
  }
})();

/**
 * Плавное появление элементов таймлайна при прокрутке.
 */
(function () {
  const timelineItems = document.querySelectorAll(".timeline-item");

  if (!timelineItems.length) return;

  if (!("IntersectionObserver" in window)) {
    timelineItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -30px 0px",
    threshold: 0.15,
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  timelineItems.forEach((item) => observer.observe(item));

  setTimeout(() => {
    timelineItems.forEach((item) => {
      if (!item.classList.contains("visible")) {
        item.classList.add("visible");
      }
    });
  }, 2500);
})();
