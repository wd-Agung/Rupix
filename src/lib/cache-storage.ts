const FONT_CACHE_NAME = 'font-cache-v1';

export const addFontToCache = async (name: string, file: File) => {
  const cache = await caches.open(FONT_CACHE_NAME);
  const response = new Response(file);
  await cache.put(new Request(`/fonts/${name}`), response);
};

export const getFontFromCache = async (name: string): Promise<Response | undefined> => {
  const cache = await caches.open(FONT_CACHE_NAME);
  return cache.match(new Request(`/fonts/${name}`));
};

export const getAllFontsFromCache = async (): Promise<{ name: string; url: string }[]> => {
  const cache = await caches.open(FONT_CACHE_NAME);
  const requests = await cache.keys();
  const fonts = await Promise.all(
    requests.map(async (request) => {
      if (request.url.includes('/fonts/')) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const name = request.url.split('/fonts/')[1];
          return { name, url };
        }
      }
      return null;
    })
  );
  return fonts.filter((font): font is { name: string; url: string } => font !== null);
};

export const removeFontFromCache = async (name: string) => {
  const cache = await caches.open(FONT_CACHE_NAME);
  await cache.delete(new Request(`/fonts/${name}`));
};
