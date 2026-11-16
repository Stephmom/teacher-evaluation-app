# Teacher Grade Calculator

[Open the online calculator](https://stephmom.github.io/teacher-evaluation-app/)

A Spanish/English grade calculator on a 0–10 scale. Adjust exam questions, the minimum exam grade, assignments, and evaluation weights. Include or exclude classwork, writing, speaking, listening, and reading. Set a school minimum final grade from 0 to 10. Active category weights automatically scale to 100%. Light and dark modes are available.

## Use on iPhone

Open the calculator link in Safari, tap **Share → Add to Home Screen**, then tap **Add**.

## Run locally

From the repository folder, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory web
```

Then open <http://127.0.0.1:8000>.

## Deployment

The website is hosted on GitHub Pages. Changes to the website on `main` are published automatically by the GitHub Actions workflow.

The project uses HTML, CSS, and JavaScript; no build step is required for local use.
