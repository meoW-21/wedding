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

// ---------- ЛОГИКА ЧЕКБОКСОВ "НЕ ПЬЮ" ----------
const whiteWine = document.getElementById("drinkWhiteWine");
const redWine = document.getElementById("drinkRedWine");
const whisky = document.getElementById("drinkWhisky");
const vodka = document.getElementById("drinkVodka");
const noneAlcohol = document.getElementById("drinkNone");

function applyNonAlcoholLogic() {
  if (noneAlcohol.checked) {
    [whiteWine, redWine, whisky, vodka].forEach((cb) => {
      if (cb) {
        cb.checked = false;
        cb.disabled = true;
      }
    });
  } else {
    [whiteWine, redWine, whisky, vodka].forEach((cb) => {
      if (cb) cb.disabled = false;
    });
  }
}

if (noneAlcohol) {
  noneAlcohol.addEventListener("change", function () {
    if (noneAlcohol.checked) {
      applyNonAlcoholLogic();
    } else {
      [whiteWine, redWine, whisky, vodka].forEach((cb) => {
        if (cb) cb.disabled = false;
      });
    }
  });
}

function handleAlcoholClick(alcoholCb) {
  if (!alcoholCb) return;
  alcoholCb.addEventListener("change", function (e) {
    if (alcoholCb.checked && noneAlcohol.checked) {
      noneAlcohol.checked = false;
      [whiteWine, redWine, whisky, vodka].forEach((cb) => {
        if (cb) cb.disabled = false;
      });
    }
  });
}

[whiteWine, redWine, whisky, vodka].forEach((cb) => handleAlcoholClick(cb));
applyNonAlcoholLogic();

// ---------- УПРАВЛЕНИЕ ВИДИМОСТЬЮ БЛОКА (гости + напитки) ----------
const attendingRadios = document.querySelectorAll('input[name="attending"]');
const extraBlock = document.getElementById("extraFieldsBlock");

function toggleExtraFields() {
  const selectedAttending = document.querySelector(
    'input[name="attending"]:checked',
  ).value;
  if (selectedAttending === "yes") {
    extraBlock.style.opacity = "1";
    extraBlock.style.visibility = "visible";
    extraBlock.style.display = "block";
  } else {
    extraBlock.style.opacity = "0";
    extraBlock.style.visibility = "hidden";
    extraBlock.style.display = "none";
  }
}

attendingRadios.forEach((radio) => {
  radio.addEventListener("change", toggleExtraFields);
});
toggleExtraFields();

// ---------- ОТПРАВКА В GOOGLE SHEETS ----------
// Замените URL ниже на адрес вашего веб-приложения Apps Script
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzUgXwsXOku8FkkhwS9LoV4RCuefY6JBMtT9wthaaFsRajyigX_133EPfK48dUfaLyqxQ/exec";

const form = document.getElementById("weddingForm");
const submitBtn = document.getElementById("submitBtn");
const statusDiv = document.getElementById("formStatus");

function gatherFormData() {
  const name = document.getElementById("guestName").value.trim();
  const attendingValue = document.querySelector(
    'input[name="attending"]:checked',
  ).value;

  let guestCount = "";
  let drinksArray = [];

  if (attendingValue === "yes") {
    const guestCountSelect = document.getElementById("guestCount");
    guestCount = guestCountSelect.value;
    const checkboxes = document.querySelectorAll(
      '#drinksChecklist input[type="checkbox"]',
    );
    checkboxes.forEach((cb) => {
      if (cb.checked) {
        drinksArray.push(cb.value);
      }
    });
  } else {
    guestCount = "Не присутствует";
    drinksArray = [];
  }

  const drinksString = drinksArray.length
    ? drinksArray.join(", ")
    : "Не выбрано";

  return {
    name: name,
    attending: attendingValue === "yes" ? "Да, буду" : "Нет, не смогу",
    guestsNumber: attendingValue === "yes" ? guestCount : "0",
    drinks: drinksString,
    timestamp: new Date().toLocaleString("ru-RU"),
  };
}

function validateForm() {
  const name = document.getElementById("guestName").value.trim();
  if (!name) {
    statusDiv.innerHTML = "❌ Пожалуйста, укажите ваше имя и фамилию.";
    statusDiv.className = "status-message error";
    return false;
  }
  return true;
}

async function submitToGoogleSheets(data) {
  if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL") {
    console.warn(
      "⚠️ Google Sheets URL не настроен. Данные не отправлены, но вы можете скопировать настройки.",
    );
    console.log("Собранные данные:", data);
    statusDiv.innerHTML =
      '💡 Режим демонстрации: данные готовы к отправке. Для реальной работы настройте Google Apps Script (инструкция в комментариях).<br><span style="font-size:0.8rem;">✅ Ответ зарегистрирован локально.</span>';
    statusDiv.className = "status-message success";
    return { success: true, demo: true };
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return { success: true };
  } catch (error) {
    console.error("Ошибка отправки:", error);
    return { success: false, error: error.message };
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusDiv.innerHTML = "";
  statusDiv.className = "";

  if (!validateForm()) return;

  const formData = gatherFormData();

  submitBtn.disabled = true;
  submitBtn.textContent = "⏳ Отправка...";

  const result = await submitToGoogleSheets(formData);

  if (result.success) {
    statusDiv.innerHTML = "✅ Спасибо! Ваш ответ сохранён. Ждём встречи! 🎉";
    statusDiv.className = "status-message success";
  } else {
    statusDiv.innerHTML = `❌ Ошибка при отправке: ${result.error || "Попробуйте позже или свяжитесь с организаторами."}`;
    statusDiv.className = "status-message error";
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "📩 Отправить ответ";
});

attendingRadios.forEach((radio) =>
  radio.addEventListener("change", () => {
    setTimeout(() => {
      if (
        document.querySelector('input[name="attending"]:checked').value ===
        "yes"
      ) {
        applyNonAlcoholLogic();
      }
    }, 20);
  }),
);

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

/**
 * Тактильный отклик на мобильных.
 */
(function () {
  const mapButtons = document.querySelectorAll(".map-button");

  mapButtons.forEach((button) => {
    button.addEventListener(
      "touchstart",
      function () {
        this.style.transform = "scale(0.97)";
      },
      { passive: true },
    );

    button.addEventListener(
      "touchend",
      function () {
        this.style.transform = "";
      },
      { passive: true },
    );

    button.addEventListener(
      "touchcancel",
      function () {
        this.style.transform = "";
      },
      { passive: true },
    );
  });
})();
