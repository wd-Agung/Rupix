export const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('font-storage', 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('fonts')) {
        db.createObjectStore('fonts', { keyPath: 'name' });
      }
    };
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const addFont = async (name: string, file: File) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['fonts'], 'readwrite');
    const store = transaction.objectStore('fonts');
    const reader = new FileReader();
    reader.onload = (event) => {
      const request = store.put({ name, file: event.target?.result });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const getFonts = async () => {
  const db = await openDB();
  return new Promise<any[]>((resolve, reject) => {
    const transaction = db.transaction(['fonts'], 'readonly');
    const store = transaction.objectStore('fonts');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const removeFont = async (name: string) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['fonts'], 'readwrite');
    const store = transaction.objectStore('fonts');
    const request = store.delete(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
