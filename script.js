class CustomDropdown {
  static instances = [];

  constructor(container) {
    this.container = container;
    this.dropdown = container.querySelector(".field__dropdown");
    this.list = container.querySelector(".field__list");
    this.button = container.querySelector(".field__select");
    this.items = container.querySelectorAll(".field__item");

    this.init();
    CustomDropdown.instances.push(this);
  }

  init() {
    this.bindToggle();
    this.bindItems();
  }

  bindToggle() {
    const toggleHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = this.list.classList.contains("active");
      CustomDropdown.closeAll();

      if (!isOpen) this.open();
    };

    this.dropdown.addEventListener("click", toggleHandler);
    this.button.addEventListener("click", toggleHandler);
  }

  bindItems() {
    this.items.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();

        const checkbox = item.querySelector("input[type='checkbox']");

        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          this.updateMultiSelect();
        } else {
          this.selectSingle(item);
        }
      });
    });
  }

  open() {
    this.list.classList.add("active");
    this.dropdown.classList.add("active");
  }

  close() {
    this.list.classList.remove("active");
    this.dropdown.classList.remove("active");
  }

  selectSingle(item) {
    this.items.forEach((i) => i.classList.remove("selected"));

    item.classList.add("selected");
    this.button.textContent = item.textContent.trim();
    this.button.classList.add("filled");

    this.close();
  }

  updateMultiSelect() {
    const selected = [];

    this.items.forEach((item) => {
      const checkbox = item.querySelector("input[type='checkbox']");

      if (checkbox && checkbox.checked) {
        item.classList.add("selected");
        selected.push(item.textContent.trim());
      } else {
        item.classList.remove("selected");
      }
    });

    if (selected.length > 0) {
      this.button.textContent = selected.join(", ");
      this.button.classList.add("filled");
    } else {
      this.resetButton();
    }
  }

  resetButton() {
    this.button.classList.remove("filled");
    this.button.textContent =
      this.button.dataset.placeholder || "Selecione uma opção";
  }

  static closeAll() {
    CustomDropdown.instances.forEach((instance) => instance.close());
  }

  static initAll() {
    document.querySelectorAll(".field__toggle").forEach((toggle) => {
      new CustomDropdown(toggle);
    });

    document.addEventListener("click", () => {
      CustomDropdown.closeAll();
    });
  }
}

/**********************
 * CONFIG
 **********************/
const CONFIG = {
  sheetsEndpoint:
    "https://script.google.com/macros/s/AKfycbwBrSt_6C59FDvFO2kjKXw4OoZ19hlUjJtqCrj6O-L26W530JYvPpaioxq7jc3lTU4o0g/exec",
};

/**********************
 * SERVICE → CAPTURA DADOS
 **********************/
class MigrationFormService {
  constructor(form) {
    this.form = form;
  }

  getHero() {
    return this.form
      .querySelector(".field__container:nth-child(1) .field__select")
      .textContent.trim();
  }

  getNomeCliente() {
    return this.form.querySelector("[name='nomeCliente']").value.trim();
  }

  getMultiSelect(containerIndex) {
    const container = this.form.querySelector(
      `.field__container:nth-child(${containerIndex})`,
    );

    const checked = [
      ...container.querySelectorAll("input[type='checkbox']:checked"),
    ];

    return checked.map((cb) => cb.parentElement.textContent.trim()).join(", ");
  }

  collect() {
    return {
      dataCriacao: new Date().toLocaleString("pt-BR"),
      hero: this.getHero(),
      nomeCliente: this.getNomeCliente(),
      importacaoConteudo: this.getMultiSelect(3),
      integracaoSistemas: this.getMultiSelect(4),
    };
  }
}

/**********************
 * SERVICE → GOOGLE SHEETS
 **********************/
class GoogleSheetsService {
  static async send(data) {
    const res = await fetch(CONFIG.sheetsEndpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  }
}

/**********************
 * UI CONTROL
 **********************/
class MigrationUI {
  constructor(form) {
    this.form = form;
    this.fields = form.querySelector(".field");
    this.action = form.querySelector(".action");
    this.info = form.querySelector(".info");

    this.linkEl = form.querySelector(".info__link");
    this.copyBtn = form.querySelector(".info__copy");
  }

  showSuccess(url) {
    this.fields.style.display = "none";
    this.action.style.display = "none";
    this.info.style.display = "block";

    if (url) {
      const pageUrl = `${window.location.origin}/migrationhero/?step=product&sheet=${encodeURIComponent(url)}`;

      this.linkEl.childNodes[0].nodeValue = pageUrl;

      this.copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(pageUrl);
        alert("Link copiado!");
      });
    }
  }
}

/**********************
 * CONTROLLER
 **********************/
class MigrationController {
  constructor() {
    this.form = document.querySelector(".container__migration");
    this.button = this.form.querySelector(".action__btn--next");

    this.service = new MigrationFormService(this.form);
    this.ui = new MigrationUI(this.form);

    this.bind();
  }

  bind() {
    this.button.addEventListener("click", (e) => {
      e.preventDefault();
      this.createChecklist();
    });
  }

  async createChecklist() {
    try {
      const data = this.service.collect();

      const response = await GoogleSheetsService.send(data);

      this.ui.showSuccess(response.url);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar");
    }
  }
}

class StepRouter {
  static init() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("step") === "product") {
      document.querySelector(".container__migration").style.display = "none";
      document.querySelector(".container__product").style.display = "flex";
    }
  }
}

/**********************
 * INIT
 **********************/
document.addEventListener("DOMContentLoaded", () => {
  CustomDropdown.initAll();
  new MigrationController();
  StepRouter.init();
});
