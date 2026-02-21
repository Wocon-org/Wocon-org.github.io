# Plugin Development Guide

## 1. Plugin System Overview

The Wocon plugin system allows developers to extend application functionality, such as adding new map layers, tools, or integrating third-party services. Plugins can interact with the Wocon core system through a unified interface, enabling seamless functionality extensions.

### Core Features
- **Modular Design**: Plugins are developed and deployed as independent modules
- **Hot Plug**: Plugins can be enabled/disabled at runtime
- **Unified Interface**: All plugins follow the same development specifications
- **Resource Management**: Plugins can access and manage application resources

## 2. Plugin Architecture

### 2.1 Plugin Directory Structure

Recommended plugin directory structure:

```
src/plugins/
├── my-plugin/
│   ├── index.ts              # Plugin entry file
│   ├── plugin.ts             # Plugin definition and logic
│   ├── components/           # Plugin components
│   │   └── MyPluginComponent.vue
│   ├── assets/               # Plugin assets
│   └── styles/               # Plugin styles
└── index.ts                  # Plugin registration file
```

### 2.2 Plugin Interface

Each plugin must implement the following interface:

```typescript
interface WoconPlugin {
  id: string;                  // Plugin unique identifier
  name: string;                // Plugin name
  description: string;         // Plugin description
  version: string;             // Plugin version
  icon: string;                // Plugin icon
  enabled: boolean;            // Whether the plugin is enabled
  
  // Lifecycle methods
  init(): Promise<void>;       // Plugin initialization
  activate(): Promise<void>;   // Plugin activation
  deactivate(): Promise<void>; // Plugin deactivation
  destroy(): Promise<void>;    // Plugin destruction
  
  // Optional methods
  getSettings?(): Record<string, any>;  // Get plugin settings
  updateSettings?(settings: Record<string, any>): Promise<void>;  // Update plugin settings
}
```

## 3. Development Steps

### 3.1 Create Plugin Directory

First, create your plugin folder under the `src/plugins/` directory:

```bash
mkdir -p src/plugins/3dmap/components
```

### 3.2 Write Plugin Definition

Create `src/plugins/3dmap/plugin.ts` file:

```typescript
import type { WoconPlugin } from '@/types/plugin';
import ThreeJSMapComponent from './components/ThreeJSMapComponent.vue';

export class ThreeJSMapPlugin implements WoconPlugin {
  id = '3dmap';
  name = '3D Map';
  description = 'Adds 3D map visualization using Three.js';
  version = '1.0.0';
  icon = '🌐';
  enabled = false;
  
  private mapInstance: any = null;
  
  async init(): Promise<void> {
    console.log('Initializing 3D Map Plugin');
    // Initialize plugin resources
  }
  
  async activate(): Promise<void> {
    console.log('Activating 3D Map Plugin');
    this.enabled = true;
    // Activate plugin functionality
  }
  
  async deactivate(): Promise<void> {
    console.log('Deactivating 3D Map Plugin');
    this.enabled = false;
    // Clean up plugin resources
  }
  
  async destroy(): Promise<void> {
    console.log('Destroying 3D Map Plugin');
    // Completely destroy plugin
  }
  
  getSettings(): Record<string, any> {
    return {
      quality: 'medium',
      showLabels: true,
      autoRotate: false
    };
  }
  
  async updateSettings(settings: Record<string, any>): Promise<void> {
    console.log('Updating 3D Map settings:', settings);
    // Update plugin settings
  }
}

export default ThreeJSMapPlugin;
```

### 3.3 Create Plugin Entry

Create `src/plugins/3dmap/index.ts` file:

```typescript
import ThreeJSMapPlugin from './plugin';

export default ThreeJSMapPlugin;
export { ThreeJSMapPlugin };
```

### 3.4 Create Plugin Component

Create `src/plugins/3dmap/components/ThreeJSMapComponent.vue` file:

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({
      quality: 'medium',
      showLabels: true,
      autoRotate: false
    })
  }
});

const emit = defineEmits(['ready', 'error']);

const containerRef = ref<HTMLElement | null>(null);
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let animationId: number | null = null;

const initThreeJS = () => {
  if (!containerRef.value) return;
  
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  
  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  containerRef.value.appendChild(renderer.domElement);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Add Earth model
  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const material = new THREE.MeshPhongMaterial({ 
    color: 0x3366ff,
    transparent: true,
    opacity: 0.8
  });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  
  // Start animation
  animate();
  
  emit('ready');
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  
  if (!scene || !camera || !renderer) return;
  
  // Rotate Earth
  scene.rotation.y += 0.001;
  
  renderer.render(scene, camera);
};

const handleResize = () => {
  if (!containerRef.value || !camera || !renderer) return;
  
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
};

onMounted(() => {
  try {
    initThreeJS();
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('Error initializing ThreeJS map:', error);
    emit('error', error);
  }
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  if (renderer && containerRef.value) {
    containerRef.value.removeChild(renderer.domElement);
  }
  
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="threejs-map-container" ref="containerRef">
    <!-- Three.js rendering will happen here -->
  </div>
</template>

<style scoped>
.threejs-map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
</style>
```

### 3.5 Register Plugin

Create or update `src/plugins/index.ts` file:

```typescript
import type { WoconPlugin } from '@/types/plugin';
import ThreeJSMapPlugin from './3dmap';

// Plugin registry
const plugins: (new () => WoconPlugin)[] = [
  ThreeJSMapPlugin
];

export const registerPlugins = (): WoconPlugin[] => {
  return plugins.map(PluginClass => new PluginClass());
};

export default registerPlugins;
```

### 3.6 Create Plugin Type Definitions

Create `src/types/plugin.ts` file:

```typescript
export interface WoconPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  enabled: boolean;
  
  init(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  destroy(): Promise<void>;
  
  getSettings?(): Record<string, any>;
  updateSettings?(settings: Record<string, any>): Promise<void>;
}

export interface PluginManager {
  registerPlugin(plugin: WoconPlugin): void;
  unregisterPlugin(pluginId: string): void;
  getPlugin(pluginId: string): WoconPlugin | null;
  getAllPlugins(): WoconPlugin[];
  enablePlugin(pluginId: string): Promise<void>;
  disablePlugin(pluginId: string): Promise<void>;
}
```

## 4. Plugin Manager

### 4.1 Create Plugin Manager

Create `src/plugins/manager.ts` file:

```typescript
import type { WoconPlugin, PluginManager } from '@/types/plugin';

export class DefaultPluginManager implements PluginManager {
  private plugins: Map<string, WoconPlugin> = new Map();
  
  registerPlugin(plugin: WoconPlugin): void {
    this.plugins.set(plugin.id, plugin);
    plugin.init();
  }
  
  unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.destroy();
      this.plugins.delete(pluginId);
    }
  }
  
  getPlugin(pluginId: string): WoconPlugin | null {
    return this.plugins.get(pluginId) || null;
  }
  
  getAllPlugins(): WoconPlugin[] {
    return Array.from(this.plugins.values());
  }
  
  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      await plugin.activate();
    }
  }
  
  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      await plugin.deactivate();
    }
  }
}

export default new DefaultPluginManager();
```

### 4.2 Integrate Plugin Manager

Integrate plugin manager in `src/main.ts`:

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import pluginManager, { registerPlugins } from './plugins';

const app = createApp(App);

// Register all plugins
const plugins = registerPlugins();
plugins.forEach(plugin => {
  pluginManager.registerPlugin(plugin);
});

// Provide plugin manager globally
app.provide('pluginManager', pluginManager);

app.mount('#app');
```

## 5. Example: 3D Map Plugin

### 5.1 Install Dependencies

```bash
npm install three @types/three
```

### 5.2 Complete 3D Map Plugin Implementation

Create a complete 3D map plugin following the steps above, including:
- Plugin definition and lifecycle management
- Three.js Earth visualization
- Plugin settings and configuration
- Integration with Wocon core system

### 5.3 Using the Plugin

Using the plugin in Wocon application:

```vue
<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { PluginManager } from '@/types/plugin';
import ThreeJSMapComponent from '@/plugins/3dmap/components/ThreeJSMapComponent.vue';

const pluginManager = inject<PluginManager>('pluginManager');
const threeDMapPlugin = ref(pluginManager?.getPlugin('3dmap'));
const pluginSettings = ref({});
const isReady = ref(false);

onMounted(async () => {
  if (threeDMapPlugin.value) {
    // Enable plugin
    await pluginManager?.enablePlugin('3dmap');
    // Get plugin settings
    pluginSettings.value = threeDMapPlugin.value.getSettings?.() || {};
    isReady.value = true;
  }
});

const handleSettingsChange = async (newSettings: any) => {
  if (threeDMapPlugin.value) {
    await threeDMapPlugin.value.updateSettings?.(newSettings);
    pluginSettings.value = newSettings;
  }
};
</script>

<template>
  <div class="plugin-demo">
    <h2>3D Map Plugin Demo</h2>
    
    <div v-if="isReady" class="map-container">
      <ThreeJSMapComponent :settings="pluginSettings" />
    </div>
    
    <div v-else class="loading">
      Loading 3D Map Plugin...
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #888;
}
</style>
```

## 6. Best Practices

### 6.1 Performance Optimization
- **Lazy Loading**: Plugin resources and components should be loaded on demand
- **Memory Management**: Clean up resources in `deactivate` and `destroy` methods
- **Rendering Optimization**: Use appropriate rendering strategies for visualization plugins

### 6.2 Security
- **Permission Control**: Plugins should clearly declare required permissions
- **Input Validation**: Validate all user inputs
- **Resource Limitations**: Set reasonable resource usage limits

### 6.3 Compatibility
- **Version Management**: Use semantic versioning
- **Backward Compatibility**: Try to maintain API backward compatibility
- **Environment Detection**: Detect runtime environment and adapt

### 6.4 Development Tools
- **Debug Mode**: Provide detailed debug information
- **Logging**: Use a unified logging system
- **Test Coverage**: Write unit tests and integration tests

## 7. Plugin Publishing

### 7.1 Package Plugin

Package the plugin using Vite:

```bash
npm run build
```

### 7.2 Publish Plugin

1. **Local Plugin**: Directly copy to `src/plugins/` directory
2. **NPM Package**: Publish as an NPM package, then install via `npm install`
3. **Plugin Market**: (Future feature) Install via Wocon plugin market

### 7.3 Plugin Manifest

Create a `plugin.json` file with plugin metadata:

```json
{
  "id": "3dmap",
  "name": "3D Map",
  "description": "Adds 3D map visualization using Three.js",
  "version": "1.0.0",
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "three": "^0.150.0"
  },
  "compatibility": {
    "wocon": ">=1.0.0"
  }
}
```

## 8. Common Issues

### 8.1 Plugin Loading Failure
- Check if dependencies are correctly installed
- Check if plugin ID is unique
- Check if plugin interface is fully implemented

### 8.2 Performance Issues
- Optimize rendering loop
- Reduce DOM operations
- Use Web Workers for heavy calculations

### 8.3 Compatibility Issues
- Check Three.js version compatibility
- Ensure ES6+ syntax is used
- Test in different browser environments

## 9. Resources and References

### 9.1 Related Documentation
- [Three.js Documentation](https://threejs.org/docs/)
- [Vue 3 Documentation](https://v3.vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### 9.2 Example Plugins
- **3D Map**: Three.js-based 3D Earth visualization
- **Weather Widget**: Display weather information on map
- **Photo Gallery**: Display photo locations on map
- **Route Planner**: 3D route planning tool

### 9.3 Development Tools
- **Three.js Editor**: Online Three.js scene editor
- **Vue DevTools**: Vue development debugging tool
- **Vite**: Fast frontend build tool

## 10. Conclusion

The Wocon plugin system provides a flexible, powerful extension mechanism that allows you to easily add new features and integrate third-party services. By following the best practices in this guide, you can develop high-quality, high-performance plugins that contribute to the Wocon ecosystem.

If you have any questions or suggestions, please feel free to create an issue or pull request in the GitHub repository.

Happy coding!
