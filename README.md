# Core Level Design System Portal

Responsive landing page for the Bangkok Bank design system portal. Plain HTML, CSS and JavaScript, no build step.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
ruby -run -e httpd . -p 8099
```

Then visit http://localhost:8099.

## Responsive behaviour

| Breakpoint | Layout |
| --- | --- |
| 1101px and up | Full nav, hero in two columns, 5-column cards |
| 901 to 1100px | 3-column cards, 2-column footer links |
| 601 to 900px | Menu button replaces the nav, hero and AI sections stack |
| 600px and below | 2-column cards, full-width buttons, stacked footer |
| 400px and below | Single-column cards |

## Features

- TH / EN switch for key strings (choice saved in `localStorage`)
- Search box that filters the "Latest updated" component previews
- Keyboard-friendly menu (Esc closes it), skip link, visible focus states

## Publish with GitHub Pages

Push this folder to a repository, then go to Settings, Pages, and choose the `main` branch and the root folder.
