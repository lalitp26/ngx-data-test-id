export const DataTestidRegex = {
  ALLOWED_CHARACTERS: /^[a-zA-Z0-9-_]+$/, // Alphanumeric characters, hyphens, and underscores only
  CONSECUTIVE_UNDERSCORES: /__/, // Two or more underscores in a row
  CONSECUTIVE_HYPHENS: /--/, // Two or more hyphens in a row
  START_OR_END_HYPHEN: /^-|-$/, // Hyphen at the start or end
  UPPERCASE_LETTERS: /[A-Z]/, // Any uppercase letter
  INVALID_CHARACTERS: /[^a-z0-9-_]/g, // Characters that are not alphanumeric, hyphens, or underscores
  MULTIPLE_HYPHENS: /--+/g, // Two or more hyphens in a row
  LEADING_HYPHENS: /^-+/, // Leading hyphens
  TRAILING_HYPHENS: /-+$/, //
};
