# Pixel Lounge Arcade

This is a static GitHub Pages arcade site. It has 10 original mini games built with HTML, CSS, and JavaScript, so you can upload it without installing anything.

## How to publish it

1. Make a new GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and this `README.md`.
3. Open the repository settings.
4. Go to **Pages**.
5. Choose **Deploy from a branch**.
6. Pick the `main` branch and `/root`.
7. Save.

Your site will publish at:

```text
https://YOURUSERNAME.github.io/REPO-NAME/
```

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

Then add a card to the `games` array in `app.js`:

```js
{
  id: "my-game",
  title: "My Game",
  type: "Arcade",
  icon: "G",
  description: "A short description.",
  render: (mount) => {
    mount.innerHTML = '<iframe src="games/my-game/index.html" title="My Game"></iframe>';
    return () => {};
  }
}
```

Add this CSS to make iframe games fit:

```css
.game-mount iframe {
  width: 100%;
  min-height: 34rem;
  border: 0;
  border-radius: 0.5rem;
  background: #0b0c10;
}
```

## Where to get games legally

- Use games you made yourself.
- Use open-source HTML5 games with a license that allows reuse.
- Use itch.io embeds only when the creator provides or allows an embed.
- Credit creators when the license requires it.

Do not copy games from someone else's site unless you have permission or the license allows it.
