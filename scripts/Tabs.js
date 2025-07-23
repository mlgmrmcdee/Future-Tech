import BaseComponent from "./BaseComponent.js";

const rootSelector = "[data-js-tabs]";

class Tabs extends BaseComponent {
  selectors = {
    root: rootSelector,
    button: "[data-js-tabs-button]",
    content: "[data-js-tabs-content]",
  };

  stateClasses = {
    isActive: "is-active",
  };

  stateAttributes = {
    ariaSelected: "aria-selected",
    tabIndex: "tabindex",
  };

  constructor(rootElement) {
    super();
    this.rootElement = rootElement;
    this.buttonElements = this.rootElement.querySelectorAll(
      this.selectors.button
    );
    this.contentElements = this.rootElement.querySelectorAll(
      this.selectors.content
    );
    this.state = this.getProxyState({
      activeTabIndex: [...this.buttonElements].findIndex((buttonElement) =>
        buttonElement.classList.contains(this.stateClasses.isActive)
      ),
    });
    this.limitTabsIndex = this.buttonElements.length - 1;

    this.isAnimating = false;

    this.bindEvents();
  }

  updateUI() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    const { activeTabIndex } = this.state;
    const oldIndex = [...this.contentElements].findIndex((el) =>
      el.classList.contains(this.stateClasses.isActive)
    );
    const newIndex = activeTabIndex;

    this.buttonElements.forEach((button, index) => {
      const isActive = index === activeTabIndex;
      button.classList.toggle(this.stateClasses.isActive, isActive);
      button.setAttribute(
        this.stateAttributes.ariaSelected,
        isActive.toString()
      );
      button.setAttribute(this.stateAttributes.tabIndex, isActive ? "0" : "-1");
    });

    if (oldIndex === newIndex) {
      this.isAnimating = false;
      return;
    }

    const oldContent = this.contentElements[oldIndex];
    const newContent = this.contentElements[newIndex];

    if (!oldContent || !newContent) {
      this.isAnimating = false;
      return;
    }

    const oldHeight = oldContent.scrollHeight + "px";
    oldContent.style.height = oldHeight;

    requestAnimationFrame(() => {
      oldContent.style.height = "0";
      oldContent.style.opacity = "0";
    });

    setTimeout(() => {
      oldContent.classList.remove(this.stateClasses.isActive);
      oldContent.style.display = "none";
      oldContent.style.height = "";
      oldContent.style.opacity = "";

      newContent.classList.add(this.stateClasses.isActive);
      newContent.style.display = "block";
      newContent.style.height = "0";
      newContent.style.opacity = "0";

      const newHeight = newContent.scrollHeight + "px";

      requestAnimationFrame(() => {
        newContent.style.height = newHeight;
        newContent.style.opacity = "1";
      });

      setTimeout(() => {
        newContent.style.height = "";
        newContent.style.opacity = "";
        this.isAnimating = false;
      }, 500);
    }, 500);
  }

  activateTab(newTabIndex) {
    if (this.isAnimating) return;

    this.state.activeTabIndex = newTabIndex;
    this.buttonElements[newTabIndex].focus();
  }

  previousTab = () => {
    if (this.isAnimating) return;

    const newTabIndex =
      this.state.activeTabIndex === 0
        ? this.limitTabsIndex
        : this.state.activeTabIndex - 1;

    this.activateTab(newTabIndex);
  };

  nextTab = () => {
    if (this.isAnimating) return;

    const newTabIndex =
      this.state.activeTabIndex === this.limitTabsIndex
        ? 0
        : this.state.activeTabIndex + 1;

    this.activateTab(newTabIndex);
  };

  firstTab = () => {
    if (this.isAnimating) return;

    this.activateTab(0);
  };

  lastTab = () => {
    if (this.isAnimating) return;

    this.activateTab(this.limitTabsIndex);
  };

  onButtonClick(buttonIndex) {
    if (this.isAnimating) return;

    this.state.activeTabIndex = buttonIndex;
  }

  onKeyDown = (event) => {
    if (this.isAnimating) return;

    const { code, metaKey } = event;

    const action = {
      ArrowLeft: this.previousTab,
      ArrowRight: this.nextTab,
      Home: this.firstTab,
      End: this.lastTab,
    }[code];

    const isMacHomeKey = metaKey && code === "ArrowLeft";
    if (isMacHomeKey) {
      this.firstTab();
      return;
    }

    const isMacEndKey = metaKey && code === "ArrowRight";
    if (isMacEndKey) {
      this.lastTab();
      return;
    }

    action?.();
  };

  bindEvents() {
    this.buttonElements.forEach((buttonElement, index) => {
      buttonElement.addEventListener("click", () => this.onButtonClick(index));
    });
    this.rootElement.addEventListener("keydown", this.onKeyDown);
  }
}

class TabsCollection {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new Tabs(element);
    });
  }
}

export default TabsCollection;
