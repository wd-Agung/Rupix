import type {
  ObjectEvents,
  RectProps,
  SerializedRectProps,
  TOptions,
} from 'fabric';
import * as fabric from 'fabric';

interface IBaseLayerProps {
  id?: string;
  name?: string;
  layerType?: string;
}

export interface SerializedBaseLayerProps
  extends SerializedRectProps,
  IBaseLayerProps { }

export interface BaseLayerProps extends RectProps, IBaseLayerProps { }

export class BaseLayer<
  Props extends TOptions<BaseLayerProps> = Partial<BaseLayerProps>,
  SProps extends SerializedBaseLayerProps = SerializedBaseLayerProps,
  EventSpec extends ObjectEvents = ObjectEvents,
> extends fabric.Rect<Props, SProps, EventSpec> {
  static type = 'BaseLayer';
}

fabric.classRegistry.setClass(BaseLayer);

// @ts-ignore
fabric.BaseLayer = BaseLayer;