# Arkan Travel

Arkan Travel is a bilingual travel website and admin dashboard for tours, flights, hotels, visa support, testimonials, bookings, subscribers and customer questions.

## GitHub Pages test domain

This repository is configured to publish the public test page with GitHub Actions:

https://yomesolutions-cmd.github.io/arkan/

In GitHub, enable:

- Settings -> Pages
- Source: GitHub Actions

The workflow builds with `VITE_BASE_PATH=/arkan/`, prerenders the public homepage, and uploads `.output/public`.

## Domains

Use one public website domain and one separate admin domain.

- Public website: configure your normal public domain.
- Admin panel: configure a separate host, for example `admin.yourdomain.com`.
- Set `VITE_ADMIN_HOSTS=admin.yourdomain.com`.
- If the admin panel needs to link back to the public website, set `VITE_PUBLIC_SITE_URL=https://yourdomain.com`.
- For production custom domains, use `VITE_BASE_PATH=/`.

GitHub Pages is useful for the public test URL. The full app includes server functions and admin workflows, so production hosting should use the app's server-compatible hosting target.

## Development

You need Node.js and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Build

```sh
npm run build
```

For GitHub Pages static output:

```sh
npm run build:github-pages
```
