import PieceIcon from "@/assets/pieces/icon"

export default function Promotion({ x, y, prom, color }: { x: number, y: number, prom: (prom: "Q" | "R" | "N" | "B") => void, color: "w" | "b" }) {
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