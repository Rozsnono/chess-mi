"use client";
import Board from "@/services/chess.service";
import { BoardContext } from "@/services/context";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";

import ArrowLeft from "@/assets/arrow.left.icon.svg";
import ArrowRight from "@/assets/arrow.right.icon.svg";
import ArrowMaxLeft from "@/assets/arrow.max.left.icon.svg";
import ArrowMaxRight from "@/assets/arrow.max.right.icon.svg";
import { useRouter } from "next/navigation";


export default function Analizer() {

    const { board, evaler } = useContext(BoardContext);
    const fen = useRef(board.chess.fen());
    const history = useRef(board.chess.history());
    // const history = useRef(['e4', 'e5', 'f4', 'Nf6', 'fxe5', 'Nxe4', 'Nf3', 'd5', 'Nd4', 'Qg5', 'h4', 'Qg3+', 'Ke2', 'Bg4+', 'Nf3', 'Nd7', 'Ke3', 'O-O-O', 'Qe2', 'Nec5', 'Qf2', 'd4+', 'Ke2', 'Qf4', 'Qe3', 'dxe3', 'dxe3', 'Qa4', 'b3', 'Qb4', 'c3', 'Qe4', 'Kd2', 'Bf5', 'Nd4', 'Nxe5', 'Bd3', 'Qxg2+', 'Ke1', 'Ncxd3+', 'Kd1', 'Bg4+', 'Ne2', 'Nb4+', 'Ke1']);

    const route = useRouter();

    useEffect(() => {
        if (history.current.length == 0) {
            route.push("/");
        }
        evaler.postMessage("uci");

        board.chess.reset();
        analize();

        evaler.onmessage = (event: any) => {
            if (event.data === 'uciok') {
                evaler.postMessage('isready');
            } else if (event.data === 'readyok') {
                evaler.postMessage('ucinewgame');
                evaler.postMessage('setoption name Skill Level value 20');
            }
            if (progressRef.current < 100) {
                if (event.data.includes("info depth 5")) {
                    const score = event.data.split("score")[1].split(" ")[2].trim();
                    setProgess(progess => progess + 100 / history.current.length);
                    progressRef.current = progressRef.current + 100 / history.current.length;
                    moves.current.push(score);
                    analize();
                }
                if (event.data.includes("Total Evaluation:")) {
                    const score = event.data.split("Total Evaluation:")[1].split("(")[0].trim();
                    setProgess(progess => progess + 100 / history.current.length);
                    progressRef.current = progressRef.current + 100 / history.current.length;
                    moves.current.push(score);
                    analize();
                }
            }
            else {
                setProgess(100);
                // moves.current = moves.current.filter((move: any) => { return move.move != undefined });
            }
        };
    }, []);

    function get_moves() {
        var moves = '';
        var history = board.chess.history({ verbose: true });

        for (var i = 0; i < history.length; ++i) {
            var move = history[i];
            moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
        }

        return moves;
    }

    const index = useRef(0);
    const progressRef = useRef(0);
    const moves = useRef<any>([]);

    function analize() {
        try {

            let moves = board.chess.move(history.current[index.current]);
            console.log("position fen ");
            evaler.postMessage("position fen " + board.chess.fen());
            // evaler.postMessage("go depth 5");
            evaler.postMessage("eval");
            index.current++;
        } catch (error) {
            board.chess.reset();
            board.setBoard(board.chess.board());
            // board.chess.load(fen.current);
        }
    }

    const [progess, setProgess] = useState(0);

    const [moving, setMoving] = useState(0);

    function setBoard(move: number, max: number = 0) {
        if (move == 1) {
            board.chess.move(history.current[moving]);
        } else if (move == -1) {
            board.chess.undo();
        }
        setMoving(moving => moving + move);

        if (max == 1) {
            for (const it of history.current) {
                board.chess.move(it);
            }

            setMoving(moving => history.current.length);
        } else if (max == -1) {
            board.chess.reset();
            setMoving(0);
        }
        board.setBoard(board.chess.board());
    }

    function getHeigh() {
        return (parseFloat(moves.current[moving]) * -1 + 25) * 2 + "%";
    }

    function getMoves() {
        return board.chess.pgn().split(/\b\d+\b\./).filter((value) => { return value != "" }).map(value => { return value.trim() });
    }

    return (
        <main className="flex min-h-screen items-center justify-center gap-2">

            {
                progess < 100 - 1 &&
                <div className="flex flex-col p-3 border rounded-lg gap-2 w-1/4 text-center">
                    <div>Loading</div>
                    <div className="progess-bar w-full border rounded-md">
                        <div className="progess bg-green-400" style={{ width: progess + "%" }}>
                            {progess.toFixed(0) + "%"}
                        </div>
                    </div>
                </div>
            }

            {
                progess >= 100 - 1 &&
                <>
                    <main className="flex flex-col items-center justify-start gap-2 w-5 xl:h-[48rem] lg:h-[32rem] md:h-[24rem] sm:h-[16rem] border rounded-md overflow-hidden">
                        <div className="bg-[#777] w-full" style={{ height: getHeigh() }}></div>
                    </main>
                    <main className="flex flex-col items-center justify-center gap-2">
                        <UserPanel board={board} time={{ w: 600, b: 600 }} icon="robot" user="Stockfish" color="w" value={board.missingPieces.white > board.missingPieces.black ? "+" + (board.missingPieces.white - board.missingPieces.black) : ""} />

                        <div className="chessBoard border-2 border-black select-none">
                            {
                                board.chess_board.map((y, indexY) =>
                                    <div className="grid grid-cols-8" key={indexY}>
                                        {
                                            board.chess_board[indexY].map((x, indexX) =>
                                                <div className={"xl:w-24 xl:h-24 lg:w-16 lg:h-16 md:w-12 md:h-12 sm:w-8 sm:h-8 relative chessPlate" + ((indexY + indexX) % 2 == 0 ? "-dark" : "")} key={board.boardLabels[1][indexX] + board.boardLabels[0][indexY]} >

                                                    <div className="relative z-10 cursor-pointer">
                                                        {board.chess_board[indexY][indexX]?.getIcon()}
                                                    </div>

                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            }
                        </div>

                        <UserPanel board={board} time={{ w: 600, b: 600 }} icon="user" user="User" color="b" value={board.missingPieces.black > board.missingPieces.white ? "+" + (board.missingPieces.black - board.missingPieces.white) : ""} />
                    </main>
                    <main className="flex flex-col items-center justify-start gap-2 w-1/4 xl:h-[48rem] lg:h-[32rem] md:h-[24rem] sm:h-[16rem] border rounded-md overflow-hidden">
                        <div className="flex justify-between w-full px-5 pt-2">
                            <div>
                                Depth {board.depth}
                            </div>
                            <div>
                                Level {board.level}
                            </div>
                        </div>
                        <div className="border w-full text-center p-2">
                            Moves:
                        </div>
                        <div className="flex flex-col w-full h-full max-h-full items-start overflow-y-auto">
                            {getMoves().map((move, index) => {
                                return <div key={index} className="w-full flex gap-10">
                                    <div className="w-4 px-1">
                                        {index + 1}.
                                    </div>

                                    <div className="flex justify-start items-center w-12">
                                        {
                                            board.getPieceByType(move.split(" ")[0][0].toLocaleLowerCase()) != "pawn" && move.split(" ")[0].length > 2 &&
                                            <Image src={`/pieces/${board.getPieceByType(move.split(" ")[0][0].toLocaleLowerCase())}-${"w"}.svg`} alt={board.getPieceByType(move.split(" ")[0][0].toLocaleLowerCase())} width={20} height={20} />
                                        }
                                        {
                                            board.getPieceByType(move.split(" ")[0][0].toLocaleLowerCase()) != "pawn" && move.split(" ")[0].length > 2 ?
                                                <div className="text-md">{move.split(" ")[0].slice(1)}</div> :
                                                <div className="text-md">{move.split(" ")[0]}</div>
                                        }
                                    </div>
                                    {
                                        move.split(" ").length > 1 &&
                                        <div className="flex justify-start items-center w-12">
                                            {
                                                board.getPieceByType(move.split(" ")[1][0].toLocaleLowerCase()) != "pawn" && move.split(" ")[1].length > 2 &&
                                                <Image src={`/pieces/${board.getPieceByType(move.split(" ")[1][0].toLocaleLowerCase())}-${"b"}.svg`} alt={board.getPieceByType(move.split(" ")[1][0].toLocaleLowerCase())} width={20} height={20} />
                                            }
                                            {
                                                board.getPieceByType(move.split(" ")[1][0].toLocaleLowerCase()) != "pawn" && move.split(" ")[1].length > 2 ?
                                                    <div className="text-md">{move.split(" ")[1].slice(1)}</div> :
                                                    <div className="text-md">{move.split(" ")[1]}</div>
                                            }
                                        </div>
                                    }

                                </div>
                            })}
                        </div>
                        <div className="flex items-center ">
                            <Image src={ArrowMaxLeft} width={32} height={32} alt="" className="cursor-pointer" onClick={() => { setBoard(0, -1) }}></Image>
                            <Image src={ArrowLeft} width={32} height={32} alt="" onClick={() => { setBoard(-1) }} className="cursor-pointer"></Image>
                            <Image src={ArrowRight} width={32} height={32} alt="" onClick={() => { setBoard(1) }} className="cursor-pointer"></Image>
                            <Image src={ArrowMaxRight} width={32} height={32} alt="" className="cursor-pointer" onClick={() => { setBoard(0, 1) }}></Image>
                        </div>
                    </main>
                </>
            }
        </main>
    );
}

export function UserPanel({ board, color, value, user, icon, time }: { board: Board, color: "b" | "w", value: string, user: string, icon: string, time: { w: number, b: number } }) {
    return (
        <div className="flex xl:w-[48rem] lg:w-[32rem] md:w-[24rem] sm:w-[16rem] items-center justify-between gap-2">
            <div className="flex gap-2 items-center">
                <div className="flex border border-gray-500 rounded-md w-10 h-10 pt-2 bg-gray-300 ">
                    <Image src={"images/" + icon + ".svg"} alt={user} width={100} height={100}></Image>
                </div>
                <div className="flex flex-col">
                    <div>{user} ({parseInt(board.level) * 150})</div>
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