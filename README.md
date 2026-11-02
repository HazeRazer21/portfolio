# Irvan Yoga Pratama — portfolio

A static, bilingual portfolio built on the Majd layout: cream paper, heavy Archivo type, a portrait
that morphs on scroll, and nine certificate photos.

No framework and no build step.

## Run

Open `index.html` directly, or serve the folder:

```
python -m http.server 8080
```

Then open <http://localhost:8080/majd-clone/>.

## Files

| File | What it is |
|---|---|
| `index.html` | The page. English is the fallback; every translatable node has a `data-i18n` key. |
| `styles.css` | All styling. Tokens sit at the top in `:root`. |
| `strings.js` | Every user-facing string, once in `en`, once in `id`. |
| `script.js` | Language toggle, menu, portrait morph, quote reveal, star drift, certificate lightbox. |
| `assets/img/irvan.jpg` | The portrait in color, used below 769px. |
| `assets/img/irvan-gray.jpg` | The same portrait in grayscale, used on desktop. |
| `assets/img/certs/` | The nine certificate images. |
| `assets/img/star-left.png`, `star-right.png` | The two holo stars. |
| `assets/CV_Irvan_Yoga_Pratama.pdf` | The downloadable CV. |

## Interactions

- **Portrait morph.** On desktop the portrait starts small and grayscale under the hero. As the bio
  enters, it scales to 1.29, moves into the bio gap, and shifts to color, then scrolls away. Below
  900px the hero portrait stays in the flow.
- **Certificates.** Nine cards, three across, each opening a lightbox with the full certificate and
  its name. Close with the button, the backdrop, or Escape.
- **Language toggle.** `EN / ID` inside the nav pill, persisted in `localStorage` under
  `irvan-lang`.
- **Menu.** The pill button opens a full-screen menu; Escape closes it.
- **Scroll reveals.** Sections and cards fade and lift in once.

## Edit the text

All copy lives in `strings.js`:

```js
window.SITE_STRINGS = {
  en: { "bio.lead": "I’m Irvan, ...", ... },
  id: { "bio.lead": "Saya Irvan, ...", ... },
};
```

Keep every key in both languages, and keep the English in `index.html` in sync with `en`.

## Replace the portrait

Swap both files and keep the names:

- `assets/img/irvan.jpg` (color)
- `assets/img/irvan-gray.jpg` (desktop)

The morph uses the two images stacked, so the grayscale one fades out as the portrait moves into the
bio.

## Certificates

Each card is a `<button class="cert">` with an image and a caption. To add one, copy a card, change
the image path, and add `cred.N.name`, `cred.N.issuer`, and `cred.N.date` to both dictionaries.

## Update the CV

Replace `assets/CV_Irvan_Yoga_Pratama.pdf`. If the filename changes, update the `href` in the contact
section of `index.html`.

## Checks run

- 17 internal anchors resolve; 15 images load.
- No horizontal scroll at 1440, 768, and 375, in English and in Indonesian.
- The toggle switches every string, survives reload, and returns to English.
- The portrait morph reaches 261px wide and full color in the bio.
- The certificate lightbox opens with the right image and closes.
- Menu opens and closes; email, phone, and CV links exist.
- Zero uncaught exceptions, console errors, and browser log errors.

Screenshots: `../.checks/majd/`

- `local-bio.png` (portrait in the bio)
- `local-cert.png` (certificate lightbox)
- `local-1440.png`, `local-768.png`, `local-375.png`
- `local-375-id-top.png`, `local-375-id-bottom.png` (Indonesian)

## Known limits

- One project in the CV, so Selected work has one card with a typographic visual.
- No social links were provided; the contact card has email, phone, and location.
- The template's contact form was replaced with a contact card because there is no backend.
- The certificate images are shown as supplied, so they carry the details printed on them.
