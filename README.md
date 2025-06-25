# Design Tool - Canva Clone

A modern, web-based design tool built with Next.js, React, FabricJS, and ShadCN UI components. This project provides a comprehensive set of design tools similar to Canva, allowing users to create graphics with shapes, text, images, and various styling options.

## Features

### 🎨 Design Tools
- **Selection Tool**: Select and manipulate objects on the canvas
- **Shape Tools**: Add rectangles, circles, and other shapes
- **Text Tool**: Add and edit text with various fonts and sizes
- **Image Tool**: Upload and add images to your design
- **Pen Tool**: Draw freehand (planned feature)

### 🖼️ Canvas Management
- **Interactive Canvas**: Powered by FabricJS for smooth interactions
- **Layer Management**: Organize design elements in layers
- **Properties Panel**: Adjust colors, stroke, opacity, and more
- **Export Options**: Export designs as PNG, JPG, SVG, or JSON

### 🎛️ User Interface
- **Modern UI**: Built with ShadCN UI components
- **Responsive Design**: Works on various screen sizes
- **Tooltips**: Helpful hints for all tools
- **Keyboard Shortcuts**: Quick access to tools

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Canvas**: FabricJS 6.7
- **UI Components**: ShadCN UI (Radix UI + Tailwind CSS)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **Color Picker**: React Colorful

## Getting Started

### Prerequisites
- Node.js 18 or higher
- pnpm (recommended) or npm

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

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the design tool.

## Testing

The project includes comprehensive tests for all components and functionality:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Test Coverage

- **Store Tests**: Zustand store state management
- **Component Tests**: All UI components (Canvas, Toolbar, Panels)
- **Integration Tests**: Component interactions and workflows

## Project Structure

```
project-a/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── design/           # Design tool components
│   │   ├── Canvas.tsx    # Main canvas component
│   │   ├── Toolbar.tsx   # Tool selection toolbar
│   │   ├── PropertiesPanel.tsx # Object properties
│   │   ├── LayersPanel.tsx     # Layer management
│   │   └── DesignTool.tsx      # Main container
│   └── ui/               # ShadCN UI components
├── lib/                  # Utilities and stores
│   ├── stores/          # Zustand stores
│   └── utils.ts         # Utility functions
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   └── stores/          # Store tests
└── public/              # Static assets
```

## Usage

### Basic Workflow

1. **Select a Tool**: Choose from selection, shapes, text, or image tools in the toolbar
2. **Create Objects**: Click on the canvas to add shapes or text
3. **Modify Properties**: Use the properties panel to change colors, sizes, and styles
4. **Manage Layers**: Organize objects using the layers panel
5. **Export Design**: Save your work in various formats

### Keyboard Shortcuts

- `V` - Selection tool
- `R` - Rectangle tool
- `C` - Circle tool
- `T` - Text tool
- `I` - Image tool
- `P` - Pen tool (planned)

### Canvas Operations

- **Pan**: Hold spacebar and drag
- **Zoom**: Mouse wheel or pinch gesture
- **Select Multiple**: Hold Ctrl/Cmd and click objects
- **Delete**: Select object and press Delete key

## Component Architecture

### State Management

The application uses Zustand for state management with a centralized store (`design-store.ts`) that handles:

- Canvas instance and properties
- Selected tools and drawing state
- Layer management
- Object properties (colors, strokes, fonts)
- Export functionality

### Component Hierarchy

```
DesignTool
├── Toolbar (tool selection and actions)
├── LayersPanel (layer management)
├── Canvas (FabricJS integration)
└── PropertiesPanel (object properties)
```

### Testing Strategy

- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interactions
- **Store Tests**: State management logic
- **Mocking**: FabricJS and browser APIs for testing

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
- [ShadCN UI](https://ui.shadcn.com/) for the beautiful UI components
- [Zustand](https://github.com/pmndrs/zustand) for simple state management
- [Next.js](https://nextjs.org/) for the React framework
