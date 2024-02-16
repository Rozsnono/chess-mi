"use client";
import { Context, createContext } from "react";
import Board from "./chess.service";
// import ChessAi from "./chessAi.service";
import { Chess } from "chess.js";

export interface BoardContext {
  board: Board;
}

export const BoardContext = createContext<BoardContext>({
    board: new Board(),
});

