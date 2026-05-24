/**
 * Utility functions for organization components
 */

/**
 * Determines if a color is light (white or near-white)
 * Used to determine text color contrast
 */
export function isLightColor(color: string): boolean {
  const lightColors = ['#ffffff', '#fff', 'white'];
  return lightColors.includes(color.toLowerCase());
}

/**
 * Gets the appropriate text color for a given background color
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff';
}

/**
 * Creates a gradient background style for organization sections
 */
export function createOrgGradient(
  primaryColor: string,
  secondaryColor: string,
  direction: 'horizontal' | 'vertical' | 'diagonal' = 'diagonal'
): string {
  const directions = {
    horizontal: '90deg',
    vertical: '180deg',
    diagonal: '135deg'
  };
  
  return `linear-gradient(${directions[direction]}, ${primaryColor}08 0%, ${secondaryColor}05 50%, transparent 100%)`;
}

/**
 * Creates a subtle background gradient for the page
 */
export function createPageGradient(
  primaryColor: string,
  secondaryColor: string
): string {
  return `linear-gradient(135deg, ${primaryColor}05 0%, transparent 50%, ${secondaryColor}05 100%)`;
}

/**
 * Adds opacity to a hex color
 */
export function addOpacityToHex(hex: string, opacity: number): string {
  const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${opacityHex}`;
}
