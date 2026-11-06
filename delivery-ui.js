"use strict";

(() => {
  const form = document.querySelector("#request-form");
  const result = document.querySelector("#form-result");
  const sendButton = document.querySelector("#send-test");
  const status = document.querySelector("#delivery-status");
  const confirmation = document.querySelector("#sandbox-confirmation");
  const reference = document.querySelector("#delivery-reference");
  const edit = document.querySelector("#edit-button");
  const clear = document.querySelector("#clear-button");
  const serviceButtons = [...document.querySelectorAll("[data-service]")];
  const supported = MotoExpertRequests.isSupportedLocation(window.location);
  let attempted = false;

  function setStatus(text, kind = "info") {
    status.textContent = text;
    status.dataset.kind = kind;
  }
  function resetDelivery() {
    if (attempted) return;
    const requestId = "test-formspree-" + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2));
    form.elements.requestId.value = requestId;
    reference.textContent = requestId;
    confirmation.checked = false;
    sendButton.disabled = true;
    setStatus(supported
      ? "Проверьте ответы и подтвердите использование вымышленных данных. После отправки браузер откроет ответ Formspree в новой вкладке. Получение нужно проверить в кабинете MOTO → Submissions."
      : "Здесь только просмотр: отправка разрешена на вашем опубликованном сайте GitHub Pages. В локальном файле и в предпросмотре данные не отправляются.");
  }
  confirmation.addEventListener("change", () => {
    sendButton.disabled = !supported || !confirmation.checked || attempted;
  });
  document.addEventListener("request-review", resetDelivery);
  clear.addEventListener("click", resetDelivery);

  // Обычная отправка HTML-формы: без библиотек, ключей, fetch и автоматических повторов.
  // Новая вкладка показывает фактический ответ сервиса, включая возможную проверку или ошибку.
  sendButton.addEventListener("click", () => {
    if (!supported || !confirmation.checked || attempted || result.hidden || form.action !== MotoExpertRequests.endpoint) {
      return;
    }
    if (!phoneIsValid() || !steps.every((_step, index) => validateStep(index))) {
      setStatus("Проверьте ответы: для учебного теста разрешён только вымышленный телефон +7 000 000-00-00.", "error");
      return;
    }
    // Не отключаем именованные поля: они должны попасть в обычный POST браузера.
    attempted = true;
    sendButton.disabled = true;
    sendButton.textContent = "Сначала проверьте результат";
    edit.disabled = true;
    clear.disabled = true;
    confirmation.disabled = true;
    serviceButtons.forEach((button) => { button.disabled = true; });
    setStatus("Запрос передан браузеру для отправки. Ответ Formspree должен открыться в новой вкладке. Здесь получение НЕ подтверждено. Проверьте номер «" + reference.textContent + "» в MOTO → Submissions. Если вкладка не открылась, произошла ошибка или результат непонятен, сначала проверьте кабинет и не отправляйте повторно.");
    // Проверки выше выполнены явно. Нативный submit не зависит от SubmitEvent.submitter
    // и работает в старых Safari. Вызов остаётся внутри пользовательского нажатия.
    try {
      HTMLFormElement.prototype.submit.call(form);
    } catch {
      setStatus("Браузер не смог завершить передачу запроса. Получение не подтверждено: сначала проверьте номер «" + reference.textContent + "» в кабинете Formspree. Не повторяйте отправку до проверки.", "error");
    }
  });
  resetDelivery();
})();
