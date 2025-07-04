# Rupix - Agentic Design Tool

A modern, web-based design tool built with Next.js, React, FabricJS, and Shadcn UI components. This project provides a comprehensive set of design tools similar to Canva, allowing users to create graphics with shapes, text, images, and various styling options.

## Features

### 🎨 Design Tools
- **Selection Tool**: Select and manipulate objects on the canvas
- **Shape Tools**: Add rectangles, circles, and other shapes
- **Text Tool**: Add and edit text with various fonts and sizes
- **Image Tool**: Upload and add images to your design

### 🖼️ Canvas Management
- **Interactive Canvas**: Powered by FabricJS for smooth interactions
- **Layer Management**: Organize design elements in layers
- **Properties Panel**: Adjust colors, stroke, opacity, and more
- **Export Options**: Export designs as PNG and JPG

### 🎛️ User Interface
- **Modern UI**: Built with Shadcn UI components
- **Responsive Design**: Works on various screen sizes
- **Tooltips**: Helpful hints for all tools
- **Keyboard Shortcuts**: Quick access to tools

### 🤖 AI Assistant (Work In Progress)
- **Design Assistant**: AI-powered chat interface to help with design tasks
- **Multiple AI Provider**: Powered by Vercel's AI-SDK
- **Design-focused Responses**: Tailored to provide design guidance and suggestions
- **Canvas Tools**: AI can directly manipulate canvas objects through tools:
  - **Create Elements**: Add rectangles, circles, and text
  - **Move & Transform**: Position, scale, and rotate objects
  - **Property Updates**: Change colors, stroke, opacity, and more
  - **Object Management**: Select, delete, and modify existing objects
  - **Canvas Control**: Change background colors and other canvas properties

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Canvas**: FabricJS 6.7
- **AI**: Vercel AI SDK
- **UI Components**: Shadcn UI (Radix UI + Tailwind CSS)
- **State Management**: Zustand
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18 or higher
- pnpm (recommended) or npm
- AI API key (for AI assistant functionality)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-a
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create a .env.local file in the root directory
cp .env.example .env.local

# Add your Google AI API key to .env.local
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```

4. Get your Google AI API key:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the API key to your `.env.local` file

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the design tool.

## Usage

### Basic Workflow

1. **Select a Tool**: Choose from selection, shapes, text, or image tools in the toolbar
2. **Create Objects**: Click on the canvas to add shapes or text
3. **Modify Properties**: Use the properties panel to change colors, sizes, and styles
4. **Manage Layers**: Organize objects using the layers panel
5. **Export Design**: Save your work in various formats

### AI Assistant (Work In Progress)

The AI assistant can directly manipulate your canvas through natural language commands. Here are some example interactions:

**Creating Objects:**
- "Create a blue rectangle at position 100, 150"
- "Add a red circle in the center"
- "Make a text that says 'Hello World' at the top left"

**Modifying Objects:**
- "Move the selected object to the right by 50 pixels"
- "Make the circle bigger by scaling it to 1.5x"
- "Rotate the rectangle 45 degrees"
- "Change the color to green"

**Canvas Management:**
- "Change the background to light gray"
- "Select the first object"
- "Delete the selected object"

The AI will execute these commands directly on your canvas and provide feedback about the actions performed.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Write tests for new functionality
4. Ensure all tests pass: `pnpm test`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FabricJS](http://fabricjs.com/) for the powerful canvas library
- [Shadcn UI](https://ui.Shadcn.com/) for the beautiful UI components
- [Zustand](https://github.com/pmndrs/zustand) for simple state management
- [Next.js](https://nextjs.org/) for the React framework
