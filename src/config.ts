export function createChipConfig(entity, hass) {
  return {
    type: "custom:button-card",
    entity: entity.entity_id,
    show_name: false,
    show_label: true,
    size: "80%",
    hold_action: {
      action: "more-info",
    },
    label: entity.state > 0 ? entity.state : null,
    tap_action: {
      action: entity.attributes.navigation_path ? "navigate" : "more-info",
      navigation_path: entity.attributes.navigation_path,
    },
    styles: {
      label: [
        {
          padding: "0px 6px",
        },
        {
          font: "bold 14px system-ui",
        },
      ],
      img_cell: [
        {
          width: "24px",
        },
      ],
      grid: [
        {
          "grid-template-areas": "'i l'",
        },
      ],
      card: [
        {
          "box-shadow": hass.themes.darkMode
            ? "0px 2px 4px 0px rgba(0,0,0,0.80)"
            : "var(--box-shadow)",
        },
        {
          height: "36px",
        },
        {
          width: "auto",
        },
        {
          padding: "0px 6px",
        },
        {
          "margin-right": "5px",
        },
      ],
      icon: [
        {
          color:
            entity.state > 0 ||
            entity.state == (entity.attributes.on_state || "on")
              ? entity.attributes.on_color || "var(--red-color)"
              : "var(--green-color)",
        },
      ],
    },
  };
}
