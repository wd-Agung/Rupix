import * as fabric from 'fabric';
import hotkeys from 'hotkeys-js';
import { useDesignStore } from '../stores/design-store';

// Define hotkey scopes
export const HOTKEY_SCOPES = {
  DESIGN: 'design',
  CANVAS: 'canvas',
  GLOBAL: 'all'
} as const;

// Interface for hotkey configuration
export interface HotkeyConfig {
  key: string;
  description: string;
  scope?: string;
  action: () => void;
  preventDefault?: boolean;
}

// Clipboard data for copy/paste functionality
let clipboardData: any = null;

export class HotkeyManager {
  private static instance: HotkeyManager;
  private isInitialized = false;
  private boundHotkeys: string[] = [];

  private constructor() { }

  static getInstance(): HotkeyManager {
    if (!HotkeyManager.instance) {
      HotkeyManager.instance = new HotkeyManager();
    }
    return HotkeyManager.instance;
  }

  /**
   * Initialize all hotkeys for the design tool
   */
  initialize() {
    if (this.isInitialized) return;

    // Set default scope
    hotkeys.setScope(HOTKEY_SCOPES.DESIGN);

    // Register all hotkeys
    this.registerHotkeys();
    this.isInitialized = true;
  }

  /**
   * Cleanup all registered hotkeys
   */
  cleanup() {
    if (!this.isInitialized) return;

    // Unbind all registered hotkeys
    this.boundHotkeys.forEach(key => {
      hotkeys.unbind(key);
    });
    this.boundHotkeys = [];
    this.isInitialized = false;
  }

  /**
   * Register a single hotkey
   */
  private registerHotkey(config: HotkeyConfig) {
    const { key, action, scope = HOTKEY_SCOPES.DESIGN, preventDefault = true } = config;

    hotkeys(key, { scope }, (event, handler) => {
      if (preventDefault) {
        event.preventDefault();
      }

      // Check if we're in an input field (except canvas)
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      // Skip hotkeys when typing in input fields, except for canvas-specific ones
      if (isInput && !target.closest('canvas')) {
        return;
      }

      try {
        action();
      } catch (error) {
        console.error(`Error executing hotkey ${key}:`, error);
      }
    });

    this.boundHotkeys.push(key);
  }

  /**
   * Register all hotkeys for the design tool
   */
  private registerHotkeys() {
    // === OBJECT MANIPULATION ===
    this.registerHotkey({
      key: 'ctrl+c,command+c',
      description: 'Copy selected object',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          const activeObject = design.canvas.getActiveObject();
          if (activeObject && !activeObject.isBaseLayer) {
            clipboardData = activeObject.toObject();
            console.log('Object copied to clipboard');
          }
        }
      }
    });

    this.registerHotkey({
      key: 'ctrl+v,command+v',
      description: 'Paste object',
      action: async () => {
        if (!clipboardData) return;

        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          // Handle different object types
          let newObject: fabric.Object | null = null;

          const clipboardObject: any = clipboardData;
          clipboardObject.borderScaleFactor = 2.5;
          clipboardObject.cornerStrokeColor = '#3b82f6';
          clipboardObject.borderColor = '#3b82f6';

          try {
            switch (clipboardObject.type) {
              case 'Rect':
                newObject = new fabric.Rect(clipboardObject);
                break;
              case 'Circle':
                newObject = new fabric.Circle(clipboardObject);
                break;
              case 'IText':
                newObject = new fabric.IText(clipboardObject.text, clipboardObject);
                break;
              case 'Image':
                // Handle image paste asynchronously
                fabric.Image.fromURL(clipboardObject.src, {
                  crossOrigin: 'anonymous'
                }).then((img: fabric.Image) => {
                  img.set({
                    ...clipboardObject,
                    left: (clipboardObject.left || 0) + 20,
                    top: (clipboardObject.top || 0) + 20
                  });
                  design.canvas!.add(img);
                  design.canvas!.setActiveObject(img);

                  // Ensure base layer stays at bottom
                  if (design.baseLayer) {
                    design.canvas!.sendObjectToBack(design.baseLayer);
                  }

                  design.canvas!.renderAll();

                  // Add to layers
                  design.addLayer({
                    name: `${clipboardObject.type} Copy`,
                    object: img,
                    visible: true,
                    locked: false
                  });
                });
                return;
              default:
                console.warn('Unknown object type for paste:', clipboardObject.type);
                return;
            }

            if (newObject) {
              // Offset the pasted object
              newObject.set({
                left: (clipboardObject.left || 0) + 20,
                top: (clipboardObject.top || 0) + 20
              });

              design.canvas.add(newObject);
              design.canvas.setActiveObject(newObject);

              // Ensure base layer stays at bottom
              if (design.baseLayer) {
                design.canvas.sendObjectToBack(design.baseLayer);
              }

              design.canvas.renderAll();

              // Add to layers
              design.addLayer({
                name: `${clipboardObject.type} Copy`,
                object: newObject,
                visible: true,
                locked: false
              });
            }
          } catch (error) {
            console.error('Error pasting object:', error);
          }
        }
      }
    });

    this.registerHotkey({
      key: 'ctrl+d,command+d',
      description: 'Duplicate selected object',
      action: () => {
        const store = useDesignStore.getState();
        store.duplicateActiveObject();
      }
    });

    this.registerHotkey({
      key: 'delete,backspace',
      description: 'Delete selected object',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          const activeObject = design.canvas.getActiveObject();
          if (activeObject && !activeObject.isBaseLayer) {
            design.canvas.remove(activeObject);
            // Also remove from layers
            const layerToRemove = design.layers.find(l => l.object === activeObject);
            if (layerToRemove) {
              design.removeLayer(layerToRemove.id);
            }
          }
        }
      }
    });

    // === HISTORY ===
    this.registerHotkey({
      key: 'ctrl+z,command+z',
      description: 'Undo',
      action: () => {
        const store = useDesignStore.getState();
        store.undo();
      }
    });

    this.registerHotkey({
      key: 'ctrl+y,command+y,ctrl+shift+z,command+shift+z',
      description: 'Redo',
      action: () => {
        const store = useDesignStore.getState();
        store.redo();
      }
    });

    // === SELECTION ===
    this.registerHotkey({
      key: 'ctrl+a,command+a',
      description: 'Select all objects',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          // Get all objects except base layer
          const objects = design.canvas.getObjects().filter(obj =>
            !obj.isBaseLayer &&
            obj.visible !== false &&
            obj.selectable !== false
          );

          if (objects.length > 0) {
            if (objects.length === 1) {
              design.canvas.setActiveObject(objects[0]);
            } else {
              const selection = new fabric.ActiveSelection(objects, {
                canvas: design.canvas
              });
              design.canvas.setActiveObject(selection);
            }
            design.canvas.renderAll();
          }
        }
      }
    });

    this.registerHotkey({
      key: 'escape',
      description: 'Deselect / Switch to select tool',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          design.canvas.discardActiveObject();
          design.canvas.renderAll();
        }
        store.setSelectedTool('select');
      }
    });

    // === TOOLS ===
    this.registerHotkey({
      key: 'v',
      description: 'Select tool',
      action: () => {
        const store = useDesignStore.getState();
        store.setSelectedTool('select');
      }
    });

    this.registerHotkey({
      key: 'r',
      description: 'Rectangle tool',
      action: () => {
        const store = useDesignStore.getState();
        store.setSelectedTool('rectangle');
      }
    });

    this.registerHotkey({
      key: 'c',
      description: 'Circle tool',
      action: () => {
        const store = useDesignStore.getState();
        store.setSelectedTool('circle');
      }
    });

    this.registerHotkey({
      key: 't',
      description: 'Text tool',
      action: () => {
        const store = useDesignStore.getState();
        store.setSelectedTool('text');
      }
    });

    this.registerHotkey({
      key: 'i',
      description: 'Image tool',
      action: () => {
        const store = useDesignStore.getState();
        store.setSelectedTool('image');
      }
    });

    // === CANVAS NAVIGATION ===
    this.registerHotkey({
      key: 'ctrl+0,command+0',
      description: 'Fit canvas to screen',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design) {
          design.centerCamera();
        }
      }
    });

    this.registerHotkey({
      key: 'ctrl+1,command+1',
      description: 'Zoom to 100%',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          design.canvas.setZoom(1);
          design.canvas.renderAll();
        }
      }
    });

    this.registerHotkey({
      key: 'ctrl+=,command+=,ctrl+plus,command+plus',
      description: 'Zoom in',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          const currentZoom = design.canvas.getZoom();
          const newZoom = Math.min(currentZoom * 1.2, 20);
          const canvasWidth = design.canvas.getWidth();
          const canvasHeight = design.canvas.getHeight();
          design.canvas.zoomToPoint(
            new fabric.Point(canvasWidth / 2, canvasHeight / 2),
            newZoom
          );
        }
      }
    });

    this.registerHotkey({
      key: 'ctrl+-,command+-,ctrl+minus,command+minus',
      description: 'Zoom out',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          const currentZoom = design.canvas.getZoom();
          const newZoom = Math.max(currentZoom * 0.8, 0.1);
          const canvasWidth = design.canvas.getWidth();
          const canvasHeight = design.canvas.getHeight();
          design.canvas.zoomToPoint(
            new fabric.Point(canvasWidth / 2, canvasHeight / 2),
            newZoom
          );
        }
      }
    });

    // === LAYERS ===
    this.registerHotkey({
      key: 'ctrl+],command+]',
      description: 'Bring to front',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          const activeObject = design.canvas.getActiveObject();
          if (activeObject && !activeObject.isBaseLayer) {
            design.canvas.bringObjectToFront(activeObject);
            design.canvas.renderAll();
          }
        }
      }
    });

    this.registerHotkey({
      key: 'ctrl+[,command+[',
      description: 'Send to back',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design?.canvas) {
          const activeObject = design.canvas.getActiveObject();
          if (activeObject && !activeObject.isBaseLayer) {
            design.canvas.sendObjectToBack(activeObject);
            // Ensure base layer stays at the bottom
            if (design.baseLayer) {
              design.canvas.sendObjectToBack(design.baseLayer);
            }
            design.canvas.renderAll();
          }
        }
      }
    });

    // === CAMERA LOCK ===
    this.registerHotkey({
      key: 'ctrl+l,command+l',
      description: 'Toggle camera lock',
      action: () => {
        const store = useDesignStore.getState();
        const design = store.getActiveDesign();
        if (design) {
          design.setCameraLocked(!design.cameraLocked);
          store.setCameraLocked(!design.cameraLocked);
        }
      }
    });

    console.log('Hotkeys initialized:', this.boundHotkeys.length, 'shortcuts registered');
  }

  /**
   * Get all registered hotkeys with their descriptions
   */
  getHotkeyList(): Array<{ key: string; description: string }> {
    return [
      { key: 'Ctrl+C / ⌘+C', description: 'Copy selected object' },
      { key: 'Ctrl+V / ⌘+V', description: 'Paste object' },
      { key: 'Ctrl+D / ⌘+D', description: 'Duplicate selected object' },
      { key: 'Delete / Backspace', description: 'Delete selected object' },
      { key: 'Ctrl+Z / ⌘+Z', description: 'Undo' },
      { key: 'Ctrl+Y / ⌘+Y', description: 'Redo' },
      { key: 'Ctrl+A / ⌘+A', description: 'Select all objects' },
      { key: 'Escape', description: 'Deselect / Switch to select tool' },
      { key: 'V', description: 'Select tool' },
      { key: 'R', description: 'Rectangle tool' },
      { key: 'C', description: 'Circle tool' },
      { key: 'T', description: 'Text tool' },
      { key: 'I', description: 'Image tool' },
      { key: 'Ctrl+0 / ⌘+0', description: 'Fit canvas to screen' },
      { key: 'Ctrl+1 / ⌘+1', description: 'Zoom to 100%' },
      { key: 'Ctrl++ / ⌘++', description: 'Zoom in' },
      { key: 'Ctrl+- / ⌘+-', description: 'Zoom out' },
      { key: 'Ctrl+] / ⌘+]', description: 'Bring to front' },
      { key: 'Ctrl+[ / ⌘+[', description: 'Send to back' },
      { key: 'Ctrl+L / ⌘+L', description: 'Toggle camera lock' },
    ];
  }

  /**
   * Set the active hotkey scope
   */
  setScope(scope: string) {
    hotkeys.setScope(scope);
  }

  /**
   * Get the current active scope
   */
  getScope(): string {
    return hotkeys.getScope();
  }
}

// Export singleton instance
export const hotkeyManager = HotkeyManager.getInstance();

// Export convenience functions
export const initializeHotkeys = () => hotkeyManager.initialize();
export const cleanupHotkeys = () => hotkeyManager.cleanup();
export const getHotkeyList = () => hotkeyManager.getHotkeyList();
export const setHotkeyScope = (scope: string) => hotkeyManager.setScope(scope); 