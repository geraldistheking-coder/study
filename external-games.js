const externalGames = [
  /*
  Add games here only when you have permission to host or embed them.

  {
    id: "my-game",
    title: "My Game",
    type: "HTML5",
    icon: "G",
    description: "A short description.",
    url: "games/my-game/index.html",
    credit: "Made by Your Name"
  }
  */
];

function renderExternalGame(game) {
  return (mount) => {
    mount.innerHTML = `
      <div class="play-area">
        <iframe src="${game.url}" title="${game.title}" allowfullscreen></iframe>
        ${game.credit ? `<p class="stat">${game.credit}</p>` : ""}
      </div>
    `;
    return () => {};
  };
}

if (Array.isArray(window.games)) {
  externalGames.forEach((game) => {
    window.games.push({
      ...game,
      render: renderExternalGame(game)
    });
  });
  if (typeof window.renderCards === "function") window.renderCards();
}
