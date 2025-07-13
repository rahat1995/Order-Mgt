import { toWords } from 'number-to-words';

export function amountToWords(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '';
  }

  const integerPart = Math.floor(amount);
  const fractionalPart = Math.round((amount - integerPart) * 100);

  let words = toWords(integerPart);
  
  // Capitalize the first letter of each word
  words = words.replace(/\b\w/g, char => char.toUpperCase());
  
  words = `Taka ${words}`;

  if (fractionalPart > 0) {
    words += ` and ${toWords(fractionalPart)} Paisa`;
  }

  return `${words} Only`;
}
