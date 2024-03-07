"use cleint";
import Board, { ChessPiece } from "@/services/chess.service";
import { Square } from "chess.js";
import Promotion from "./promotion.component";
import PieceIcon from "@/assets/pieces/icon";


export default function ChessBoardWhite({ board, reload, selectedStart, availableMoves, prevMoves, check, startSelection, move, promote, promotion }: { board: Board, reload: number, selectedStart: Square | null, availableMoves: Array<any>, prevMoves: { from: string, to: string }, check: "w" | "b" | undefined, startSelection: (chessPiece: ChessPiece | null) => void, move: (move: any, square: Square) => void, promote: any | null, promotion: (square: Square, prom: "Q" | "R" | "N" | "B") => void }) {

    function prepareMove(indexX: number, indexY: number) {
        move(availableMoves.filter(move => move.check == board.boardLabels[0][indexX].toLocaleLowerCase() + board.boardLabels[1][indexY])[0], board.boardLabels[0][indexX].toLocaleLowerCase() + board.boardLabels[1][indexY] as Square);
    }

    return (
        <div className={"chessBoard border-2 border-black select-none" + (board.team == "b" ? " rotate-180" : "")} key={reload}>
            {
                board.chess_board.map((y, indexY) =>
                    <div className="grid grid-cols-8" key={indexY}>
                        {
                            board.chess_board[indexY].map((x, indexX) =>
                                <div className={"2xl:w-24 2xl:h-24 xl:w-16 xl:h-16 lg:w-16 lg:h-16 md:w-12 md:h-12 sm:w-8 sm:h-8 relative chessPlate" + ((indexY + indexX) % 2 == 0 ? "-dark" : "")}
                                    key={board.boardLabels[1][indexX] + board.boardLabels[0][indexY]}
                                    onMouseDown={() => { startSelection(x); }}
                                    onMouseUp={() => { prepareMove(indexX, indexY) }}
                                    onDrop={() => { prepareMove(indexX, indexY) }} onDragOver={(e) => { e.preventDefault() }}>
                                    {
                                        (indexX == 0) && <div className={"absolute top-0 left-1 "}>{board.boardLabels[1][indexY]}</div>
                                    }
                                    {
                                        (indexY == 7) && <div className={"absolute bottom-0 right-1 "}>{board.boardLabels[0][indexX].toUpperCase()}</div>
                                    }

                                    {
                                        selectedStart != null && selectedStart == (board.boardLabels[0][indexX] + board.boardLabels[1][indexY]) &&
                                        <div className="absolute top-0 left-0 w-full h-full bg-blue-700 opacity-20"></div>
                                    }

                                    <div className={"relative z-10 cursor-pointer cursor-grab"} >
                                        <PieceIcon piece={board.chess_board[indexY][indexX]} />
                                    </div>
                                    {
                                        availableMoves.filter(move => move.check == board.boardLabels[0][indexX] + board.boardLabels[1][indexY]).length > 0 &&
                                        (board.chess_board[indexY][indexX] != null ?
                                            <div className="absolute z-20 top-0 left-0 w-full h-full opacity-50 flex justify-center items-center hover cursor-pointer">
                                                <div className="w-1/4 h-1/4 border-4 border-red-700 rounded-full red"></div>
                                            </div> :
                                            <div className="absolute z-20 top-0 left-0 w-full h-full opacity-50 flex justify-center items-center hover cursor-pointer">
                                                <div className="w-1/4 h-1/4 bg-gray-700 rounded-full gray"></div>
                                            </div>
                                        )

                                    }

                                    {
                                        (prevMoves.from == (board.boardLabels[0][indexX] + board.boardLabels[1][indexY]) || prevMoves.to == (board.boardLabels[0][indexX] + board.boardLabels[1][indexY])) &&
                                        <div className="absolute top-0 left-0 w-full h-full opacity-40 flex justify-center items-center border-4 border-blue-700"> </div>
                                    }

                                    {
                                        x?.kind.toLowerCase() == "king" && x.color == check &&
                                        <div className="absolute top-0 left-0 w-full h-full opacity-30 flex justify-center items-center p-1">
                                            <div className="check w-full h-full rounded-xl"></div>
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
    )
}