/**
 * Feature flags. Reads from Vite env variables at build time.
 * Set VITE_ENABLE_TRASH_HOTSPOTS_LAYER=true in .env to enable the layer.
 */
export const ENABLE_TRASH_HOTSPOTS_LAYER: boolean =
  import.meta.env.VITE_ENABLE_TRASH_HOTSPOTS_LAYER === 'true';
