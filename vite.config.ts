//@ts-nocheck
declare global {
  const Salla: any;
}
import { resolve } from 'path';
import { defineConfig } from 'vite';
import {
sallaBuildPlugin,
sallaDemoPlugin,
sallaTransformPlugin,
} from '@salla.sa/twilight-bundles/vite-plugins';

/**
 * Duplicate `src/shared/*` into every component at build time.
 *
 * sallaBuildPlugin runs ONE multi-entry Rollup build, and Rollup splits any
 * module imported by 2+ entries into a shared `dist/<name>-<hash>.js` chunk.
 * That breaks the Salla contract of one self-contained JS file per component.
 * This plugin tags each shared-module import with the importing component
 * (`?gk=<name>`), so Rollup sees N distinct modules and inlines a copy into
 * each entry — single source in `src/shared/`, zero coupling in `dist/`.
 */
function duplicateSharedPerComponentPlugin() {
  const sharedDir = resolve(process.cwd(), 'src/shared');
  return {
    name: 'gk-duplicate-shared',
    enforce: 'pre',
    apply: 'build',
    async resolveId(source: string, importer: string | undefined) {
      if (!importer) return null;
      const comp =
        importer.match(/src\/components\/([^/]+)\//)?.[1] ??
        importer.match(/[?&]gk=([^&]+)/)?.[1];
      if (!comp) return null;
      const resolved = await this.resolve(source, importer.split('?')[0], {
        skipSelf: true,
      });
      if (!resolved || resolved.external) return null;
      if (!resolved.id.startsWith(sharedDir)) return null;
      return `${resolved.id}?gk=${comp}`;
    },
  };
}

/**
 * Repair the demo plugin's malformed Windows file-system URLs.
 *
 * @salla.sa/twilight-bundles@0.1.62 emits `/@fsC:\\...`, while Vite's
 * Windows URL format is `/@fs/C:\\...`. Applying the correction as an HTML
 * transform keeps it local to the generated demo pages and survives installs.
 */
function fixSallaDemoWindowsFsUrlsPlugin() {
  return {
    name: 'fix-salla-demo-windows-fs-urls',
    enforce: 'post',
    transformIndexHtml(html: string) {
      if (process.platform !== 'win32') return html;
      return html.replace(/\/@fs(?=[A-Za-z]:[\\/])/g, '/@fs/');
    },
  };
}

export default defineConfig({
/**
 * `public/assets/` is the bundle's media folder, and the path matters.
 *
 * Vite serves publicDir at the dev-server root and copies its contents into
 * outDir on build, so `public/assets/x.webp` is `/assets/x.webp` in dev and
 * `dist/assets/x.webp` after a build. That is exactly what `tw-preview` wants:
 * it walks `dist/assets/` for media, uploads each file, and the preview Worker
 * rewrites root-absolute `/assets/…` references in the bundle to the uploaded
 * URLs. One path spelling therefore works in dev, in the form builder, and in a
 * published preview.
 *
 * So do NOT set `build.copyPublicDir: false` — it looks tidy (dist/ ends up
 * holding only the per-component JS files Salla requires) but it silently
 * strips every asset out of the preview payload. `tw-preview` reads
 * `dist/*.js` with an isFile() filter, so a `dist/assets/` directory sitting
 * alongside them is expected, not a contract violation.
 */
plugins: [
  sallaTransformPlugin(),
  sallaBuildPlugin(),
  duplicateSharedPerComponentPlugin(),
  sallaDemoPlugin({
    // Uncomment to preview only specific components
    // components: ['hero', 'collection', 'interactive-product', 'testimonials']
  }),
  fixSallaDemoWindowsFsUrlsPlugin(),
],
});
