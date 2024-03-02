import PieceIcon from "@/assets/pieces/icon"
import { ChessPiece } from "@/services/chess.service"

export default function Promotion({ x, y, prom, color }: { x: number, y: number, prom: (prom: "Q" | "R" | "N" | "B") => void, color: "w" | "b" }) {
    return (
        <main className={"absolute top-0 left-0 w-24 h-24 z-50 overflow-y-scroll overflow-x-hidden border-2 chessPlate" + ((y + x) % 2 == 0 ? "-dark" : "")}>
            <div className="flex flex-col justify-center items-center ">
                <PieceIcon piece={new ChessPiece("queen", color, "a1")}  className="cursor-pointer" onClick={() => { prom("Q") }} />
                <PieceIcon piece={new ChessPiece("rook", color, "a1")}   className="cursor-pointer" onClick={() => { prom("R") }} />
                <PieceIcon piece={new ChessPiece("bishop", color, "a1")} className="cursor-pointer" onClick={() => { prom("N") }} />
                <PieceIcon piece={new ChessPiece("knight", color, "a1")} className="cursor-pointer" onClick={() => { prom("B") }} />
            </div>
        </main>
    )
}