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
      el.style.transition = "opacity 0.8s ease, transform 0.6s ease";
      observer.observe(el);
    });

  // Hero всегда видим
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    heroContent.style.opacity = 1;
    heroContent.style.transform = "none";
  }
})();
