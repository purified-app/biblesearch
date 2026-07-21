import { en } from 'src/assets/i18n/en';

// Define type for keys of 'en'
type Keys = keyof typeof en;

// Use type assertion for the keys and accumulator
export const TextKey = Object.keys(en).reduce((acc, key) => {
  // Here we assert that 'key' is a valid key of 'en' (Keys type)
  (acc as Record<Keys, Keys>)[key as Keys] = key as Keys;
  return acc;
}, {} as { [K in Keys]: K });
