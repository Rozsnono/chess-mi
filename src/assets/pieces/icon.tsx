import { ChessPiece } from "@/services/chess.service"
import Image from "next/image"

export default function PieceIcon({name, color, onClick, className}: {name: string | ChessPiece, color: string, onClick?: () => void, className?: string}){
    return (
        <div className="w-full h-full relative" onClick={onClick}>
            <Image className={className} draggable="false" src={`/pieces/${name}-${color}.svg`} alt={name as string} width={100} height={100} />
        </div>
    )
}