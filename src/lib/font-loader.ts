import { getAllFontsFromCache } from './cache-storage';

export const loadCustomFonts = async () => {
  const fonts = await getAllFontsFromCache();
  const styleSheet = document.styleSheets[0];
  fonts.forEach(font => {
    const fontFace = `
      @font-face {
        font-family: '${font.name}';
        src: url(${font.url});
      }
    `;
    styleSheet.insertRule(fontFace, styleSheet.cssRules.length);
  });
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
