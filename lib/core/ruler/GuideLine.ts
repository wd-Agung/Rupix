import { Line, type FabricObjectProps, type TEvent } from 'fabric';
import type { CanvasRuler } from './CanvasRuler';

type GuideLineOptions = Partial<FabricObjectProps> & {
  axis: 'horizontal' | 'vertical';
};

// Augment fabric.Canvas interface to include the ruler
declare module 'fabric' {
  interface Canvas {
    ruler?: CanvasRuler
  }
  interface CanvasEvents {
    'guideline:moving': { target: GuideLine };
  }
}

export class GuideLine extends Line {
  public axis: 'horizontal' | 'vertical';

  constructor(options: GuideLineOptions) {
    const longVal = 999999;
    let points: [number, number, number, number];

    if (options.axis === 'horizontal') {
      points = [-longVal, 0, longVal, 0];
    } else {
      // vertical
      points = [0, -longVal, 0, longVal];
    }

    super(points, {
      ...options,
      stroke: 'rgba(100, 100, 200, 0.5)',
      strokeWidth: 1,
      selectable: false,
      hasControls: false,
      hasBorders: false,
    });

    this.axis = options.axis;

    if (this.axis === 'horizontal') {
      this.lockMovementX = true;
    } else {
      this.lockMovementY = true;
    }

    this.on('moving', () => {
      this.canvas?.fire('guideline:moving', { target: this });
    });

    this.on('mouseup', (e: TEvent) => {
      if (this.canvas?.ruler?.isPointOnRuler(e.e as MouseEvent)) {
        this.canvas?.remove(this);
      }
    });
  }
}
