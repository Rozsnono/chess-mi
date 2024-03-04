"use client";
import { BoardContext } from "@/services/context";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";

import ArrowLeft from "@/assets/arrow.left.icon.svg";
import ArrowRight from "@/assets/arrow.right.icon.svg";
import ArrowMaxLeft from "@/assets/arrow.max.left.icon.svg";
import ArrowMaxRight from "@/assets/arrow.max.right.icon.svg";
import PlusIcon from "@/assets/plus.icon.svg";
import { useRouter } from "next/navigation";
import { UserPanel } from "../components/user.component";
import ChessBoardWhite from "../components/white.chessboard";
import ChessBoardBlack from "../components/black.chessboard";
import Link from "next/link";


export default function Analizer() {

    const { board, evaler } = useContext(BoardContext);
    const history = useRef(board.chess.history());
    const pgn = useRef(board.chess.pgn());
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
            if (progressRef.current < 99) {
                let score = "";
                if (event.data.includes("info depth 5")) {
                    score = (event.data.includes("mate") ? "M" : "") + event.data.split("score")[1].split(" ")[2].trim();
                    moves.current.push(score);
                    analize();
                }

            }
            else {
                setProgess(100);
                board.chess.reset();
                board.setBoard(board.chess.board());

                // moves.current = moves.current.filter((move: any) => { return move.move != undefined });
            }
        };
    }, []);


    function mapNumber(inputNumber: number) {
        if (inputNumber === 0) return 0;
        if (inputNumber === 10) return 10;
        if (inputNumber === 100) return 30;
        if (inputNumber === 3000) return 50;

        if (inputNumber >= 1 && inputNumber <= 10) {
            return (inputNumber - 1) + 1;
        } else if (inputNumber >= 51 && inputNumber <= 99) {
            return (inputNumber - 51) / 2.5 + 10;
        } else if (inputNumber >= 101 && inputNumber <= 2999) {
            return (inputNumber - 101) / 100 + 32;
        } else {
            return 0;
        }
    }

    const index = useRef(0);
    const progressRef = useRef(0);
    const moves = useRef<any>(["0"]);

    function analize() {
        try {
            setProgess(progess => progess + 100 / history.current.length);
            progressRef.current = progressRef.current + 100 / history.current.length;
            let moves = board.chess.move(history.current[index.current]);
            evaler.postMessage("position fen " + board.chess.fen());
            evaler.postMessage("go depth 5");
            // evaler.postMessage("eval");
            index.current++;
        } catch (error) {
            board.chess.reset();
            board.setBoard(board.chess.board());
            console.error(error)
            // board.chess.load(fen.current);
        }
    }

    const [progess, setProgess] = useState(0);

    const [moving, setMoving] = useState(0);

    function setBoard(move: number, max: number = 0) {
        try {
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
        } catch (error) {
            console.error(error)
        }
    }

    function getHeigh() {
        try {
            if (moving % 2 == 0) {
                if (moves.current[moving].includes("M")) return (moves.current[moving].includes("-") ? 100 : 0) + "%";
            } else {
                if (moves.current[moving].includes("M")) return (moves.current[moving].includes("-") ? 0 : 100) + "%";
            }
            const number = Math.abs(moves.current[moving])
            const height = mapNumber(number);
            return (number < 0 ? (50 - height) : (height + 50)) + "%";
        } catch (error) {

        }
    }

    function getMoves() {
        return pgn.current.split(/\b\d+\b\./).filter((value) => { return value != "" }).map(value => { return value.trim() });
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
                    <main className={"flex flex-col relative items-center justify-center gap-2 w-5 2xl:h-[48rem] xl:h-[32rem] lg:h-[32rem] md:h-[24rem] sm:h-[16rem] border rounded-md " + (board.team == "w" ? "" : " rotate-180")}>
                        <div className="w-full h-full overflow-hidden rounded-md">
                            <div className="bg-[#777] w-full" style={{ height: getHeigh() }}></div>
                        </div>
                    </main>
                    <main className="flex flex-col items-center justify-center gap-2">
                        <UserPanel board={board} level={true} time={{ w: 600, b: 600 }} icon="robot" user="Stockfish" color="w" value={board.missingPieces.white > board.missingPieces.black ? "+" + (board.missingPieces.white - board.missingPieces.black) : ""} />

                        {
                            board.team == "w" &&
                            <ChessBoardWhite board={board} reload={0} selectedStart={null} availableMoves={[]} prevMoves={{ from: "", to: "" }} check={undefined} startSelection={() => { }} move={() => { }} promote={() => { }} promotion={() => { }} />
                        }

                        {
                            board.team == "b" &&
                            <ChessBoardBlack board={board} reload={0} selectedStart={null} availableMoves={[]} prevMoves={{ from: "", to: "" }} check={undefined} startSelection={() => { }} move={() => { }} promote={() => { }} promotion={() => { }} />
                        }

                        <UserPanel board={board} level={false} time={{ w: 600, b: 600 }} icon="user" user="User" color="b" value={board.missingPieces.black > board.missingPieces.white ? "+" + (board.missingPieces.black - board.missingPieces.white) : ""} />
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

                                    <div className={"flex justify-start items-center w-16" + (history.current[moving - 1] == move.split(" ")[0] && (index * 2 == moving - 1) ? " underline" : "")}>
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
                                        <div className={"flex justify-start items-center w-16" + (history.current[moving - 1] == move.split(" ")[1] && (index * 2 + 1 == moving - 1) ? " underline" : "")}>
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
                        <div className="flex items-center justify-between w-full relative px-2 p-1">
                            <Link className="z-50" href={"/"}>
                                <button className="rounded-lg p-1 hover:bg-gray-200 hover:text-white duration-100">
                                    <Image src={PlusIcon} width={32} height={32} alt="" className="cursor-pointer"></Image>
                                </button>
                            </Link>
                            <div className="flex items-center absolute w-full justify-center z-40">
                                <Image src={ArrowMaxLeft} width={32} height={32} alt="" className="cursor-pointer hover:bg-gray-200 duration-100 rounded-lg" onClick={() => { setBoard(0, -1) }}></Image>
                                <Image src={ArrowLeft} width={32} height={32} alt="" onClick={() => { setBoard(-1) }} className="cursor-pointer hover:bg-gray-200 duration-100 rounded-lg"></Image>
                                <Image src={ArrowRight} width={32} height={32} alt="" onClick={() => { setBoard(1) }} className="cursor-pointer hover:bg-gray-200 duration-100 rounded-lg"></Image>
                                <Image src={ArrowMaxRight} width={32} height={32} alt="" className="cursor-pointer hover:bg-gray-200 duration-100 rounded-lg" onClick={() => { setBoard(0, 1) }}></Image>
                            </div>

                        </div>
                    </main>
                </>
            }
        </main>
    );
}
