import { css, html, LitElement } from "lit";
import { Task, TaskStatus } from "@lit/task";
import equal from "fast-deep-equal";
import { createChipConfig } from "./config.js";
import { version } from "../package.json";

class ToolbarStatusChips extends LitElement {
  // declare properties in a static properties class field
  static properties = {
    _config: { state: true },
    _entities: { state: true },
    _slug: { state: true },
    _states: { state: true },
  };

  constructor() {
    super();
    this._slug = document.URL.split("?")[0].split("/").pop().replace("-", "_");

    console.info(
      `%c🐱 Poat's Tools: toolbar-status-chips - ${version}`,
      "color: #CFC493;"
    );
  }

  render() {
    return html`
      ${this._createChipsTask.render({
        initial: () => html``,
        pending: () => html``,
        complete: (value) => html`<div id="chips">${value}</div>`,
        error: (error) => html`${error}`,
      })}
    `;
  }

  // styles to position the status chips at the top of on the toolbar
  static styles = css`
    #chips {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
      --stack-card-gap: 0;
    }
  `;

  // config property getters
  get additionalLabel() {
    return this._config.additional_label;
  }

  get area() {
    return this._config.area || this._slug;
  }

  get optional() {
    return this._config.optional !== undefined
      ? this._config.optional
      : this.area === this.statusPath;
  }

  get soloLabel() {
    return this._config.solo_label || "status";
  }

  get statusPath() {
    return this._config.status_path || "home";
  }

  /*
   * HASS setup
   */

  // The user supplied configuration. Throw an exception and Home Assistant
  // will render an error card.
  setConfig(config) {
    if (!equal(config, this._config)) {
      this._config = config;
    }
  }

  _mergeArraysUsingMapObject(arr1, arr2, key) {
    const map = new Map(arr2.map((item) => [item[key], item]));
    return arr1.map((item) => ({
      ...item,
      ...map.get(item[key]),
    }));
  }

  // Whenever the state changes, a new `hass` object is set. Use this to
  // update your content.
  set hass(hass) {
    this._hass = hass;

    if (!this._createChipsTask.status === TaskStatus.COMPLETE) {
      // wait for the task to complete
      return;
    }

    // get entities with the status label
    let entities = Object.values(hass.entities).filter((entity) =>
      entity.labels.includes(this.soloLabel)
    );

    // filter entities by additional label if provided or area if not on the status page
    if (!this.soloLabel) {
      // solo label trumps additional filtering
      if (this.additionalLabel) {
        entities = entities.filter((entity) =>
          entity.labels.includes(this.additionalLabel)
        );
      } else if (this.area !== this.statusPath) {
        // filter entities by area as well
        const devices = Object.values(hass.devices)
          .filter((device) => device.area_id === this.area)
          .map((device) => device.id);
        entities = entities.filter(
          (entity) =>
            entity.area_id === this.area || devices.includes(entity.device_id)
        );
      }
    }

    const entitiesWithState = this._mergeArraysUsingMapObject(
      entities,
      Object.values(hass.states),
      "entity_id"
    )
      .filter(
        (entity) =>
          !this.optional ||
          entity.state === (entity.attributes.on_state || "on") ||
          entity.state > 0
      )
      .map((entity) => {
        return {
          entity_id: entity.entity_id,
          state: entity.state,
          attributes: entity.attributes,
        };
      });

    // check if the entities have changed - update the card
    if (!equal(entitiesWithState, this._entities)) {
      // no need to check states if entities have changed
      this._entities = entitiesWithState;
      this._createChipsTask.run();
    }
  }

  /*
   * Functions
   */

  // potentially there exists a margin for some people that we need to deal with
  _addMarginForChips(margin = 45) {
    if (!window.matchMedia("only screen and (max-width: 768px)").matches) {
      // no need to add margin if not mobile
      return;
    }

    // it's a game w/ shadow roots..
    document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("ha-drawer partial-panel-resolver")
      .querySelector("ha-panel-lovelace")
      .shadowRoot.querySelector("hui-root")
      .shadowRoot.querySelector("hui-view-container")
      .style.setProperty("margin-top", `${margin}px`);
  }

  // Task handles async work
  _createChipsTask = new Task(this, {
    task: async () => {
      const helpers = await loadCardHelpers();
      const cards = this._entities.map((entity) =>
        createChipConfig(entity, this._hass)
      );

      if (!cards.length) {
        this._addMarginForChips(0);
        return;
      }

      var stack = helpers.createCardElement({
        type: "horizontal-stack",
        cards,
      });
      stack.hass = this._hass;

      this._addMarginForChips();

      return stack;
    },
    args: () => [],
  });

  static getStubConfig() {
    return {
      optional: false,
      status_path: "home",
    };
  }
}

// Register the custom card
customElements.define("toolbar-status-chips", ToolbarStatusChips);
window.customCards.push({
  type: "toolbar-status-chips",
  name: "Toolbar Status Chips",
  description:
    "Display status chips on the toolbar for entities with the status label",
});
