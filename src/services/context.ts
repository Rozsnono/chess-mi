"use client";
import { Context, createContext } from "react";
import Board from "./chess.service";
// import ChessAi from "./chessAi.service";
import { Chess } from "chess.js";

export interface BoardContext {
  board: Board;
  stockfish: any;
}

export const BoardContext = createContext<BoardContext>({
    board: new Board(),
    stockfish: null
});

