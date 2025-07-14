import { getAllFontsFromCache } from './cache-storage';

export const loadFont = async (fontName: string, fontUrl: string) => {
  const fontFace = new FontFace(fontName, `url(${fontUrl})`);
  try {
    await fontFace.load();
    document.fonts.add(fontFace);
  } catch (e) {
    console.error(`Failed to load font ${fontName}:`, e);
  }
};

export const loadCustomFonts = async () => {
  const fonts = await getAllFontsFromCache();
  for (const font of fonts) {
    await loadFont(font.name, font.url);
  }
};

export const removeCustomFont = (fontName: string) => {
  const styleSheet = document.styleSheets[0];
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    const rule = styleSheet.cssRules[i] as CSSFontFaceRule;
    if (rule.style && rule.style.fontFamily === `'${fontName}'`) {
      styleSheet.deleteRule(i);
      break;
    }
  }
};
