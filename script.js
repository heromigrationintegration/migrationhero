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

// Inicialização automática
document.addEventListener("DOMContentLoaded", () => {
  CustomDropdown.initAll();
});

