"use strict";

// Учебная форма. Нет запросов к серверу, хранилища или реальной отправки.
const form = document.querySelector("#request-form");
const steps = [...document.querySelectorAll(".form-step")];
const track = [...document.querySelectorAll(".step-track li")];
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const error = document.querySelector("#form-error");
const result = document.querySelector("#form-result");
const summary = document.querySelector("#summary");
const phone = document.querySelector("#phone");
let currentStep = 0;

function showStep(index, focus = true) {
  currentStep = index;
  steps.forEach((step, i) => { step.hidden = i !== index; });
  track.forEach((item, i) => {
    item.classList.toggle("current", i === index);
    item.classList.toggle("done", i < index);
    if (i === index) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
  document.querySelector("#step-label").textContent = `ШАГ ${index + 1} ИЗ 3`;
  nextButton.textContent = index === 2 ? "Проверить заявку →" : "Далее →";
  backButton.hidden = index === 0;
  error.hidden = true;
  error.textContent = "";
  if (focus) steps[index].querySelector("legend").focus({ preventScroll: true });
}

function phoneIsValid() {
  const value = phone.value.trim();
  const digits = value.replace(/\D/g, "");
  return /^\+?[\d\s()\-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
}

function validateStep(index) {
  if (index === 1) {
    const bike = document.querySelector("#bike");
    const problem = document.querySelector("#problem");
    bike.setCustomValidity(bike.value.trim() ? "" : "Укажите марку и модель мотоцикла.");
    problem.setCustomValidity(problem.value.trim().length >= 10 ? "" : "Опишите задачу: минимум 10 символов, не считая пробелов по краям.");
  }
  if (index === 2) {
    phone.setCustomValidity(phoneIsValid() ? "" : "Укажите номер: от 10 до 15 цифр. Допустимы +, пробелы, скобки и дефисы.");
  }
  const fields = [...steps[index].querySelectorAll("input, textarea, select")];
  const invalid = fields.find((field) => !field.checkValidity());
  if (!invalid) return true;
  error.textContent = index === 0 ? "Выберите услугу, чтобы продолжить." : "Проверьте отмеченное поле. " + invalid.validationMessage;
  error.hidden = false;
  invalid.focus();
  invalid.reportValidity();
  return false;
}

function value(name) {
  const selected = form.querySelector(`[name="${name}"]:checked`);
  const field = selected || form.querySelector(`[name="${name}"]`);
  return field ? field.value.trim() : "";
}

function showResult() {
  const rows = [
    ["Услуга", value("service")],
    ["Мотоцикл", value("bike")],
    ["Год выпуска", value("year") || "Не указан"],
    ["Состояние", value("ride")],
    ["Описание задачи", value("problem")],
    ["Имя", value("clientName") || "Не указано"],
    ["Телефон для звонка", value("phone")],
    ["Удобное время", value("callTime")]
  ];
  summary.replaceChildren();
  rows.forEach(([label, text]) => {
    const term = document.createElement("dt");
    const definition = document.createElement("dd");
    term.textContent = label;
    definition.textContent = text;
    summary.append(term, definition);
  });
  form.hidden = true;
  result.hidden = false;
  document.querySelector("#result-title").focus({ preventScroll: true });
  document.querySelector("#request").scrollIntoView({ behavior: "auto", block: "start" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateStep(currentStep)) return;
  if (currentStep < 2) {
    showStep(currentStep + 1);
  } else {
    for (let i = 0; i < steps.length; i += 1) {
      if (i === currentStep) continue;
      const invalid = [...steps[i].querySelectorAll("input, textarea, select")].find((field) => !field.checkValidity());
      if (invalid) {
        showStep(i);
        validateStep(i);
        return;
      }
    }
    showResult();
  }
});

phone.addEventListener("input", () => { phone.setCustomValidity(""); });
document.querySelectorAll("#bike, #problem").forEach((field) => {
  field.addEventListener("input", () => { field.setCustomValidity(""); });
});
backButton.addEventListener("click", () => { showStep(Math.max(0, currentStep - 1)); });

document.querySelectorAll("[data-service]").forEach((button) => {
  button.addEventListener("click", () => {
    const radio = [...form.querySelectorAll('[name="service"]')].find((field) => field.value === button.dataset.service);
    if (radio) radio.checked = true;
    result.hidden = true;
    form.hidden = false;
    showStep(0, false);
    document.querySelector("#request").scrollIntoView({ behavior: "auto", block: "start" });
    if (radio) radio.focus({ preventScroll: true });
  });
});

document.querySelector("#edit-button").addEventListener("click", () => {
  result.hidden = true;
  form.hidden = false;
  showStep(0);
});

document.querySelector("#clear-button").addEventListener("click", () => {
  form.reset();
  phone.setCustomValidity("");
  summary.replaceChildren();
  result.hidden = true;
  form.hidden = false;
  showStep(0);
});

showStep(0, false);
// Включаем кнопку только после регистрации всех обработчиков.
nextButton.disabled = false;
