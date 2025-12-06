// Helper functions to convert between JSON objects and JSON strings

export const stringifyJson = (value) => {
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value; // Already valid JSON string
    } catch {
      return JSON.stringify(value); // Plain string, stringify it
    }
  }
  return JSON.stringify(value);
};

export const parseJson = (value) => {
  if (!value) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value; // Not JSON, return as-is
    }
  }
  return value;
};

export const parseJsonFields = (obj, fields) => {
  const result = { ...obj };
  fields.forEach(field => {
    if (result[field]) {
      result[field] = parseJson(result[field]);
    }
  });
  return result;
};

export const stringifyJsonFields = (obj, fields) => {
  const result = { ...obj };
  fields.forEach(field => {
    if (result[field] !== undefined) {
      result[field] = stringifyJson(result[field]);
    }
  });
  return result;
};

