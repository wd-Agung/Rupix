import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    console.log('messages', messages)

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      toolCallStreaming: true,
      messages,
      maxSteps: 10,
      system: `
        You are a helpful design assistant for a design tool application.

        GUIDELINES:
        - When moving objects, You SHOULD make sure the object is still visible on the canvas within the canvas dimensions and clipping range.
        - You MUST use the tools provided to you to get information about the canvas and objects on the canvas.
      `,
      tools: {
        getCanvasDimensions: tool({
          description: 'Get the dimensions of the canvas',
          parameters: z.object({}),
        }),
        getActiveObjectInfo: tool({
          description: 'Get the active object on the canvas',
          parameters: z.object({}),
        }),
        getAllObjectInfos: tool({
          description: 'Get all objects on the canvas',
          parameters: z.object({}),
        }),
        createRectangle: tool({
          description: 'Create a new rectangle on the canvas',
          parameters: z.object({
            x: z.number().describe('X position of the rectangle'),
            y: z.number().describe('Y position of the rectangle'),
            fill: z.string().describe('Fill color (hex code)').default('#3b82f6'),
            stroke: z.string().describe('Stroke color (hex code)').default('#1e40af'),
            strokeWidth: z.number().describe('Stroke width').default(2),
            opacity: z.number().describe('Opacity (0-1)').default(1)
          }),
        }),
        createCircle: tool({
          description: 'Create a new circle on the canvas',
          parameters: z.object({
            x: z.number().describe('X position of the circle'),
            y: z.number().describe('Y position of the circle'),
            fill: z.string().describe('Fill color (hex code)').default('#3b82f6'),
            stroke: z.string().describe('Stroke color (hex code)').default('#1e40af'),
            strokeWidth: z.number().describe('Stroke width').default(2),
            opacity: z.number().describe('Opacity (0-1)').default(1)
          }),
        }),
        createText: tool({
          description: 'Create a new text element on the canvas',
          parameters: z.object({
            x: z.number().describe('X position of the text'),
            y: z.number().describe('Y position of the text'),
            text: z.string().describe('Text content'),
            fontSize: z.number().describe('Font size').default(20),
            fontFamily: z.string().describe('Font family').default('Arial'),
            fill: z.string().describe('Text color (hex code)').default('#3b82f6'),
            opacity: z.number().describe('Opacity (0-1)').default(1)
          }),
        }),
        updateObjectProperties: tool({
          description: 'Update properties of the currently selected object',
          parameters: z.object({
            fill: z.string().describe('Fill color (hex code)').optional(),
            stroke: z.string().describe('Stroke color (hex code)').optional(),
            strokeWidth: z.number().describe('Stroke width').optional(),
            opacity: z.number().describe('Opacity (0-1)').optional(),
            left: z.number().describe('X position').optional(),
            top: z.number().describe('Y position').optional(),
            scaleX: z.number().describe('Horizontal scale').optional(),
            scaleY: z.number().describe('Vertical scale').optional(),
            angle: z.number().describe('Rotation angle in degrees').optional(),
            fontSize: z.number().describe('Font size (for text objects)').optional(),
            fontFamily: z.string().describe('Font family (for text objects)').optional()
          }),
        }),
        moveObject: tool({
          description: 'Move the currently selected object to a new position',
          parameters: z.object({
            x: z.number().describe('New X position'),
            y: z.number().describe('New Y position'),
            relative: z.boolean().describe('Whether to move relative to current position').default(false)
          }),
        }),
        scaleObject: tool({
          description: 'Scale the currently selected object',
          parameters: z.object({
            scaleX: z.number().describe('Horizontal scale factor').default(1),
            scaleY: z.number().describe('Vertical scale factor').default(1),
            uniform: z.boolean().describe('Whether to scale uniformly').default(true)
          }),
        }),
        rotateObject: tool({
          description: 'Rotate the currently selected object',
          parameters: z.object({
            angle: z.number().describe('Rotation angle in degrees'),
            relative: z.boolean().describe('Whether to rotate relative to current angle').default(false)
          }),
        }),
        changeCanvasBackground: tool({
          description: 'Change the background color of the canvas',
          parameters: z.object({
            color: z.string().describe('Background color (hex code)')
          }),
        }),
        selectObject: tool({
          description: 'Select an object by its layer name or position',
          parameters: z.object({
            layerName: z.string().describe('Name of the layer to select').optional(),
            index: z.number().describe('Index of the object to select (0-based)').optional()
          }),
        }),
        deleteSelectedObject: tool({
          description: 'Delete the currently selected object',
          parameters: z.object({}),
        }),
        groupObjects: tool({
          description: 'Group the selected objects',
          parameters: z.object({}),
        }),
        ungroupObjects: tool({
          description: 'Ungroup the selected objects',
          parameters: z.object({}),
        }),
        getCanvasContent: tool({
          description: 'Get the content of the canvas',
          parameters: z.object({}),
        }),
        bringToFront: tool({
          description: 'Bring the selected object to the front',
          parameters: z.object({}),
        }),
        sendToBack: tool({
          description: 'Send the selected object to the back',
          parameters: z.object({}),
        }),
        alignObjects: tool({
          description: 'Align the selected objects',
          parameters: z.object({
            alignment: z.enum(['left', 'center-h', 'right', 'top', 'center-v', 'bottom']),
          }),
        }),
        distributeObjects: tool({
          description: 'Distribute the selected objects',
          parameters: z.object({
            direction: z.enum(['horizontal', 'vertical']),
          }),
        }),
        zoomIn: tool({
          description: 'Zoom in the canvas',
          parameters: z.object({}),
        }),
        zoomOut: tool({
          description: 'Zoom out the canvas',
          parameters: z.object({}),
        }),
        resetZoom: tool({
          description: 'Reset the canvas zoom',
          parameters: z.object({}),
        }),
        pan: tool({
          description: 'Pan the canvas',
          parameters: z.object({
            x: z.number().describe('X amount to pan'),
            y: z.number().describe('Y amount to pan'),
          }),
        }),
        getHistory: tool({
          description: 'Get the undo/redo history',
          parameters: z.object({}),
        }),
      }
    })

    return result.toDataStreamResponse()

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request. Please check your API key and try again.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 