// ---------- НАСТРОЙКИ ----------
const TELEGRAM_URL = "https://t.me/+tYv0RJXaaeYxYTEy"; // ЗАМЕНИТЕ НА РЕАЛЬНУЮ ССЫЛКУ

// ---------- ЛОГИКА ЧЕКБОКСОВ "НЕ ПЬЮ" (включая игристое) ----------
const whiteWine = document.getElementById("drinkWhiteWine");
const redWine = document.getElementById("drinkRedWine");
const whisky = document.getElementById("drinkWhisky");
const vodka = document.getElementById("drinkVodka");
const beer = document.getElementById("drinkBeer");
const cognac = document.getElementById("drinkCognac");
const sparkling = document.getElementById("drinkSparkling"); // новый элемент
const noneAlcohol = document.getElementById("drinkNone");

// Все алкогольные чекбоксы (включая игристое, исключая "не пью")
const alcoholCheckboxes = [
  whiteWine,
  redWine,
  whisky,
  vodka,
  beer,
  cognac,
  sparkling,
];

function applyNonAlcoholLogic() {
  if (noneAlcohol && noneAlcohol.checked) {
    alcoholCheckboxes.forEach((cb) => {
      if (cb) {
        cb.checked = false;
        cb.disabled = true;
      }
    });
  } else {
    alcoholCheckboxes.forEach((cb) => {
      if (cb) cb.disabled = false;
    });
  }
}

if (noneAlcohol) {
  noneAlcohol.addEventListener("change", function () {
    if (noneAlcohol.checked) {
      applyNonAlcoholLogic();
    } else {
      alcoholCheckboxes.forEach((cb) => {
        if (cb) cb.disabled = false;
      });
    }
  });
}

function handleAlcoholClick(alcoholCb) {
  if (!alcoholCb) return;
  alcoholCb.addEventListener("change", function (e) {
    if (alcoholCb.checked && noneAlcohol && noneAlcohol.checked) {
      noneAlcohol.checked = false;
      alcoholCheckboxes.forEach((cb) => {
        if (cb) cb.disabled = false;
      });
    }
  });
}

alcoholCheckboxes.forEach((cb) => handleAlcoholClick(cb));
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
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzkvs7630mfCYFBOyPq64InP_1o07UkNqNw1Z5evO_cXlo33jsqWMjhnnWIKzu2BQ/exec";

const form = document.getElementById("weddingForm");
const submitBtn = document.getElementById("submitBtn");
const statusDiv = document.getElementById("formStatus");
const telegramContainer = document.getElementById("telegramContainer");
const telegramLink = document.getElementById("telegramLink");

if (telegramLink && TELEGRAM_URL !== "https://t.me/ваш_телеграм_канал") {
  telegramLink.href = TELEGRAM_URL;
} else if (telegramLink) {
  console.warn("⚠️ Замените TELEGRAM_URL на актуальную ссылку Telegram-канала");
  telegramLink.href = "https://t.me/joinchat/example";
}

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
    telegramContainer.style.display = "none";
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

function showTelegramButton() {
  telegramContainer.style.display = "block";
  telegramContainer.style.animation = "fadeInUp 0.3s ease";
}

if (!document.querySelector("#fadeInUpStyle")) {
  const style = document.createElement("style");
  style.id = "fadeInUpStyle";
  style.textContent = `
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
  document.head.appendChild(style);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusDiv.innerHTML = "";
  statusDiv.className = "";
  telegramContainer.style.display = "none";

  if (!validateForm()) return;

  const formData = gatherFormData();

  submitBtn.disabled = true;
  submitBtn.textContent = "⏳ Отправка...";

  const result = await submitToGoogleSheets(formData);

  if (result.success) {
    statusDiv.innerHTML = "✅ Спасибо! Ваш ответ сохранён. Ждём встречи! 🎉";
    statusDiv.className = "status-message success";
    showTelegramButton();
  } else {
    statusDiv.innerHTML = `❌ Ошибка при отправке: ${result.error || "Попробуйте позже или свяжитесь с организаторами."}`;
    statusDiv.className = "status-message error";
    telegramContainer.style.display = "none";
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
    telegramContainer.style.display = "none";
  }),
);

document.getElementById("guestName").addEventListener("input", () => {
  telegramContainer.style.display = "none";
});
