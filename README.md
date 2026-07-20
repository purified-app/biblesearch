# biblesearch

Angular Bible reader and offline full-text search application. Bible translations run entirely in the browser using SQLite WASM and are cached for offline use.

## Development

```sh
cd client
bun install
bun run build:databases
bun run start
```

## GitHub Pages

Push to `main`. The [GitHub Pages workflow](.github/workflows/deploy-pages.yml) regenerates the translation packs, builds the application for `/biblesearch/`, and deploys it.

Enable **GitHub Actions** as the Pages source in the repository settings once.

To verify the production artifact locally:

```sh
cd client
bun run build:pages
```
