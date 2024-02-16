import PieceIcon from "@/assets/pieces/icon";
import { Chess, Square } from "chess.js";


export default class Board {

    chess_board: Array<Array<ChessPiece | null>> = [];
    boardLabels: Array<Array<string>> = [["a", "b", "c", "d", "e", "f", "g", "h"], ["8", "7", "6", "5", "4", "3", "2", "1"]];

    chess = new Chess();

    constructor() {
        this.createBoard();
    }

    createBoard() {
        this.chess_board = [
            [new ChessPiece("rook", "b", "a8"), new ChessPiece("knight", "b", "b8"), new ChessPiece("bishop", "b", "c8"), new ChessPiece("queen", "b", "d8"), new ChessPiece("king", "b", "e8"), new ChessPiece("bishop", "b", "f8"), new ChessPiece("knight", "b", "g8"), new ChessPiece("rook", "b", "h8")],
            [new ChessPiece("pawn", "b", "a7"), new ChessPiece("pawn", "b", "b7"), new ChessPiece("pawn", "b", "c7"), new ChessPiece("pawn", "b", "d7"), new ChessPiece("pawn", "b", "e7"), new ChessPiece("pawn", "b", "f7"), new ChessPiece("pawn", "b", "g7"), new ChessPiece("pawn", "b", "h7")],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [new ChessPiece("PAWN", "w", "a2"), new ChessPiece("PAWN", "w", "b2"), new ChessPiece("PAWN", "w", "c2"), new ChessPiece("PAWN", "w", "d2"), new ChessPiece("PAWN", "w", "e2"), new ChessPiece("PAWN", "w", "f2"), new ChessPiece("PAWN", "w", "g2"), new ChessPiece("PAWN", "w", "h2")],
            [new ChessPiece("ROOK", "w", "a1"), new ChessPiece("KNIGHT", "w", "b1"), new ChessPiece("BISHOP", "w", "c1"), new ChessPiece("QUEEN", "w", "d1"), new ChessPiece("KING", "w", "e1"), new ChessPiece("BISHOP", "w", "f1"), new ChessPiece("KNIGHT", "w", "g1"), new ChessPiece("ROOK", "w", "h1")]
        ]
    }

    get boardMatrix() {
        return this.chess_board;
    }

    get turn() {
        return this.chess.turn();
    }

    getAvailableMoves(label: Square, type: string) {
        const moves = this.chess.moves({ square: label }).map(move => {
            if (move.includes("=") && move.includes("x")) {
                return { check: move.substring(2, 4), move: move, promotion: true };
            }
            if (move.includes("=")) {
                return { check: move.substring(0, 2), move: move, promotion: true };
            }
            if (move.includes("x")) {
                return { check: move.substring(2, 4), move: move };
            }
            if (move == "O-O") {
                if(this.turn == "w"){
                    return { check: "g1", move: move };
                }
                return { check: "g8", move: move };
            }
            if (move == "O-O-O") {
                if(this.turn == "w"){
                    return { check: "c1", move: move };
                }
                return { check: "c8", move: move };
            }
            if (move.length > 2) {
                return { check: move.substring(1, 3), move: move };
            }
            return { check: move, move: move };
        });
        return moves;
    }

    getPieceByLabel(label: string) {
        return this.chess_board.flat().filter(piece => piece?.square == label)[0];
    }

    setBoard(board: Array<Array<{ type: string, square: Square, color: "b" | "w" } | null>>) {
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                const element = board[x][y];
                if (element != null) {
                    this.chess_board[x][y] = new ChessPiece(this.getPieceByType(element.type), element.color, element.square);
                } else {
                    this.chess_board[x][y] = null;
                }
            }
        }
    }

    move(move: string) {
        try {
            this.chess.move(move);
            this.setBoard(this.chess.board());

            return this.checking();
        } catch (error) {
            return false;
        }
    }

    promotion(move: string, piece: string) {
        try {
            this.chess.move(move + "=" + piece.toUpperCase());
            this.setBoard(this.chess.board());
            return this.checking();

        } catch (error) {
            return false;
        }
    }

    private checking(): string {
        if (this.chess.isCheckmate()) {
            return "checkmate";
        }
        if (this.chess.isStalemate()) {
            return "stalemate";
        }
        if (this.chess.isInsufficientMaterial()) {
            return "insufficient material";
        }
        if (this.chess.isCheck()) {
            return "check";
        }
        return "none";
    }

    private getPieceByType(label: string): string {
        switch (label) {
            case "p":
                return "pawn";
            case "n":
                return "knight";
            case "b":
                return "bishop";
            case "r":
                return "rook";
            case "q":
                return "queen";
            case "k":
                return "king";
            default:
                return "pawn"
        }
    }

}

export class ChessPiece {
    kind: string;
    type: string;
    color: "b" | "w";
    square: Square;

    constructor(kind: string, color: "b" | "w", square: Square) {
        this.kind = kind;
        this.type = kind[0];
        this.color = color;
        this.square = square;
    }

    getIcon() {
        return (
            <PieceIcon name={this.kind.toLocaleLowerCase()} color={this.color} />
        )
    }
}