"use client";
import PieceIcon from "@/assets/pieces/icon";
import { BoardContext } from "@/services/context";
import Image from "next/image";
import { LegacyRef, use, useContext, useEffect, useReducer, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import Board, { ChessPiece } from "@/services/chess.service";


export default function ChessBoard() {

    const { board, stockfish } = useContext(BoardContext);



    const [reload, setReload] = useState(0);

    const [selectedStart, setSelectedStart] = useState<Square | null>(null);
    const [prevMoves, setPrevMoves] = useState([] as { x: number, y: number }[]);
    const [availableMoves, setAvailableMoves] = useState<Array<{ check: string, move: string }>>([]);

    const [promote, setPromote] = useState<{ square: Square, color: "w" | "b" | undefined } | null>(null);

    const [check, setCheck] = useState<"w" | "b" | undefined>(undefined);
    const timeRef = useRef({ w: 600, b: 600 });
    const [time, setTime] = useState({ w: 600, b: 600 });

    const otherMoves = useRef([] as string[]);
    const [end, setEnd] = useState(false);
    const endRef = useRef(false);


    useEffect(() => {
        stockfish.postMessage("uci");
        stockfish.postMessage("ucinewgame");
        stockfish.postMessage("setoption name Skill Level value 3");
        stockfish.postMessage("isready");

        // stockfish.postMessage("position startpos moves e2e4");
        // stockfish.postMessage("go depth 10");

        setInterval(() => {
            if (endRef.current) return;
            if (board.checking() == "none" || board.checking() == "check" || timeRef.current.w != 0 || timeRef.current.b != 0) {
                if (board.turn == "b") {
                    timeRef.current = { w: timeRef.current.w - 1, b: timeRef.current.b };
                }
                else {
                    timeRef.current = { w: timeRef.current.w, b: timeRef.current.b - 1 };
                }
                setTime(timeRef.current);
                if (timeRef.current.w == 0 || timeRef.current.b == 0) {
                    setEnd(true);
                }
            }

        }, 1000);

        stockfish.onmessage = (event: any) => {
            if (end) return;
            // console.log(event.data)
            if (event.data.includes("info depth 15 seldepth")) {
                otherMoves.current = (event.data.split(" pv ")[1].split(" "));
            }
            if (event.data.includes("bestmove")) {
                const res = board.botMove([event.data.split(" ")[1], ...otherMoves.current])
                if (res == "none" || res == "check") {
                    setCheck(undefined);
                    if (res == "check") {
                        setCheck(board.turn);
                    }
                    setReload(reload + 1);
                    setAvailableMoves([]);
                    setSelectedStart(null);
                    stockfish.postMessage("position fen " + board.chess.fen());
                    stockfish.postMessage("go depth 15");
                } else if (res != undefined) {
                    setEnd(true);
                    endRef.current = true;
                    console.log("End");
                }

            }
        };
    }, []);



    function startSelection(piece: ChessPiece | null, newPiece?: boolean) {
        if (piece == null) return;
        if (end) return;
        if (selectedStart == null || newPiece) {
            setPrevMoves([]);
            setSelectedStart(piece.square);
            setAvailableMoves(board.getAvailableMoves(piece.square, piece.type));
        }
    }

    async function move(move: { check: string, move: string, promotion?: boolean }, square: Square | undefined) {
        if (end) return;
        if (selectedStart == null || square == undefined) return;
        if (selectedStart == square) return;
        if (move == undefined) { startSelection(board.getPieceByLabel(square), true); return; };
        if (move.promotion) { setPromote({ square: square, color: board.getPieceByLabel(selectedStart)?.color }); return; }
        if (board.getPieceByLabel(square) != null && board.getPieceByLabel(square)?.color == board.getPieceByLabel(selectedStart)?.color) { startSelection(board.getPieceByLabel(square), true); return; };
        const res = board.move(selectedStart, square);
        if (res) {
            setCheck(undefined);
            if (res == "check") {
                setCheck(board.turn);
            } else if (res != "none") {
                endRef.current = true;
                setEnd(true);
            }
            setReload(reload + 1);
            setAvailableMoves([]);
            setSelectedStart(null);
            stockfish.postMessage("position fen " + board.chess.fen());
            stockfish.postMessage("go depth 15");
        } else {
            console.log("Invalid move", move.move);
            startSelection(board.getPieceByLabel(square), true);
        }
    }

    function promotion(square: Square, prom: "Q" | "R" | "N" | "B") {
        const res = board.promotion(square, prom);
        if (res) {
            setPromote(null);
            setReload(reload + 1);
            setAvailableMoves([]);
            setSelectedStart(null);
        }
    }

    return (
        <main className="flex min-h-screen items-center min-w-screen justify-center gap-2">

            <main className="flex flex-col items-center justify-center gap-2">
                <UserPanel board={board} time={time} icon="robot" user="Stockfish" color="w" value={board.missingPieces.white > board.missingPieces.black ? "+" + (board.missingPieces.white - board.missingPieces.black) : ""} />

                <div className="chessBoard border-2 border-black select-none" key={reload}>
                    {
                        board.chess_board.map((y, indexY) =>
                            <div className="grid grid-cols-8" key={indexY}>
                                {
                                    board.chess_board[indexY].map((x, indexX) =>
                                        <div className={"xl:w-24 xl:h-24 lg:w-16 lg:h-16 md:w-12 md:h-12 sm:w-8 sm:h-8 relative chessPlate" + ((indexY + indexX) % 2 == 0 ? "-dark" : "")} key={board.boardLabels[1][indexX] + board.boardLabels[0][indexY]} onMouseDown={() => { startSelection(x) }} onMouseUp={() => { move(availableMoves.filter(move => move.check == board.boardLabels[0][indexX].toLocaleLowerCase() + board.boardLabels[1][indexY])[0], board.boardLabels[0][indexX].toLocaleLowerCase() + board.boardLabels[1][indexY] as Square) }}>
                                            {
                                                (indexX == 0) && <div className={"absolute top-0 left-1 "}>{board.boardLabels[1][indexY]}</div>
                                            }
                                            {
                                                (indexY == 7) && <div className={"absolute bottom-0 right-1 "}>{board.boardLabels[0][indexX].toUpperCase()}</div>
                                            }

                                            {
                                                selectedStart != null && selectedStart == x?.square &&
                                                <div className="absolute top-0 left-0 w-full h-full bg-blue-700 opacity-20"></div>
                                            }

                                            <div className="relative z-10 cursor-pointer">
                                                {board.chess_board[indexY][indexX]?.getIcon()}
                                            </div>
                                            {
                                                availableMoves.filter(move => move.check == board.boardLabels[0][indexX] + board.boardLabels[1][indexY]).length > 0 &&
                                                <div className="absolute z-20 top-0 left-0 w-full h-full opacity-50 flex justify-center items-center hover cursor-pointer">
                                                    <div className="w-1/4 h-1/4 bg-gray-700 rounded-full gray"></div>
                                                </div>
                                            }

                                            {
                                                prevMoves.filter(move => move.x == indexX && move.y == indexY).length > 0 &&
                                                <div className="absolute top-0 left-0 w-full h-full opacity-40 flex justify-center items-center border-4 border-blue-700"> </div>
                                            }

                                            {
                                                x?.kind.toLowerCase() == "king" && x.color == check &&
                                                <div className="absolute top-0 left-0 w-full h-full opacity-20 flex justify-center items-center bg-red-700">
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

                <UserPanel board={board} time={time} icon="user" user="User" color="b" value={board.missingPieces.black > board.missingPieces.white ? "+" + (board.missingPieces.black - board.missingPieces.white) : ""} />
            </main>
            <main className="flex flex-col items-center justify-start gap-2 w-1/4 xl:h-[48rem] lg:h-[32rem] md:h-[24rem] sm:h-[16rem] border rounded-md">
                <div className="flex flex-wrap w-full h-fit max-h-full items-start overflow-y-auto">
                    {board.chess.history().map((move, index) => {
                        return <div key={index} className={"flex justify-center items-center w-1/2 border" + (index % 2 == 1 ? " bg-gray-200 border-gray-500" : "")}>
                            {
                                board.getPieceByType(move[0].toLocaleLowerCase()) != "pawn" &&
                                <Image src={`/pieces/${board.getPieceByType(move[0].toLocaleLowerCase())}-${index % 2 == 1 ? "b" : "w"}.svg`} alt={board.getPieceByType(move[0].toLocaleLowerCase())} width={20} height={20} />
                            }
                            {
                                board.getPieceByType(move[0].toLocaleLowerCase()) != "pawn" ?
                                    <div className="text-md">{move.slice(1)}</div> :
                                    <div className="text-md">{move}</div>
                            }
                        </div>
                    })}
                </div>
            </main>
        </main>
    );
}


export function Promotion({ x, y, prom, color }: { x: number, y: number, prom: (prom: "Q" | "R" | "N" | "B") => void, color: "w" | "b" }) {
    return (
        <main className={"absolute top-0 left-0 w-24 h-24 z-50 overflow-y-scroll overflow-x-hidden border-2 chessPlate" + ((y + x) % 2 == 0 ? "-dark" : "")}>
            <div className="flex flex-col justify-center items-center ">
                <PieceIcon name="queen" className="cursor-pointer" color={color} onClick={() => { prom("Q") }} />
                <PieceIcon name="rook" className="cursor-pointer" color={color} onClick={() => { prom("R") }} />
                <PieceIcon name="knight" className="cursor-pointer" color={color} onClick={() => { prom("N") }} />
                <PieceIcon name="bishop" className="cursor-pointer" color={color} onClick={() => { prom("B") }} />
            </div>
        </main>
    )
}

export function UserPanel({ board, color, value, user, icon, time }: { board: Board, color: "b" | "w", value: string, user: string, icon: string, time: { w: number, b: number } }) {
    return (
        <div className="flex xl:w-[48rem] lg:w-[32rem] md:w-[24rem] sm:w-[16rem] items-center justify-between gap-2">
            <div className="flex gap-2 items-center">
                <div className="flex border border-gray-500 rounded-md w-10 h-10 pt-2 bg-gray-300 ">
                    <Image src={"images/" + icon + ".svg"} alt={user} width={100} height={100}></Image>
                </div>
                <div className="flex flex-col">
                    <div>{user} (2000)</div>
                    <hr />
                    <div className="flex items-center h-4">
                        {
                            Object.keys(board.missingPieces.missingPieces).map((piece, index) => {
                                return (
                                    <div key={index} className="flex">
                                        {
                                            board.missingPieces.missingPieces[piece].color == color &&
                                            board.missingPieces.missingPieces[piece].number.length > 0 &&
                                            board.missingPieces.missingPieces[piece].number.split("").map((value: string, index: number) => {
                                                return <div className="w-4 h-4 relative" key={index}>
                                                    <Image src={`/pieces/${board.missingPieces.missingPieces[piece].kind}-${board.missingPieces.missingPieces[piece].color}.svg`} alt={board.missingPieces.missingPieces[piece].kind} width={100} height={100} />
                                                </div>
                                            })
                                        }
                                    </div>
                                )
                            })
                        }

                        <span className="text-sm">{value}</span>
                    </div>
                </div>
            </div>
            {/* <div className="grid grid-cols-8"><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div><div className="w-24"></div></div> */}
            <div className="flex gap-2 border border-gray-500 rounded-md w-20 h-10 text-lg bg-gray-300 justify-center items-center">
                {
                    time[color] / 60 < 10 ? "0" + Math.floor(time[color] / 60) : Math.floor(time[color] / 60)
                }
                :
                {
                    time[color] % 60 < 10 ? "0" + time[color] % 60 : time[color] % 60
                }
            </div>

        </div>
    )
}