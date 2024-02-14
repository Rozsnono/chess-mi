"use client";
import { Context, createContext } from "react";
import Board, { ChessPiece } from "./piece.service";

export interface BoardContext {
  board: Board;
  setBoard: (board: Board) => void;
}

export const BoardContext = createContext<BoardContext>({
    board: new Board(),
    setBoard: () => {}  
});

