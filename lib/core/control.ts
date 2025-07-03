import * as fabric from 'fabric'

export const controlOptions = {
  transparentCorners: false,
  borderColor: "#0E98FC",
  cornerColor: "#FFF",
  borderScaleFactor: 2,
  cornerStyle: "circle",
  cornerStrokeColor: "#0E98FC",
  borderOpacityWhenMoving: 1,
  snapAngle: 45,
  snapThreshold: 5,
}

// Image cache to store loaded images
const imageCache = new Map<string, HTMLImageElement>()

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Check if image is already cached
    if (imageCache.has(src)) {
      const cachedImg = imageCache.get(src)!
      if (cachedImg.complete && cachedImg.naturalWidth !== 0) {
        resolve(cachedImg)
        return
      }
    }

    const img = document.createElement("img")

    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }

    img.onerror = () => {
      console.warn(`Failed to load control icon: ${src}`)
      reject(new Error(`Failed to load image: ${src}`))
    }

    img.src = src
  })
}

function drawImg(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  img: HTMLImageElement,
  wSize: number,
  hSize: number,
  angle: number | undefined
) {
  if (angle === undefined) return

  // Check if image is actually loaded and ready
  if (!img.complete || img.naturalWidth === 0) {
    return // Don't draw if image isn't ready
  }

  ctx.save()
  ctx.translate(left, top)
  ctx.rotate(fabric.util.degreesToRadians(angle))
  ctx.drawImage(img, -wSize / 2, -hSize / 2, wSize, hSize)
  ctx.restore()
}

function setControlConfig() {
  let img: HTMLImageElement | null = null

  // Load the image asynchronously
  loadImage("/edgecontrol.svg").then(loadedImg => {
    img = loadedImg
  }).catch(err => {
    console.warn("Failed to load edge control icon:", err)
  })

  function renderIconEdge(
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    styleOverride: any,
    fabricObject: fabric.FabricObject
  ) {
    if (img) {
      drawImg(ctx, left, top, img, 25, 25, fabricObject.angle)
    }
  }

  const tlOptions = {
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: renderIconEdge,
  }

  const blOptions = {
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: renderIconEdge,
  }

  const trOptions = {
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: renderIconEdge,
  }

  const brOptions = {
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: renderIconEdge,
  }


  const defaultControls = fabric.controlsUtils.createObjectDefaultControls()
  fabric.InteractiveFabricObject.ownDefaults.controls = {
    ...defaultControls,
    ...rotationControl(),
    ...intervalControl(),
    tl: new fabric.Control(tlOptions),
    bl: new fabric.Control(blOptions),
    tr: new fabric.Control(trOptions),
    br: new fabric.Control(brOptions),
  }
}

function rotationControl() {
  let img: HTMLImageElement | null = null

  // Load the image asynchronously
  loadImage("/rotateicon.svg").then(loadedImg => {
    img = loadedImg
  }).catch(err => {
    console.warn("Failed to load rotation control icon:", err)
  })

  function renderIconRotate(
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    styleOverride: any,
    fabricObject: fabric.FabricObject
  ) {
    if (img) {
      drawImg(ctx, left, top, img, 40, 40, fabricObject.angle)
    }
  }

  const options = {
    x: 0,
    y: -0.5,
    cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
    actionHandler: fabric.controlsUtils.rotationWithSnapping,
    offsetY: -30,
    actionName: "rotate",
    render: renderIconRotate,
  }

  return {
    mtr: new fabric.Control(options),
  }
}

function intervalControl() {
  let verticalImgIcon: HTMLImageElement | null = null
  let horizontalImgIcon: HTMLImageElement | null = null

  // Load images asynchronously
  loadImage("/middlecontrol.svg").then(loadedImg => {
    verticalImgIcon = loadedImg
  }).catch(err => {
    console.warn("Failed to load vertical control icon:", err)
  })

  loadImage("/middlecontrolhoz.svg").then(loadedImg => {
    horizontalImgIcon = loadedImg
  }).catch(err => {
    console.warn("Failed to load horizontal control icon:", err)
  })

  function renderIcon(
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    styleOverride: any,
    fabricObject: fabric.FabricObject
  ) {
    if (verticalImgIcon) {
      drawImg(ctx, left, top, verticalImgIcon, 20, 25, fabricObject.angle)
    }
  }

  function renderIconHoz(
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    styleOverride: any,
    fabricObject: fabric.FabricObject
  ) {
    if (horizontalImgIcon) {
      drawImg(ctx, left, top, horizontalImgIcon, 25, 20, fabricObject.angle)
    }
  }

  const mlOptions = {
    x: -0.5,
    y: 0,
    offsetX: -1,
    cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: renderIcon,
  }

  const mrOptions = {
    x: 0.5,
    y: 0,
    offsetX: 1,
    cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: renderIcon,
  }

  mrOptions.actionHandler = fabric.controlsUtils.changeWidth

  const mbOptions = {
    x: 0,
    y: 0.5,
    offsetY: 1,
    cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: renderIconHoz,
  }

  const mtOptions = {
    x: 0,
    y: -0.5,
    offsetY: -1,
    cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: renderIconHoz,
  }

  return {
    ml: new fabric.Control(mlOptions),
    mr: new fabric.Control(mrOptions),
    mb: new fabric.Control(mbOptions),
    mt: new fabric.Control(mtOptions),
  }
}

export function initControls() {
  setControlConfig()

  fabric.Rect.prototype.set(controlOptions)
  fabric.Circle.prototype.set(controlOptions)
  fabric.FabricObject.prototype.set(controlOptions)
  fabric.Textbox.prototype.set(controlOptions)
}