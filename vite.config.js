import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: './',
    build: {
      outDir: 'docs',
    },
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    // Server configuration for development
    server: {
      host: true,
      port: 5173, // Default Vite port
      // Use HTTP for development to avoid SSL issues
      https: false,
    },
    // Preview configuration
    preview: {
      port: 4173,
      host: true,
    }
  };
});
