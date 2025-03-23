# PrometheusOS

A modern, feature-rich desktop operating environment built with Electron and Next.js.

## Overview

PrometheusOS provides an immersive desktop experience with a suite of integrated tools for file management, system monitoring, terminal operations, and more. It combines a sleek interface with practical utilities for everyday computing needs.

## Features

### Earth Visualization
- Interactive 3D globe showing your current location
- Real-time internet connection status display
- Automatic location tracking based on IP data

### System Resource Monitor (SRM)
- Real-time CPU usage tracking
- Memory utilization monitoring
- Network traffic analysis
- Disk I/O monitoring
- System uptime tracking

### Terminal Emulator
- Full-featured terminal with support for common shell operations
- Command history and responsive interface
- Direct access to the underlying system

### File Manager
- Browse local filesystem with directory navigation
- View and edit text files with syntax highlighting
- Preview images and PDF documents
- User-friendly interface with file metadata

### Keyboard Visualizer
- Real-time keyboard activity visualization
- Visual feedback for key presses
- Support for standard keyboard layouts

## Technical Details

PrometheusOS is built with the following technologies:

- **Electron**: Cross-platform desktop application framework
- **Next.js**: React framework for the user interface
- **Three.js**: 3D library for Earth visualization
- **xterm.js**: Terminal emulator implementation
- **systeminformation**: Hardware monitoring utilities
- **Tailwind CSS**: Utility-first CSS framework for styling
- **TypeScript**: Type-safe JavaScript for reliable code

## Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Electron development environment

### Setup
1. Clone the repository
```bash
git clone https://github.com/HangerThem/prometheusos.git
cd prometheusos
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Run in development mode
```bash
npm run dev
# or
yarn dev
```

### Building
To build the application for production:

```bash
npm run build
# or
yarn build
```

## License

Copyright © 2025 HangerThem

## Credits

Created by HangerThem