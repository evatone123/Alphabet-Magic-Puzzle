export enum GameState {
  MENU = 'MENU',
  LOADING_RIDDLE = 'LOADING_RIDDLE',
  PLAYING = 'PLAYING',
  CORRECT = 'CORRECT',
  GENERATING_REWARD = 'GENERATING_REWARD',
  SHOW_REWARD = 'SHOW_REWARD',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface RiddleData {
  question: string;
  answer: string;
  options: string[]; // Includes the answer and distractions
  letter: string;
}

export interface GeneratedImage {
  url: string;
  alt: string;
}