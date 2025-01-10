// /**
//  * Represents a Home Assistant entity with its state and attributes
//  */
// class Entity {
//   entity_id: string;
//   state: string | number;
//   attributes: Record<string, any>;

//   constructor(
//     entity_id: string,
//     state: string | number,
//     attributes: Record<string, any>
//   ) {
//     this.entity_id = entity_id;
//     this.state = state;
//     this.attributes = attributes;
//   }

//   /**
//    * Determines if the entity is currently active based on:
//    * 1. Custom "on" state defined in attributes.on_state
//    * 2. Default "on" state
//    * 3. Numeric state greater than 0
//    */
//   get isActive(): boolean {
//     return (
//       this.state === (this.attributes.on_state || "on") ||
//       (typeof this.state === "number" && this.state > 0)
//     );
//   }
// }
