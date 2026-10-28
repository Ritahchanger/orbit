// services/search-helpers.js
// Query building shared by the platform's searches.

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Case-insensitive "contains" match for user input
const containsRegex = (text) => new RegExp(escapeRegex(text), "i");

/**
 * Matches people by name only: every word typed must appear in the first or
 * last name, so "jane wan" finds Jane Wanjiku. Deliberately ignores email
 * and phone, so a search can't be used to probe people's contact details.
 */
const nameFilter = (query) => {
  const words = String(query).trim().split(/\s+/).filter(Boolean).slice(0, 4);
  return {
    $and: words.map((word) => {
      const regex = containsRegex(word);
      return { $or: [{ firstName: regex }, { lastName: regex }] };
    }),
  };
};

module.exports = { escapeRegex, containsRegex, nameFilter };
