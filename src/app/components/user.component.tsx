"use client";
import Image from "next/image";
import Board from "@/services/chess.service";
import Clock from "@/assets/clock.icon.svg"

export function UserPanel({ board, color, value, user, icon, time, level }: { board: Board, color: "b" | "w", value: string, user: string, icon: string, time: { w: number, b: number }, level: boolean }) {
    return (
        <div className="flex 2xl:w-[48rem] xl:w-[32rem] lg:w-[32rem] md:w-[24rem] sm:w-[16rem] items-center justify-between gap-2">
            <div className="flex gap-2 items-center">
                <div className="flex border border-gray-500 rounded-md w-10 h-10 pt-2 bg-gray-300 ">
                    <Image src={"images/" + icon + ".svg"} alt={user} width={100} height={100}></Image>
                </div>
                <div className="flex flex-col">
                    <div>{user} {level && (parseInt(board.level) * 150)}</div>
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
            <div className="flex gap-2 border border-gray-500 rounded-md w-20 h-10 text-lg bg-gray-300 justify-center items-center p-2">
                {
                    color != board.turn &&
                    <Image src={Clock} width={64} height={64} alt="clock"></Image>
                }
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