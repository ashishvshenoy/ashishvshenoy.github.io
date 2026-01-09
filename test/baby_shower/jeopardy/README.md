# Baby Shower Jeopardy — Tournament (Offline Website)

## What you get
- 4 initial rounds (4 players each): 4 categories × 2 questions per category
- Tracks scores per player
- Timer per question (set seconds before round; reset per clue)
- Stores tournament progress + custom questions in your browser (localStorage)
- Final round unlocks after all 4 initial rounds have winners

## How to run
1. Unzip the project
2. Open `index.html` in Chrome/Safari/Edge
3. Connect laptop to TV/projector and play

## Editing questions
Click **Questions / Settings**:
- Edit the JSON
- Click **Save**
- Changes persist in your browser

## NOTE about the Final (5 winners vs 4)
Your format yields 5 winners (If you have 20 adults, you can either:
- run 4 rounds (16 players) + include 4 byes/hosts, or
- swap in new players mid-round (manual), or
- duplicate this project and run a second bracket.

This version is configured for **4 initial rounds → 4 winners → Final (4 players)**.
Options:
- Run a quick mini-playoff between 2 winners to pick the 4th finalist, OR
- Change to 4 initial rounds (16 people + 4 byes), OR
- Modify the code to allow 5 finalists in the final (easy tweak).


## Images
This build uses **direct Wikimedia image URLs**. You’ll need an internet connection during gameplay for images to display.


## Add your own images (load locally)
1. Put your images in: `assets/images/`
2. In the in-app **Questions / Settings** editor (or in `questions.js`), set:
   - `"imageUrl": "assets/images/your_file.jpg"`
3. Keep filenames simple (letters/numbers/dashes). Use `.jpg` or `.png`.
4. Open `index.html` again and test a tile.

Example:
```json
{
  "value": 200,
  "q": "Name this item:",
  "a": "Baby monitor",
  "imageUrl": "assets/images/baby_monitor.jpg",
  "trickyImage": true,
  "trickyZoom": true
}
```

Notes:
- Local images work offline.
- Web images require internet.
