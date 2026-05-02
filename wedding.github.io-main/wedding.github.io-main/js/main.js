(function () {
  "use strict";

  // Обработка формы и отправка в Google Sheets
  const form = document.getElementById("rsvpForm");
  const feedback = document.getElementById("formFeedback");

  // ⚠️ ЗАМЕНИТЕ на URL вашего веб-приложения Google Apps Script
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbz6xmC6tQzXeqW0ObFc4OoBGJGFIAmb6YArEI13m_zk35uIsYLUV1u6d-rmdvEFH2ZcRg/exec";

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const guestName = formData.get("guestName")?.trim() || "";
    const attendance = formData.get("attendance");
    const allergies = formData.get("allergies")?.trim() || "—";
    const alcoholPref = formData.get("alcoholPref") || "—";

    if (!guestName || !attendance) {
      feedback.innerHTML =
        '<span style="color:#b85c5c;">Пожалуйста, укажите имя и подтвердите присутствие.</span>';
      return;
    }

    const payload = {
      name: guestName,
      attendance: attendance,
      allergies: allergies,
      alcohol: alcoholPref,
      timestamp: new Date().toLocaleString("ru-RU"),
    };

    feedback.innerHTML = '<span style="color:#7e8a6f;">Отправка...</span>';

    const isDemoUrl = GOOGLE_SCRIPT_URL.includes("EXAMPLE-YOUR-DEPLOYMENT-ID");

    if (isDemoUrl) {
      console.warn(
        "⚠️ Используется демо URL Google Script. Замените на свой для реальной записи.",
      );
      setTimeout(() => {
        feedback.innerHTML =
          '<span style="color:#2e7d5e;"><i class="far fa-check-circle"></i> Спасибо! Ваш ответ принят (демо-режим).</span>';
        form.reset();
      }, 600);
      return;
    }

    // Отправка через fetch (режим no-cors для Google Apps Script)
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(payload).toString(),
    })
      .then(() => {
        feedback.innerHTML =
          '<span style="color:#2e7d5e;"><i class="far fa-check-circle"></i> Благодарим! Ваш ответ отправлен.</span>';
        form.reset();
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        feedback.innerHTML =
          '<span style="color:#b85c5c;">Ошибка соединения. Попробуйте позже.</span>';
      });
  });

  // Плавная прокрутка для якорных ссылок
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href === "") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

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
