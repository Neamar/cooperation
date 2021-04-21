export const randomPlayer = () => {
  return this.players[Math.floor(Math.random() * this.players.length)];
};

export const allPlayersExcept = (playerId) => {
  return this.players.filter((p) => p !== playerId);
};
