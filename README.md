# Study Break Arcade

This is a static GitHub Pages arcade site. It has 11 original mini games built with HTML, CSS, and JavaScript, so you can upload it without installing anything.

## How to publish it

1. Make a new GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, `external-games.js`, the `assets` folder, and this `README.md`.
3. Open the repository settings.
4. Go to **Pages**.
5. Choose **Deploy from a branch**.
6. Pick the `main` branch and `/root`.
7. Save.

Your site will publish at:

```text
https://YOURUSERNAME.github.io/REPO-NAME/
```

## About the logo

The included logo is an original red study-break mark in `assets/logo.svg`. Do not use school platform logos or other trademarked logos unless you have permission.

## How to rename it

Change the title in these places:

- `index.html`, inside the `<title>` tag.
- `index.html`, inside the big hero heading.
- `index.html`, inside the brand text.

## How to add your own HTML5 game

Use this folder setup:

```text
games/
  my-game/
    index.html
    style.css
    game.js
    assets/
```

Then add a card to the `externalGames` array in `external-games.js`:

```js
{
  id: "my-game",
  title: "My Game",
  type: "HTML5",
  icon: "G",
  description: "A short description.",
  url: "games/my-game/index.html",
  credit: "Made by Your Name"
}
```

`external-games.js` only allows local `games/...` links. External sites are blocked by the launcher on purpose.

## Where to get games legally

- Use games you made yourself.
- Use open-source HTML5 games with a license that allows reuse.
- Use itch.io embeds only when the creator provides or allows an embed.
- Credit creators when the license requires it.

Do not copy games from someone else's site unless you have permission or the license allows it.

## About large game-asset repositories

Some public repositories contain many game files but do not include a clear license. Public does not always mean free to rehost. If a repo has no license, get permission first or use your own original games.
