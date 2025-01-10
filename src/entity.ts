/**
 * Represents a Home Assistant entity with its state and attributes
 */
export class ChipEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;

  constructor(
    entity_id: string,
    state: string,
    attributes: Record<string, any>
  ) {
    this.entity_id = entity_id;
    this.state = state;
    this.attributes = attributes;
  }

  /**
   * Determines if the entity is currently active based on:
   * 1. Custom "on" state defined in attributes.on_state
   * 2. Default "on" state
   * 3. Numeric state greater than 0
   */
  get isActive(): boolean {
    return (
      this.state === (this.attributes.on_state || "on") || this.isPositiveState
    );
  }

  /**
   * Determines if the entity state is a positive number
   */
  get isPositiveState(): boolean {
    return parseFloat(this.state) > 0;
  }

  /**
   * Determines the color of the icon based on the entity state
   * For numeric states:
   * - Green if > 30
   * - Amber if > 20
   * - Red if <= 20
   * For non-numeric states:
   * - Uses the original active/inactive logic
   */
  get iconColor(): string {
    if (this.isNumericState(this.state)) {
      const numericState = parseFloat(this.state);
      if (numericState > this.attributes.numeric_state_pass_threshold)
        return "var(--green-color)";
      if (numericState > this.attributes.numeric_state_warning_threshold)
        return "var(--amber-color)";
    }

    // the entity state matches configured on_state or it's a positive number
    return this.isActive
      ? this.attributes.on_color || "var(--red-color)"
      : "var(--green-color)";
  }

  /**
   * Checks if the state is numeric
   */
  private isNumericState(str: string): boolean {
    return !isNaN(parseFloat(str));
  }
}
