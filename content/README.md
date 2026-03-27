# Content Editing Guide

This folder is for non-technical content updates.

## Files

- `site.en.json`: all English interface text.
- `site.fr.json`: all French interface text.
- `gallery.json`: gallery images, categories, captions, and alt text.
- `groups.json`: details for each educational group page.
- `parents-pages.json`: content for Admissions, Educational Curriculum, and Parents FAQ pages.

## Safe edits

- Change text values only.
- Keep keys exactly as they are.
- Keep valid JSON formatting:
  - Use double quotes around keys and values.
  - Keep commas between entries.

## Gallery categories

Allowed category values in `gallery.json`:

- `facilities`
- `fun-times`

## Group pages

Each group has its own page under `groups/`.

To edit group details, update only `groups.json`:

- `name` (EN/FR)
- `age` (EN/FR)
- `description` (EN/FR)
- `image`

## Add a gallery image

Add a new object to the `items` array with this shape:

```json
{
  "category": "facilities",
  "src": "https://example.com/image.jpg",
  "alt": {
    "en": "English alt text",
    "fr": "Texte alternatif francais"
  },
  "caption": {
    "en": "English caption",
    "fr": "Legende francaise"
  }
}
```

## Developer-owned files

These files control layout and behavior and should be edited by technical users:

- `index.html`
- `styles.css`
- `script.js`
