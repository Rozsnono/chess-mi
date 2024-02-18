import Image from "next/image"

export default function PieceIcon({name, color, onClick, className}: {name: string, color: string, onClick?: () => void, className?: string}){
    return (
        <div className="w-24 h-24 relative" onClick={onClick}>
            <Image className={className} draggable="false" src={`/pieces/${name}-${color}.svg`} alt={name} width={100} height={100} />
        </div>
    )
}