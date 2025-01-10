/**
 * Determines if an entity should be included based on its state
 * @param {Object} entity - The entity to check
 * @param {boolean} optional - Whether entities must be "active" to be included
 * @returns {boolean} - Whether the entity should be included
 */
const shouldIncludeEntity = (entity, optional) => {
  // If optional is false, include all entities
  if (!optional) {
    return true;
  }

  // Check if entity is "active" by either:
  // 1. Matching its custom "on" state (stored in attributes.on_state)
  // 2. Matching the default "on" state
  // 3. Having a numeric state greater than 0
  const isActive =
    entity.state === (entity.attributes.on_state || "on") || entity.state > 0;

  return isActive;
};

/**
 * Merges two arrays of objects based on a common key, updating items from arr1 with matching properties from arr2.
 * Properties from arr2 will overwrite properties in arr1 if they exist in both objects.
 *
 * @param arr1 - The primary array of objects to be updated
 * @param arr2 - The secondary array of objects containing update values
 * @param key - The property name to use as the matching key between objects
 * @returns A new array where objects from arr1 are updated with matching properties from arr2
 *
 * @example
 * const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
 * const updates = [{ id: 1, age: 30 }, { id: 2, age: 25 }];
 * mergeArraysUsingMapObject(users, updates, 'id');
 * // Returns: [{ id: 1, name: 'John', age: 30 }, { id: 2, name: 'Jane', age: 25 }]
 */
const mergeArraysUsingMapObject = (arr1: any[], arr2: any[], key: string) => {
  // Create a Map object using arr2, with the specified key as the Map key
  // This provides O(1) lookup time for matching objects
  const map = new Map(arr2.map((item) => [item[key], item]));

  // Map over arr1 and spread both the original item and any matching updates from arr2
  // If no matching item exists in arr2, map.get() returns undefined and no properties are spread
  return arr1.map((item) => ({
    ...item,
    ...map.get(item[key]),
  }));
};

/**
 * Processes entities by merging them with their current states from Home Assistant,
 * filtering based on inclusion criteria, and formatting the final entity objects.
 *
 * @param entities - Array of entity objects to process
 * @param hass - Home Assistant state object containing current states of all entities
 * @param optional - Optional configuration parameters for entity filtering
 * @returns Array of processed entities with their current states and attributes
 */
export function entitiesThatShouldBeChips(entities, hass, optional) {
  // First, merge the entity definitions with their current states from Home Assistant
  // Converting hass.states object to array using Object.values()
  const mergedEntities = mergeArraysUsingMapObject(
    entities,
    Object.values(hass.states),
    "entity_id"
  );

  // Filter out entities that don't meet inclusion criteria
  // Then map to a standardized format with only necessary properties
  return mergedEntities
    .filter((entity) => shouldIncludeEntity(entity, optional))
    .map((entity) => ({
      entity_id: entity.entity_id,
      state: entity.state,
      attributes: entity.attributes,
    }));
}
