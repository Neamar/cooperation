import { redisClient } from '../lib/redis.js';

const GAME_KEY_PREFIX = 'game.';
const getRedisName = (gameId) => GAME_KEY_PREFIX + gameId;

export const writeState = async (gameId, state) => {
  await redisClient.set(getRedisName(gameId), JSON.stringify(state));
};

/**
 * component
 * @typedef {Object} Component
 * @property {String} id - component id
 * @property {String} type - component type
 * @property {String} state - 'active' or 'inactive'
 * @property {String[]} visibility - array of players that can see component
 * @property {Object} data - content for the component
 * @property {Object} behaviors - functions to run on various lifecycle events
 */

/**
 * game state
 * @typedef {Object} GameState
 * @property {String} state - Indicates current game state
 * @property {String[]} players - list of players
 * @property {Component[]} components - list of components
 */

/**
 *
 * @returns {Promise<GameState>} game state
 */
export const getState = async (gameId) => {
  const state = await redisClient.get(getRedisName(gameId));
  if (!state) {
    throw new Error('Invalid game ID');
  }

  return JSON.parse(state);
};
