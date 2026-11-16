# Teacher Grade Calculator

Native SwiftUI iOS calculator with Spanish/English switching, adjustable totals, and weighted grades on a 0–10 scale. No dependencies. Supports iOS 16+.

## Browser preview

To try the calculator without a Mac, run `python3 -m http.server 8000 --bind 127.0.0.1 --directory web` from this folder and open <http://127.0.0.1:8000>. This is a separate browser implementation of the calculator, not an iOS simulator. Browser grading checks are at <http://127.0.0.1:8000/tests.html>.

## Online deployment and iPhone Home Screen

The GitHub Actions workflow [pages.yml](.github/workflows/pages.yml) tests the grading formulas and publishes only the web app assets to GitHub Pages after changes to `web/` on `main`.

In this repository's **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. A private repository requires a GitHub plan that supports private-repository Pages. Keep the repository private unless you explicitly want to change its visibility.

After a successful deployment, use the URL shown in the workflow's `github-pages` environment. Open that URL in Safari on your iPhone, choose **Share → Add to Home Screen**, enable **Open as Web App** if shown, and tap **Add**. An internet connection is required; offline caching is not implemented.

The manifest and icon links use relative paths so deployment under a repository subpath works. Tests are excluded from the deployed site. Run browser checks at `/tests.html` locally, or `npm test --prefix web` when Node is installed.

## Native iOS app

Open `TeacherGradeCalculator.xcodeproj` in Xcode 15+ on a Mac, select an iPhone simulator, and Run. For a physical iPhone, select your development team under Signing & Capabilities. Run checks with Product → Test.

Spanish is the default; language selection persists across launches. Reset restores the example (4/15 exam, 3/10 assignments, 30% exam weight), preserving the language. Exam totals range from 1–100 and assignments from 1–50. Reducing a total clamps the earned count. Final grades use unrounded ratios; displayed grades have two decimals.

The interface uses a Liquid Glass inspired appearance. Native controls use Apple's Liquid Glass when built with Xcode 26+ and running iOS 26+; older versions use SwiftUI materials. Reduced transparency uses opaque surfaces. The browser preview recreates the appearance with CSS blur, translucent layers, and glass controls, and respects reduced motion and reduced transparency preferences.

Created in Linux without Xcode or Swift: the iOS build, tests, and visual verification must still run on a Mac.
