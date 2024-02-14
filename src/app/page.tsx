"use client";
import PieceIcon from "@/assets/pieces/icon";
import { BoardContext } from "@/services/board.context";
import Board from "@/services/piece.service";
import Image from "next/image";
import { LegacyRef, useContext, useEffect, useReducer, useRef, useState } from "react";

export default function Home() {

  const { board } = useContext(BoardContext);



  const [reload, setReload] = useState(0);

  const [selectedStart, setSelectedStart] = useState({ x: -1, y: -1 });
  const [prevMoves, setPrevMoves] = useState([] as { x: number, y: number }[]);
  const [availableMoves, setAvailableMoves] = useState([] as { x: number, y: number, attack?: boolean | "king", castle?: "left" | "right", defence?: boolean }[]);

  const [checkAdd, setCheck] = useState<"b" | "w" | undefined>(undefined);

  function startSelection(x: number, y: number, newPiece?: boolean) {
    if (board.turn != board.boardMatrix[y][x]?.color) return;
    if (selectedStart.x == -1 || newPiece) {
      setPrevMoves([]);
      setSelectedStart({ x, y });
      setPrevMoves([{ x, y }]);
      if (checkAdd != undefined && board.boardMatrix[y][x]?.kind != "king") {
        const tmp = board.getAvailableMoves(x, y).filter(move => { return board.onCheckTitle.filter(check => check.x == move.x && check.y == move.y).length > 0 });
        setAvailableMoves(tmp);
      } else {
        setAvailableMoves(board.getAvailableMoves(x, y));
      }
    }
  }

  function move(x: number, y: number) {
    if (selectedStart.x == -1) return;
    if (selectedStart.x == x && selectedStart.y == y) return;
    if (board.boardMatrix[y][x] != null && board.boardMatrix[y][x]?.color == board.boardMatrix[selectedStart.y][selectedStart.x]?.color) { startSelection(x, y, true); return; };
    if (availableMoves.filter(move => move.x == x && move.y == y).length == 0) return;
    if (availableMoves.filter(move => move.x == x && move.y == y)[0].castle) {
      board.castle(selectedStart.x, selectedStart.y, x, y, availableMoves.filter(move => move.x == x && move.y == y)[0].castle as "left" | "right");
      setCheck(undefined);
    } else {
      const piece = board.getPieceByCord(x, y);
      if (piece != null) {
        board.missingPieces.push(piece);
      }

      setCheck(board.move(selectedStart.x, selectedStart.y, x, y));
    }
    setSelectedStart({ x: -1, y: -1 });
    setPrevMoves([...prevMoves, { x, y }]);
    setAvailableMoves([]);
    // board.onCheckTitle = [];
    // board.getAvailableMoves(x, y).forEach(move => {
    //   if (move.attack == "king") {
    //     board.onCheckTitle.push(move)
    //   }
    // })
    // if (board.onCheckTitle.length > 0) {
    //   setCheck(board.boardMatrix[y][x]?.color);
    //   const king = board.getKingByColor(board.boardMatrix[y][x]?.color == "b" ? "w" : "b");
    //   const pos = board.getKingCordByColor(board.boardMatrix[y][x]?.color == "b" ? "w" : "b");
    //   console.log(king?.availableMoves(board, pos?.x as number, pos?.y as number).filter(move => { return move.defence == undefined }));
    //   king?.availableMoves(board, pos?.x as number, pos?.y as number).filter(move => { return move.defence == undefined }).length == 0 && alert("Checkmate");
    // }
  }

  function promotion(x: number, y: number, prom: "queen" | "rook" | "knight" | "bishop") {
    board.promotion(x, y, prom);
    board.getAvailableMoves(x, y).forEach(move => {
      if (move.attack == "king") {
        board.onCheckTitle.push(move)
      }
    })
    if (board.onCheckTitle.length > 0) {
      setCheck(board.boardMatrix[y][x]?.color);
    }
    setSelectedStart({ x: -1, y: -1 });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-8"><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div></div>
        <div className="flex">
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
        </div>
      </div>
      <div className="chessBoard border-2 border-black select-none" key={reload}>
        {
          board.chessBoardX.map((y, indexY) =>
            <div className="grid grid-cols-8" key={y}>
              {
                board.chessBoardY.map((x, indexX) =>
                  <div className={"w-24 h-24 relative chessPlate" + ((indexY + indexX) % 2 == 0 ? "-dark" : "")} key={x} onMouseDown={() => { startSelection(indexX, indexY) }} onMouseUp={() => { move(indexX, indexY) }}>
                    {
                      (indexX == 0) && <div className={"absolute top-0 left-1 "}>{y}</div>
                    }
                    {
                      (indexY == 7) && <div className={"absolute bottom-0 right-1 "}>{x}</div>
                    }

                    {
                      selectedStart.x == indexX && selectedStart.y == indexY &&
                      <div className="absolute top-0 left-0 w-24 h-24 bg-blue-700 opacity-20"></div>
                    }

                    <div className="relative z-10 cursor-pointer">
                      {board.GetPieceIconByCord({ x: indexX, y: indexY })}
                    </div>
                    {
                      !(selectedStart.x == indexX && selectedStart.y == indexY) &&
                      availableMoves.filter(move => move.x == indexX && move.y == indexY).length > 0 && !availableMoves.filter(move => move.x == indexX && move.y == indexY)[0].defence &&
                      <div className="absolute z-20 top-0 left-0 w-24 h-24 opacity-50 flex justify-center items-center hover cursor-pointer">
                        {
                          availableMoves.filter(move => move.x == indexX && move.y == indexY)[0].attack ?
                            <div className="w-6 h-6 bg-red-700 rounded-full red"></div>
                            :
                            <div className="w-6 h-6 bg-gray-700 rounded-full gray"></div>
                        }
                      </div>
                    }

                    {
                      prevMoves.filter(move => move.x == indexX && move.y == indexY).length > 0 &&
                      <div className="absolute top-0 left-0 w-24 h-24 opacity-40 flex justify-center items-center border-4 border-blue-700"> </div>
                    }

                    {
                      board.boardMatrix[indexY][indexX]?.kind == "king" && checkAdd != undefined && checkAdd != board.boardMatrix[indexY][indexX]?.color &&
                      <div className="absolute top-0 left-0 w-24 h-24 opacity-20 flex justify-center items-center bg-red-700">
                      </div>
                    }

                    {
                      board.boardMatrix[indexY][indexX]?.kind == "pawn" && board.boardMatrix[indexY][indexX]?.facing == "up" && indexY == 0 &&
                      <Promotion x={indexX} y={indexY} color="w" prom={(prom) => { promotion(indexX, indexY, prom) }} />
                    }
                    {
                      board.boardMatrix[indexY][indexX]?.kind == "pawn" && board.boardMatrix[indexY][indexX]?.facing == "down" && indexY == 7 &&
                      <Promotion x={indexX} y={indexY} color="b" prom={(prom) => { promotion(indexX, indexY, prom) }} />
                    }
                  </div>
                )
              }
            </div>
          )
        }
      </div>
      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-8"><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div></div>
        <div className="flex">
          {
            board.missingPieces.map((piece, index) => {
              return (
                <div key={index}>
                  {
                    piece.color == "b" ?
                      <div className="w-6 h-6 relative" key={index}>
                        <Image src={`/pieces/${piece.kind}-${piece.color}.svg`} alt={piece.kind} width={100} height={100} />
                      </div> : <></>
                  }
                </div>
              )
            })
          }
        </div>
      </div>


      <div className="absolute flex flex-col ">
        {
          board.checkPlacesForKing?.map((row, indexY) =>{
            return (
              <div key={indexY} className="flex">
                {
                  row.map((col, indexX) =>{
                    return (
                      <div key={indexX} className={"w-6 h-6 relative border " + (col == "both" ? " bg-red-700" :( col == "w" ? "bg-blue-400" : ( col == "b" ? "bg-blue-900" : "")))}></div>
                    )
                  })
                }
              </div>
            )
          })
        }
      </div>
    </main>
  );
}


export function Promotion({ x, y, prom, color }: { x: number, y: number, prom: (prom: "queen" | "rook" | "knight" | "bishop") => void, color: "w" | "b" }) {
  return (
    <main className={"absolute top-0 left-0 w-24 h-24 z-50 overflow-y-scroll overflow-x-hidden border-2 chessPlate" + ((y + x) % 2 == 0 ? "-dark" : "")}>
      <div className="flex flex-col justify-center items-center">
        <PieceIcon name="queen" color={color} onClick={() => { prom("queen") }} />
        <PieceIcon name="rook" color={color} onClick={() => { prom("rook") }} />
        <PieceIcon name="knight" color={color} onClick={() => { prom("knight") }} />
        <PieceIcon name="bishop" color={color} onClick={() => { prom("bishop") }} />
      </div>
    </main>
  )
}