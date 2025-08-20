/* eslint-disable no-console */

/**
 * Utility functions for handling locale and internationalization
 */

// Dictionary modules to load
export const DICTIONARY_MODULES = [
  'auth',
  'dashboard',
  'sidebar',
  'inventory',
  'catalogue',
  'sales',
  'purchases',
  'client',
  'vendor',
  'customers',
  'members',
  'notification',
  'settings',
  'profile',
  'components',
];

/**
 * Loads all dictionary messages for a given locale
 * @param {string} locale - The locale to load messages for
 * @returns {Promise<Object>} - Combined messages object
 */
export async function loadDictionaryMessages(locale) {
  const messages = {};

  try {
    // Load all dictionary modules in parallel for better performance
    const messagePromises = DICTIONARY_MODULES.map(async (module) => {
      try {
        const moduleMessages = await import(
          `../../dictonaries/${module}/${locale}.json`
        );
        return moduleMessages.default || moduleMessages;
      } catch (error) {
        console.warn(
          `Failed to load ${module} messages for locale ${locale}:`,
          error,
        );
        return {};
      }
    });

    const loadedMessages = await Promise.all(messagePromises);

    // Merge all loaded messages
    loadedMessages.forEach((moduleMessages) => {
      Object.assign(messages, moduleMessages);
    });

    return messages;
  } catch (error) {
    console.error('Failed to load dictionary messages:', error);
    throw error;
  }
}

/**
 * Validates if a locale is supported
 * @param {string} locale - The locale to validate
 * @returns {boolean} - Whether the locale is supported
 */
export function isValidLocale(locale) {
  const supportedLocales = ['en', 'hi'];
  return supportedLocales.includes(locale);
}

/**
 * Gets the fallback locale if the provided one is not supported
 * @param {string} locale - The locale to check
 * @returns {string} - The fallback locale
 */
export function getFallbackLocale(locale) {
  return isValidLocale(locale) ? locale : 'en';
}
