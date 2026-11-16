# Teacher Grade Calculator

[Open the online calculator](https://stephmom.github.io/teacher-evaluation-app/)

A Spanish/English grade calculator on a 0–10 scale. Adjust exam questions, the minimum exam grade, assignments, and evaluation weights. Light and dark modes are available.

## Use on iPhone

Open the calculator link in Safari, tap **Share → Add to Home Screen**, then tap **Add**.

## Run locally

From the repository folder, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory web
```

Then open <http://127.0.0.1:8000>.

## Native iOS app

Open `TeacherGradeCalculator.xcodeproj` in Xcode 15+ on a Mac and run it on an iPhone simulator or a signed device. The app supports iOS 16+.
