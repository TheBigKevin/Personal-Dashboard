# Orbit — Personal Dashboard

A responsive dark-glass start page. It works immediately in local mode and can optionally sync one shared dashboard across devices with Supabase.

## Run it locally
1. Unzip the folder.
2. Open `index.html` in a modern browser.
3. Add/edit shortcuts, create categories, search, and use Edit mode to drag shortcuts.
4. Your changes save in that browser's local storage.

## Publish it free with GitHub Pages
1. Create a GitHub repository (for example `orbit-dashboard`).
2. Upload `index.html`, `style.css`, `app.js`, and `supabase.sql` (README optional).
3. In the repository, open **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
5. GitHub will provide a public URL. Open that URL on each device.

## Optional cross-device sync with Supabase
Without this, each browser/device has its own local copy. To share one configuration:
1. Create a Supabase project.
2. Open **SQL Editor**, paste and run `supabase.sql`.
3. In Supabase Project Settings → API, copy the Project URL and the public anon/publishable key.
4. Open your dashboard → Settings & backup → Cloud sync, paste both values, and select **Save sync settings**.

### Important privacy note
This setup intentionally has no login. The SQL policy permits anyone who can reach the public dashboard to read and modify the shared dashboard record. Do not store private bookmarks, credentials, personal notes, or sensitive information. The anon/publishable key is designed for browser use; never put a Supabase service-role key in this site.

## Included
- Responsive desktop/tablet/mobile layout
- Dark glass UI and optional background image/accent color
- Categories, custom shortcuts, emoji icons and descriptions
- Search (Ctrl/Cmd + K)
- Drag-to-reorder in Edit mode
- Quick notes saved locally on each device
- JSON export/import
- Optional Supabase shared configuration sync

## Notes
- The clock uses the device's local time.
- Quick notes remain local to the device and are not synced to Supabase.
- External fonts and the Supabase JS library are loaded from CDNs.
