const { v4: uuidv4 } = require("uuid");

/**
 * Generates a unique 32-bit integer from a UUID.
 * @returns {number} A unique 32-bit integer.
 */
exports.generateUniqueInteger = () => {
  const uuid = uuidv4();
  const hex = uuid.replace(/-/g, "").slice(0, 8);
  return parseInt(hex, 10) ?? Math.random() * 100000000;
};
