import { ChessPiece } from "@/services/chess.service"
import Image from "next/image"
import { useRef } from "react";

export default function PieceIcon({piece, onClick, className}: {piece: ChessPiece | null, onClick?: () => void, className?: string}){

    const element = useRef<HTMLDivElement>(null);

    function onDragStart(e: React.DragEvent<HTMLDivElement>){
        setTimeout(() => {
            if(element.current != null){
                element.current.style.display = 'none';
            }
        }, 0);
    }
    function onDragStop(e: React.DragEvent<HTMLDivElement>){
        setTimeout(() => {
            if(element.current != null){
                element.current.style.display = 'flex';
            }
        }, 0);
    }
    if(piece == null){
        return <></>
    }

    return (
        <div ref={element} className="w-full h-full relative" onClick={onClick} draggable onDragStart={onDragStart} onDragEnd={onDragStop} >
            <Image className={className} src={`/pieces/${piece.kind}-${piece.color}.svg`} alt={piece.kind as string} width={100} height={100} />
        </div>
    )
}