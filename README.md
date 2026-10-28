<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/373c922c-1391-4c76-b13f-62d91262db56

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## CSV Storage

The Patient Diagnosis page saves CSV files in IndexedDB in the current browser profile. Saved
files remain on that device until deleted or browser site data is cleared; they are not uploaded
to a server or shared across devices. The browser may enforce its own storage quota. This feature
can evaluate basic dataset quality and descriptive statistics (row/column counts, missing values,
and min/mean/max for numeric columns) locally. This is not a diagnosis or clinical analysis. Use
synthetic/demo data only; browser storage is not secure storage for real patient or clinical records.

## Demo Data Catalog

Use the **Data** button to save synthetic cancer-genomics dataset metadata or satellite scene metadata in the current browser. This catalog does not upload raw files or connect to AWS. Do not enter real patient information; production clinical storage requires a secure backend and compliance review.
