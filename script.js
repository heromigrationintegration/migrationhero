const dropdownData = {
  hero: {
    label: "Hero",
    placeholder: "Selecione o nome do Hero",
    multiple: false,
    items: [
      "Dara",
      "Henrique",
      "Isadora",
      "Juliana Guimarães",
      "Juliana Santos",
      "Karla",
      "Thalison",
      "Yasmin",
      "Time Herospark",
    ],
  },

  import: {
    label: "Importação de conteúdo",
    placeholder: "Selecione uma ou mais plataformas",
    multiple: true,
    items: [
      "Alpaclass",
      "Astron Members",
      "Cademi",
      "Curseduca",
      "Eduzz",
      "Ensino Ágil",
      "Escola Avançada",
      "Hotmart",
      "Kiwify",
    ],
  },

  integration: {
    label: "Integração de sistema",
    placeholder: "Selecione um ou mais sistemas",
    multiple: true,
    items: [
      "Active Campaign",
      "Alpaclass",
      "Appsell",
      "Astron Members",
      "Atende Master",
      "Automator WP",
      "Bling",
      "Botconversa",
      "Botgram",
    ],
  },
};

class Dropdown {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.selected = [];
    this.build();
    this.bindEvents();
  }

  build() {
    const { label, placeholder, items, multiple } = this.config;

    const labelElement = document.createElement("p");
    labelElement.className = "dropdown__label";
    labelElement.textContent = label;

    const toggle = document.createElement("button");
    toggle.className = "dropdown__toggle";
    toggle.type = "button";

    toggle.innerHTML = `
      <span class="dropdown__text">${placeholder}</span>
      <svg class="dropdown__icon" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20">
        <path d="M480-333 240-573l51-51 189 189 189-189 51 51-240 240Z"/>
      </svg>
    `;

    const menu = document.createElement("ul");
    menu.className = "dropdown__menu";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "dropdown__item";

      if (multiple) {
        li.innerHTML = `
          <label>
            <input type="checkbox" value="${item}">
            ${item}
          </label>
        `;
      } else {
        li.textContent = item;
        li.dataset.value = item;
      }

      menu.appendChild(li);
    });

    this.container.append(labelElement, toggle, menu);

    this.toggle = toggle;
    this.menu = menu;
    this.text = toggle.querySelector(".dropdown__text");
  }

  bindEvents() {
    this.toggle.addEventListener("click", () => this.toggleMenu());

    const label = this.container.querySelector(".dropdown__label");
    if (label) {
      label.addEventListener("click", () => this.toggleMenu());
    }

    document.addEventListener("click", (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });

    if (this.config.multiple) {
      this.menu.addEventListener("change", () => this.updateMultiple());
    } else {
      this.menu.addEventListener("click", (e) => {
        const item = e.target.closest(".dropdown__item");

        if (!item) return;

        this.selectSingle(item.dataset.value);
      });
    }
  }

  toggleMenu() {
    const isOpen = this.container.classList.contains("dropdown--open");

    document.querySelectorAll(".dropdown").forEach((drop) => {
      drop.classList.remove("dropdown--open");
      drop.querySelector(".dropdown__menu").style.pointerEvents = "none";
    });

    if (!isOpen) {
      this.container.classList.add("dropdown--open");
      requestAnimationFrame(() => {
        this.menu.style.pointerEvents = "auto";
      });
    }
  }

  close() {
    this.container.classList.remove("dropdown--open");
    this.menu.style.pointerEvents = "none";
  }

  selectSingle(value) {
    this.selected = [value];

    this.text.textContent = value;
    this.text.style.color = "#000";

    this.close();
  }

  updateMultiple() {
    const checked = [...this.menu.querySelectorAll("input:checked")].map(
      (input) => input.value,
    );

    this.selected = checked;

    if (checked.length) {
      this.text.textContent = checked.join(", ");
      this.text.style.color = "#000";
    } else {
      this.text.textContent = this.config.placeholder;
      this.text.style.color = "#838383";
    }
  }
}

class DropdownManager {
  constructor(data) {
    this.data = data;
    this.init();
  }

  init() {
    document.querySelectorAll("[data-dropdown]").forEach((container) => {
      const key = container.dataset.dropdown;

      if (!this.data[key]) return;

      new Dropdown(container, this.data[key]);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new DropdownManager(dropdownData);
});
