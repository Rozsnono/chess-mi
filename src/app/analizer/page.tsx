"use client";
import { BoardContext } from "@/services/context";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";


export default function Analizer() {

    const { board, evaler } = useContext(BoardContext);

    useEffect(() => {
        evaler.postMessage("uci");
        evaler.postMessage("isready");
        evaler.postMessage("ucinewgame");
        evaler.postMessage("setoption name Skill Level value 20");
        analize();

        evaler.onmessage = (event: any) => {
            if (progressRef.current < 100) {
                if (event.data.includes("Total Evaluation:")) {
                    console.log(event.data);
                    const score = event.data.split("Total Evaluation:")[1].split("(")[0].trim();
                    setProgess(progess => progess + 100 / board.chess.history().length);
                    progressRef.current = progressRef.current + 100 / board.chess.history().length;
                    moves.current.push({ move: board.chess.history()[index.current - 1], score: score });
                    analize();

                    console.log(moves.current);
                }
            }
            else {
                setProgess(100);
                moves.current = moves.current.filter((move: any) => { return move.move != undefined });
            }
        };
    }, []);

    function get_moves()
    {
        var moves = '';
        var history = board.chess.history({verbose: true});
        
        for(var i = 0; i < history.length; ++i) {
            var move = history[i];
            moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
        }
        
        return moves;
    }

    const index = useRef(0);
    const progressRef = useRef(0);
    const moves = useRef<any>([]);

    function analize() {
        let moves = board.chess.history();
        console.log("position startpos moves " + moves.slice(0, index.current).join(" "));
        evaler.postMessage("position startpos moves " + get_moves());
        evaler.postMessage("eval");
        index.current++;
    }

    const [progess, setProgess] = useState(0);

    return (
        <main className="flex w-screen h-screen absolute items-center justify-center">
            {
                progess < 100 ? <div className="flex flex-col p-3 border rounded-lg gap-2 w-1/4 text-center">
                    <div>Loading</div>
                    <div className="progess-bar w-full border rounded-md">
                        <div className="progess bg-green-400" style={{ width: progess + "%" }}>
                            {progess.toFixed(0) + "%"}
                        </div>
                    </div>
                </div> :
                    <main className="flex flex-col items-center justify-start gap-2 w-1/4 xl:h-[48rem] lg:h-[32rem] md:h-[24rem] sm:h-[16rem] border rounded-md overflow-hidden">
                        <div className="border w-full text-center p-2">
                            Lépések:
                        </div>
                        <div className="flex flex-wrap w-full h-fit max-h-full items-start overflow-y-auto">
                            {moves.current.map((move: any, index: number) => {
                                return <div key={index} className={"flex justify-between px-4 items-center w-1/2 border" + (index % 2 == 1 ? " bg-gray-200 border-gray-500" : "")}>
                                    <div className="flex justify-center items-center ">
                                        {
                                            board.getPieceByType(move.move[0].toLocaleLowerCase()) != "pawn" && move.move.length > 2 &&
                                            <Image src={`/pieces/${board.getPieceByType(move.move[0].toLocaleLowerCase())}-${index % 2 == 1 ? "b" : "w"}.svg`} alt={board.getPieceByType(move.move[0].toLocaleLowerCase())} width={20} height={20} />
                                        }
                                        {
                                            board.getPieceByType(move.move[0].toLocaleLowerCase()) != "pawn" && move.move.length > 2 ?
                                                <div className="text-md">{move.move.slice(1)}</div> :
                                                <div className="text-md">{move.move}</div>
                                        }
                                    </div>
                                    <div>
                                        {
                                            move.score
                                        }
                                    </div>
                                </div>
                            })}
                        </div>
                    </main>
            }
        </main>
    );
}