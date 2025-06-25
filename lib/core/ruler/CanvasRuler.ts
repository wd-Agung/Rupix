import { type Canvas } from 'fabric';
import { GuideLine } from './GuideLine';

export interface CanvasRulerOptions {
  rulerHeight?: number;
  rulerBackgroundColor?: string;
  rulerTextColor?: string;
  borderColor?: string;
  highlightColor?: string;
}

export class CanvasRuler {
  private canvas: Canvas;
  private options: CanvasRulerOptions;
  private tempGuideline: GuideLine | null = null;
  private isDragging = false;

  private readonly DEFAULT_OPTIONS: CanvasRulerOptions = {
    rulerHeight: 20,
    rulerBackgroundColor: '#f0f0f0',
    rulerTextColor: '#000',
    borderColor: '#ccc',
    highlightColor: 'rgba(14, 152, 252, 0.8)',
  };

  constructor(canvas: Canvas, options: CanvasRulerOptions = {}) {
    this.canvas = canvas;
    this.options = { ...this.DEFAULT_OPTIONS, ...options };
    (this.canvas as any).ruler = this;
  }

  public enable() {
    this.canvas.on('after:render', this.render);
    // this.canvas.on('mouse:down', this.handleMouseDown);
    // this.canvas.on('mouse:move', this.handleMouseMove);
    // this.canvas.on('mouse:up', this.handleMouseUp);
  }

  public disable() {
    this.canvas.off('after:render', this.render);
    // this.canvas.off('mouse:down', this.handleMouseDown);
    // this.canvas.off('mouse:move', this.handleMouseMove);
    // this.canvas.off('mouse:up', this.handleMouseUp);
  }

  public isPointOnRuler(p: MouseEvent): 'horizontal' | 'vertical' | null {
    const { rulerHeight } = this.options;
    const { x, y } = this.canvas.getPointer(p);

    if (y >= 0 && y <= (rulerHeight ?? 30) / this.canvas.getZoom()) {
      return 'horizontal';
    }
    if (x >= 0 && x <= (rulerHeight ?? 30) / this.canvas.getZoom()) {
      return 'vertical';
    }
    return null;
  }

  private render = () => {
    const ctx = this.canvas.getSelectionContext();
    if (!ctx) return;

    ctx.save();
    this.drawRuler('horizontal');
    this.drawRuler('vertical');
    this.drawCorner();
    ctx.restore();
  };

  private drawRuler(orientation: 'horizontal' | 'vertical') {
    const ctx = this.canvas.getSelectionContext();
    if (!ctx) return;

    const { rulerHeight, rulerBackgroundColor, borderColor, rulerTextColor } = this.options;
    const zoom = this.canvas.getZoom();
    const vpt = this.canvas.viewportTransform;
    if (!vpt) return;

    const width = this.canvas.getWidth();
    const height = this.canvas.getHeight();
    const rulerSize = rulerHeight ?? 30;

    ctx.fillStyle = rulerBackgroundColor!;
    ctx.strokeStyle = borderColor!;
    ctx.lineWidth = 0.5;

    // Background
    if (orientation === 'horizontal') {
      ctx.fillRect(0, 0, width, rulerSize);
      ctx.strokeRect(0, 0, width, rulerSize);
    } else {
      ctx.fillRect(0, 0, rulerSize, height);
      ctx.strokeRect(0, 0, rulerSize, height);
    }

    // Ticks and numbers
    ctx.fillStyle = rulerTextColor!;
    ctx.font = '10px Arial';

    const gap = this.calculateTickGap(zoom);
    const smallGap = gap / 5; // For more precise minor ticks
    const start = orientation === 'horizontal' ? -vpt[4] / zoom : -vpt[5] / zoom;

    const canvasWidth = this.canvas.getWidth() / zoom;
    const canvasHeight = this.canvas.getHeight() / zoom;

    // Calculate range to include negative values
    const range = orientation === 'horizontal' ? canvasWidth + Math.abs(start) : canvasHeight + Math.abs(start);
    const startValue = Math.floor(start / gap) * gap;

    // Draw minor ticks (more precision)
    ctx.strokeStyle = rulerTextColor!;
    ctx.lineWidth = 0.5;
    for (let i = Math.floor(start / smallGap) * smallGap; i <= startValue + range; i += smallGap) {
      const tickPos = (i - start) * zoom;

      if (orientation === 'horizontal') {
        ctx.beginPath();
        ctx.moveTo(tickPos, rulerSize);
        ctx.lineTo(tickPos, rulerSize - 3);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(rulerSize, tickPos);
        ctx.lineTo(rulerSize - 3, tickPos);
        ctx.stroke();
      }
    }

    // Draw major ticks and labels
    ctx.lineWidth = 1;
    for (let i = startValue; i <= startValue + range; i += gap) {
      const tickPos = (i - start) * zoom;

      if (orientation === 'horizontal') {
        ctx.beginPath();
        ctx.moveTo(tickPos, rulerSize);
        ctx.lineTo(tickPos, rulerSize - 8);
        ctx.stroke();
        if (i % (gap * 2) === 0) {
          ctx.fillText(Math.round(i).toString(), tickPos + 2, rulerSize - 10);
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(rulerSize, tickPos);
        ctx.lineTo(rulerSize - 8, tickPos);
        ctx.stroke();
        if (i % (gap * 2) === 0) {
          ctx.save();
          ctx.translate(rulerSize / 2, tickPos - 4);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = 'center';
          ctx.fillText(Math.round(i).toString(), 0, 0);
          ctx.restore();
        }
      }
    }
    this.drawHighlight(orientation);
  }

  private drawCorner() {
    const ctx = this.canvas.getSelectionContext();
    const { rulerHeight, rulerBackgroundColor, borderColor } = this.options;
    if (!ctx || !rulerHeight) return;

    ctx.fillStyle = rulerBackgroundColor!;
    ctx.fillRect(0, 0, rulerHeight, rulerHeight);
    ctx.strokeStyle = borderColor!;
    ctx.strokeRect(0, 0, rulerHeight, rulerHeight);
  }

  private drawHighlight(orientation: 'horizontal' | 'vertical') {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject || !activeObject.aCoords) return;

    const ctx = this.canvas.getSelectionContext();
    if (!ctx) return;
    const { rulerHeight, highlightColor, rulerTextColor } = this.options;
    if (!rulerHeight || !highlightColor) return;

    const zoom = this.canvas.getZoom();
    const vpt = this.canvas.viewportTransform;
    if (!vpt) return;

    const { tl, tr, bl } = activeObject.aCoords;

    // Transform object coordinates to screen coordinates
    const screenTL = {
      x: (tl.x * zoom) + vpt[4],
      y: (tl.y * zoom) + vpt[5]
    };
    const screenTR = {
      x: (tr.x * zoom) + vpt[4],
      y: (tr.y * zoom) + vpt[5]
    };
    const screenBL = {
      x: (bl.x * zoom) + vpt[4],
      y: (bl.y * zoom) + vpt[5]
    };

    // Draw highlight rectangle
    ctx.fillStyle = highlightColor!;
    if (orientation === 'horizontal') {
      ctx.fillRect(screenTL.x, 0, screenTR.x - screenTL.x, rulerHeight);
    } else {
      ctx.fillRect(0, screenTL.y, rulerHeight, screenBL.y - screenTL.y);
    }

    // Draw coordinate numbers at start and end of highlight
    ctx.fillStyle = rulerTextColor!;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.options.highlightColor || '#000';

    if (orientation === 'horizontal') {
      // Convert screen coordinates back to canvas coordinates
      const startX = Math.round((screenTL.x - vpt[4]) / zoom);
      const endX = Math.round((screenTR.x - vpt[4]) / zoom);

      // Draw numbers at start and end
      ctx.fillText(startX.toString(), screenTL.x - 15, 12);
      ctx.fillText(endX.toString(), screenTR.x + 15, 12);
    } else {
      // Convert screen coordinates back to canvas coordinates
      const startY = Math.round((screenTL.y - vpt[5]) / zoom);
      const endY = Math.round((screenBL.y - vpt[5]) / zoom);

      // Draw numbers at start and end (rotated for vertical ruler)
      ctx.save();
      ctx.translate(10, screenTL.y - 15);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(startY.toString(), 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(10, screenBL.y + 15);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(endY.toString(), 0, 0);
      ctx.restore();
    }
  }

  private calculateTickGap(zoom: number): number {
    if (zoom > 5) return 20;
    if (zoom > 2) return 50;
    if (zoom > 0.5) return 100;
    return 200;
  }

  // private handleMouseDown = (opt: TEvent) => {
  //   const e = opt.e as MouseEvent;
  //   const rulerClicked = this.isPointOnRuler(e);

  //   if (rulerClicked) {
  //     this.isDragging = true;
  //     const pointer = this.canvas.getPointer(e);
  //     this.tempGuideline = new GuideLine({
  //       axis: rulerClicked,
  //     });
  //     this.tempGuideline.set({
  //       left: pointer.x,
  //       top: pointer.y,
  //     });
  //     this.canvas.add(this.tempGuideline);
  //   }
  // };

  // private handleMouseMove = (opt: TEvent) => {
  //   if (this.isDragging && this.tempGuideline) {
  //     const pointer = this.canvas.getPointer(opt.e);
  //     if (this.tempGuideline.axis === 'horizontal') {
  //       this.tempGuideline.set({ top: pointer.y });
  //     } else {
  //       this.tempGuideline.set({ left: pointer.x });
  //     }
  //     this.canvas.renderAll();
  //   }
  // };

  // private handleMouseUp = () => {
  //   if (this.isDragging && this.tempGuideline) {
  //     this.tempGuideline.setCoords();
  //     this.isDragging = false;
  //     this.tempGuideline = null;
  //   }
  // };
} 