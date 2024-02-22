"use client";
import { BoardContext } from "@/services/context";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";


export default function Analizer() {

    const { board } = useContext(BoardContext);

    useEffect(() => {
        console.log(board.chess.history());
    });

    return (
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
    );
}