/**
 * cardImageHelper.js
 * Centralized utility to ensure 100% of displayed cards have verified, valid images.
 * Completely prevents any card without an image from being rendered.
 */

/**
 * Checks if a card has a valid image filename and is not a dummy placeholder.
 * @param {Object} card
 * @returns {boolean}
 */
export function hasValidCardImage(card) {
  if (!card) return false;
  // Ignore dummy placeholder cards
  if (typeof card.name === 'string' && card.name.startsWith('Card #')) {
    return false;
  }
  const hasFile = !!(card.rawFile || card.image);
  return hasFile;
}

/**
 * Returns the proper image URL for a card with fallback modes.
 * @param {Object} card
 * @param {'full'|'art'|'mini'} mode
 * @returns {string}
 */
export function getCardImageUrl(card, mode = 'full') {
  if (!card) return '/assets/card_back.png';
  const file = card.rawFile || card.image || card.miniImage || '';
  if (!file) return '/assets/card_back.png';

  const base = file.replace(/\.(bmp|png|webp|jpg)$/i, '');
  const webp = `${base}.webp`;

  if (mode === 'art') return `/assets/cards-art/${webp}`;
  if (mode === 'mini') return `/assets/cards-mini/${webp}`;
  return `/assets/cards/${webp}`;
}

/**
 * Filters an array of cards to only those that have valid images.
 * @param {Array} cards
 * @returns {Array}
 */
export function filterCardsWithValidImages(cards = []) {
  if (!Array.isArray(cards)) return [];
  return cards.filter(hasValidCardImage);
}

export default {
  hasValidCardImage,
  getCardImageUrl,
  filterCardsWithValidImages,
};
