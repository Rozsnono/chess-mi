"use client";
import PieceIcon from "@/assets/pieces/icon";
import { BoardContext } from "@/services/context";
import Image from "next/image";
import { LegacyRef, useContext, useEffect, useReducer, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { ChessPiece } from "@/services/chess.service";


export default function Home() {

  const { board } = useContext(BoardContext);



  const [reload, setReload] = useState(0);

  const [selectedStart, setSelectedStart] = useState<Square | null>(null);
  const [prevMoves, setPrevMoves] = useState([] as { x: number, y: number }[]);
  const [availableMoves, setAvailableMoves] = useState<Array<{check: string, move: string}>>([]);

  const [promote, setPromote] = useState<{ square: Square, color: "w" | "b" | undefined } | null>(null);

  const [check, setCheck] = useState<"w" | "b" | undefined>(undefined);



  function startSelection(piece: ChessPiece | null, newPiece?: boolean) {
    if (piece == null) return;
    if (selectedStart == null || newPiece) {
      setPrevMoves([]);
      setSelectedStart(piece.square);
      setAvailableMoves(board.getAvailableMoves(piece.square, piece.type));
    }
  }

  async function move(move: {check: string, move: string, promotion?: boolean}, square: Square | undefined) {
    if (selectedStart == null || square == undefined) return;
    if (selectedStart == square) return;
    if (move == undefined) {startSelection(board.getPieceByLabel(square), true); return;};
    if (move.promotion) { setPromote({square: square, color: board.getPieceByLabel(selectedStart)?.color}); return;}
    if (board.getPieceByLabel(square) != null && board.getPieceByLabel(square)?.color == board.getPieceByLabel(selectedStart)?.color) { startSelection(board.getPieceByLabel(square), true); return; };
    const res = board.move(move.move);
    if(res){
      setCheck(undefined);
      if(res == "check"){
        setCheck(board.turn);
      }
      setReload(reload + 1);
      setAvailableMoves([]);
      setSelectedStart(null);
    }else{
      startSelection(board.getPieceByLabel(square), true);
    }
  }

  function promotion(square: Square, prom: "Q" | "R" | "N" | "B"){
    console.log(square, prom);
    const res = board.promotion(square, prom);
    if(res){
      setPromote(null);
      setReload(reload + 1);
      setAvailableMoves([]);
      setSelectedStart(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-8"><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div></div>
        {/* <div className="flex">
          {
            board.missingPieces.map((piece, index) => {
              return (
                <div key={index}>
                  {
                    piece.color == "w" ?
                      <div className="w-6 h-6 relative" key={index}>
                        <Image src={`/pieces/${piece.kind}-${piece.color}.svg`} alt={piece.kind} width={100} height={100} />
                      </div> : <></>
                  }
                </div>
              )
            })
          }
        </div> */}
      </div>
      <div className="chessBoard border-2 border-black select-none" key={reload}>
        {
          board.chess_board.map((y, indexY) =>
            <div className="grid grid-cols-8" key={indexY}>
              {
                board.chess_board[indexY].map((x, indexX) =>
                  <div className={"w-24 h-24 relative chessPlate" + ((indexY + indexX) % 2 == 0 ? "-dark" : "")} key={board.boardLabels[1][indexX] + board.boardLabels[0][indexY]} onMouseDown={() => { startSelection(x) }} onMouseUp={() => { move(availableMoves.filter(move => move.check == board.boardLabels[0][indexX].toLocaleLowerCase() + board.boardLabels[1][indexY])[0], board.boardLabels[0][indexX].toLocaleLowerCase() + board.boardLabels[1][indexY] as Square) }}>
                    {
                      (indexX == 0) && <div className={"absolute top-0 left-1 "}>{board.boardLabels[1][indexY]}</div>
                    }
                    {
                      (indexY == 7) && <div className={"absolute bottom-0 right-1 "}>{board.boardLabels[0][indexX].toUpperCase()}</div>
                    }

                    {
                      selectedStart != null && selectedStart == x?.square &&
                      <div className="absolute top-0 left-0 w-24 h-24 bg-blue-700 opacity-20"></div>
                    }

                    <div className="relative z-10 cursor-pointer">
                      {board.chess_board[indexY][indexX]?.getIcon()}
                    </div>
                    {
                      availableMoves.filter(move => move.check == board.boardLabels[0][indexX] + board.boardLabels[1][indexY]).length > 0 &&
                      <div className="absolute z-20 top-0 left-0 w-24 h-24 opacity-50 flex justify-center items-center hover cursor-pointer">
                        <div className="w-6 h-6 bg-gray-700 rounded-full gray"></div>
                      </div>
                    }

                    {
                      prevMoves.filter(move => move.x == indexX && move.y == indexY).length > 0 &&
                      <div className="absolute top-0 left-0 w-24 h-24 opacity-40 flex justify-center items-center border-4 border-blue-700"> </div>
                    }

                    {
                      x?.kind == "king" && x.color == check &&
                      <div className="absolute top-0 left-0 w-24 h-24 opacity-20 flex justify-center items-center bg-red-700">
                      </div>
                    }

                    {
                      promote != null && promote.square == board.boardLabels[0][indexX].toLocaleLowerCase() + board.boardLabels[1][indexY] as Square &&
                      <Promotion x={indexX} y={indexY} color={promote.color as "w" | "b"} prom={(prom) => { promotion(promote.square, prom); }} />
                    }

                  </div>
                )
              }
            </div>
          )
        }
      </div>

    </main>
  );
}


export function Promotion({ x, y, prom, color }: { x: number, y: number, prom: (prom: "Q" | "R" | "N" | "B") => void, color: "w" | "b" }) {
  return (
    <main className={"absolute top-0 left-0 w-24 h-24 z-50 overflow-y-scroll overflow-x-hidden border-2 chessPlate" + ((y + x) % 2 == 0 ? "-dark" : "")}>
      <div className="flex flex-col justify-center items-center">
        <PieceIcon name="queen" color={color} onClick={() => { prom("Q") }} />
        <PieceIcon name="rook" color={color} onClick={() => { prom("R") }} />
        <PieceIcon name="knight" color={color} onClick={() => { prom("N") }} />
        <PieceIcon name="bishop" color={color} onClick={() => { prom("B") }} />
      </div>
    </main>
  )
}