export const randomPlayer = () => {
  return this.players[Math.floor(Math.random() * this.players.length)];
};

export const allPlayuersExcept = (playerId) => {
  return this.players.filter((p) => p !== playerId);
};
