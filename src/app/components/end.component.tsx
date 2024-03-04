import PieceIcon from "@/assets/pieces/icon"
import { ChessPiece } from "@/services/chess.service"
import Link from "next/link"

export default function End() {
    return (
        <div className="flex justify-center items-center w-screen h-screen absolute z-50 bg-[#00000070]">
            <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow text-center items-center flex flex-col gap-2">
                <div className="flex">
                    <PieceIcon piece={new ChessPiece("KING", "b", "a1")} className="flex justify-center"></PieceIcon>
                    <PieceIcon piece={new ChessPiece("QUEEN", "w", "a1")} className="flex justify-center"></PieceIcon>
                </div>
                <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 ">Game is over</h5>

                <div className="inline-flex rounded-md shadow-sm" role="group">
                    <Link href={"/"}>
                        <button type="button" className={"inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-s-lg " + ("hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-700 focus:text-green-700 ")}>
                            <PieceIcon piece={new ChessPiece("KING", "w", "a1")} className="flex justify-center max-w-8"></PieceIcon>
                            New Game
                        </button>
                    </Link>
                    <Link href={"/analysis"}>

                        <button type="button" className={"inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-e-lg " + ("hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-700 focus:text-green-700 ")}>
                            <PieceIcon piece={new ChessPiece("KING", "b", "a1")} className="flex justify-center max-w-8"></PieceIcon>
                            Analysis
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    )
}