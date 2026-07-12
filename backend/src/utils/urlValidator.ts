export const containsUrl = (text: string): boolean => {
  if (!text) return false;

  // 1. Check for IP addresses (e.g., 192.168.1.1)
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
  if (ipRegex.test(text)) return true;

  // 2. Check for URLs starting with http://, https://, or www.
  const protocolOrWwwRegex = /(?:https?:\/\/|www\.)[^\s]+/gi;
  if (protocolOrWwwRegex.test(text)) return true;

  // 3. Catch ANY dot between words (e.g. "ee.r", "google.com", "test.dev")
  // This effectively bans any domain-like structure.
  // We match: word boundaries, alphanumeric string, a literal dot, and at least one alphabetic character.
  // Note: This will not ban "3.5" or "2.0" because the part after the dot must be letters.
  const aggressiveDomainRegex = /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]+\b/gi;
  if (aggressiveDomainRegex.test(text)) return true;

  return false;
};
