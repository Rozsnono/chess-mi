"use client";
import React from "react";
import PieceIcon from "@/assets/pieces/icon";

type Piece = "rook" | "knight" | "bishop" | "queen" | "king" | "pawn";
type Color = "b" | "w";


export default class Board {
    boardMatrix: Array<Array<ChessPiece | null>> = [
        [new Rook("b"), new Knight("b"), new Bishop("b"), new Queen("b"), new King("b"), new Bishop("b"), new Knight("b"), new Rook("b")],
        [new Pawn("b", "down"), new Pawn("b", "down"), new Pawn("b", "down"), new Pawn("b", "down"), new Pawn("b", "down"), new Pawn("b", "down"), new Pawn("b", "down"), new Pawn("b", "down")],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [new Pawn("w", "up"), new Pawn("w", "up"), new Pawn("w", "up"), new Pawn("w", "up"), new Pawn("w", "up"), new Pawn("w", "up"), new Pawn("w", "up"), new Pawn("w", "up")],
        [new Rook("w"), new Knight("w"), new Bishop("w"), new Queen("w"), new King("w"), new Bishop("w"), new Knight("w"), new Rook("w")]
    ];

    checkPlacesForKing: Array<Array<Color | "both" | undefined>> = [[]];

    chessBoardX = [8, 7, 6, 5, 4, 3, 2, 1];
    chessBoardY = ["A", "B", "C", "D", "E", "F", "G", "H"];



    turn: Color;

    onCheckTitle: { x: number, y: number }[] = [];
    missingPieces: ChessPiece[] = [];

    constructor() {
        console.log("board created");
        this.setCheckPlacesForKings();
        this.turn = "w";
    }


    move(x: number, y: number, newX: number, newY: number) {
        if (this.boardMatrix[y][x]?.color != this.turn) return;
        this.boardMatrix[newY][newX] = this.boardMatrix[y][x];
        this.boardMatrix[y][x] = null;
        
        console.log(`${this.chessBoardX[y]}${this.chessBoardY[x]} moved to ${this.chessBoardX[newY]}${this.chessBoardY[newX]}`);
        return this.checkIfCheck();
    }

    castle(x: number, y: number, newX: number, newY: number, direction: "left" | "right") {
        switch (direction) {
            case "left":
                this.boardMatrix[newY][newX] = this.boardMatrix[y][x];
                this.boardMatrix[newY][newX + 1] = this.boardMatrix[y][0];
                this.boardMatrix[y][0] = null;
                this.boardMatrix[y][x] = null;
                console.log("O-O-O")
                break;
            case "right":
                this.boardMatrix[newY][newX] = this.boardMatrix[y][x];
                this.boardMatrix[newY][newX - 1] = this.boardMatrix[y][7];
                this.boardMatrix[y][7] = null;
                this.boardMatrix[y][x] = null;
                console.log("O-O")
                break;
        }

        this.finishedMove();
    }

    finishedMove() {
        if (this.turn == "w") {
            this.turn = "b";
        } else {
            this.turn = "w";
        }
    }

    promotion(x: number, y: number, prom: "queen" | "rook" | "knight" | "bishop") {
        switch (prom) {
            case "queen":
                this.boardMatrix[y][x] = new Queen(this.boardMatrix[y][x]?.color as Color);
                break;
            case "rook":
                this.boardMatrix[y][x] = new Rook(this.boardMatrix[y][x]?.color as Color);
                break;
            case "knight":
                this.boardMatrix[y][x] = new Knight(this.boardMatrix[y][x]?.color as Color);
                break;
            case "bishop":
                this.boardMatrix[y][x] = new Bishop(this.boardMatrix[y][x]?.color as Color);
                break;
        }
    }

    GetPieceIconByCord({ x, y }: { x: number, y: number }): JSX.Element {
        if (this.boardMatrix[y][x] == null) {
            return <></>
        } else {
            const name = this.boardMatrix[y][x]?.kind as string;
            const color = this.boardMatrix[y][x]?.color as string;
            return PieceIcon({ name: name, color: color });
        };
    }

    getAvailableMoves(x: number, y: number): { x: number, y: number, attack?: boolean | "king", defence?: boolean }[] {
        if (this.boardMatrix[y][x] == null) return [];
        const availableMoves = this.boardMatrix[y][x]?.availableMoves(this, x, y) as { x: number, y: number }[];
        if (availableMoves.length == 0) return [];
        return availableMoves;
    }

    getKingByColor(color: Color): ChessPiece | null {
        for (let x = 0; x < this.boardMatrix.length; x++) {
            for (let y = 0; y < this.boardMatrix[x].length; y++) {
                if (this.boardMatrix[y][x]?.kind == "king" && this.boardMatrix[y][x]?.color == color) {
                    return this.boardMatrix[y][x] as ChessPiece;
                }
            }
        }
        return null;
    }

    getKingCordByColor(color: Color): { x: number, y: number } | null {
        for (let x = 0; x < this.boardMatrix.length; x++) {
            for (let y = 0; y < this.boardMatrix[x].length; y++) {
                if (this.boardMatrix[y][x]?.kind == "king" && this.boardMatrix[y][x]?.color == color) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    getPieceByCord(x: number, y: number): ChessPiece | null {
        return this.boardMatrix[y][x];
    }

    private setCheckPlacesForKings() {
        this.checkPlacesForKing = [[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]];

        for (let x = 0; x < this.boardMatrix.length; x++) {
            for (let y = 0; y < this.boardMatrix[x].length; y++) {
                const piece = this.boardMatrix[y][x];
                let moves = [];
                if (piece == null) continue;
                if (piece.kind == "king") {
                    moves = (piece as King).attackMoves(this, x, y);
                };
                if (piece.kind == "pawn"){
                    moves = (piece as Pawn).avaiableAttackMoves(this, x, y, true);
                }else{
                    moves = piece.availableMoves(this, x, y);
                }
                if (moves == undefined) continue;
                moves.forEach(move => {
                    if(move.x == x && move.y == y) return;
                    this.checkPlacesForKing[move.y][move.x] = this.checkPlacesForKing[move.y][move.x] == null || this.checkPlacesForKing[move.y][move.x] == this.boardMatrix[y][x]?.color ? this.boardMatrix[y][x]?.color : "both";
                });
            }
        }
        console.log(this.checkPlacesForKing);
    }

    private checkIfCheck(){
        
        this.setCheckPlacesForKings();
        this.finishedMove();

        const b_king_cords = this.getKingCordByColor("b");
        const w_king_cords = this.getKingCordByColor("w");

        if(b_king_cords == null || w_king_cords == null) return;
        if(this.checkPlacesForKing[b_king_cords.y][b_king_cords.x] == "w" || this.checkPlacesForKing[b_king_cords.y][b_king_cords.x] == "both"){
            return "w";
        }
        if(this.checkPlacesForKing[w_king_cords.y][w_king_cords.x] == "b" || this.checkPlacesForKing[w_king_cords.y][w_king_cords.x] == "both"){
            return "b";
        }
    }
}

export class ChessPiece {
    kind: Piece;
    color: Color;
    facing?: "up" | "down";

    public moveMatrix: Array<Array<boolean>> = [[false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false]];

    moveMatrixReset() {
        this.moveMatrix = [[false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false]];
    }

    constructor(kind: Piece, color: Color, x: number = 0, y: number = 0) {
        this.kind = kind;
        this.color = color;
    }
    availableMoves(board: Board, x: number, y: number): { x: number, y: number, attack?: boolean | "king", defence?: boolean }[] { return [] }

    protected getAvailableMovesBySteps(direction: number, x: number, y: number, index: number, moves: { x: number, y: number, attack?: boolean | "king", defence?: boolean }[], board: Board): { x: number, y: number } | undefined {
        let calcX = 0;
        let calcY = 0;
        let dirX = 0;
        let dirY = 0;

        switch (direction) {
            case 0:
                calcX = x - index;
                calcY = y + 0;
                dirX = x - index + 1;
                dirY = y + 0;
                break;
            case 1:
                calcX = x - index;
                calcY = y - index;
                dirX = x - index + 1;
                dirY = y - index + 1;
                break;
            case 2:
                calcX = x + 0;
                calcY = y - index;
                dirX = x + 0;
                dirY = y - index + 1;
                break;
            case 3:
                calcX = x + index;
                calcY = y - index;
                dirX = x + index - 1;
                dirY = y - index + 1;
                break;
            case 4:
                calcX = x + index;
                calcY = y - 0;
                dirX = x + index - 1;
                dirY = y - 0;
                break;
            case 5:
                calcX = x + index;
                calcY = y + index;
                dirX = x + index - 1;
                dirY = y + index - 1;
                break;
            case 6:
                calcX = x - 0;
                calcY = y + index;
                dirX = x - 0;
                dirY = y + index - 1;
                break;
            case 7:
                calcX = x - index;
                calcY = y + index;
                dirX = x - index + 1;
                dirY = y + index - 1;
                break;

        }

        if (index != 1 && (moves.filter(move => move.x == dirX && move.y == dirY).length == 0 || moves.filter(move => move.x == dirX && move.y == dirY)[0].attack == true || moves.filter(move => move.x == dirX && move.y == dirY)[0].defence == true)) { return };
        if (calcX < 0 || calcX > 7 || calcY < 0 || calcY > 7) { return };
        if (board.boardMatrix[calcY][calcX] == null) {
            moves.push({ x: calcX, y: calcY });
        } else {
            if (board.boardMatrix[calcY][calcX]?.color != this.color) {
                if (board.boardMatrix[calcY][calcX]?.kind == "king") {
                    moves.push({ x: calcX, y: calcY, attack: "king" });
                    this.AttackingKing(direction, index, x, y, moves);
                } else {
                    moves.push({ x: calcX, y: calcY, attack: true });
                }
            } else {
                moves.push({ x: calcX, y: calcY, defence: true });
            }
        }
    }

    private AttackingKing(direction: number, dis: number, x: number, y: number, moves: { x: number, y: number, attack?: boolean | "king", defence?: boolean }[]) {
        for (let distance = 0; distance < dis; distance++) {
            switch (direction) {
                case 0:
                    const find = moves.filter(move => move.x == x - distance && move.y == y);
                    moves[moves.indexOf(find[0])].attack = "king";
                    break;
                case 1:
                    const find1 = moves.filter(move => move.x == x - distance && move.y == y - distance);
                    moves[moves.indexOf(find1[0])].attack = "king";
                    break;
                case 2:
                    const find2 = moves.filter(move => move.x == x && move.y == y - distance);
                    moves[moves.indexOf(find2[0])].attack = "king";
                    break;
                case 3:
                    const find3 = moves.filter(move => move.x == x + distance && move.y == y - distance);
                    moves[moves.indexOf(find3[0])].attack = "king";
                    break;
                case 4:
                    const find4 = moves.filter(move => move.x == x + distance && move.y == y);
                    moves[moves.indexOf(find4[0])].attack = "king";
                    break;
                case 5:
                    const find5 = moves.filter(move => move.x == x + distance && move.y == y + distance);
                    moves[moves.indexOf(find5[0])].attack = "king";
                    break;
                case 6:
                    const find6 = moves.filter(move => move.x == x && move.y == y + distance);
                    moves[moves.indexOf(find6[0])].attack = "king";
                    break;
                case 7:
                    const find7 = moves.filter(move => move.x == x - distance && move.y == y + distance);
                    moves[moves.indexOf(find7[0])].attack = "king";
                    break;
            }


        }
    }

    protected getAvailableMovesByStepsForHouse(direction: number, x: number, y: number, index: number, moves: { x: number, y: number, attack?: boolean | "king", defence?: boolean }[], board: Board): { x: number, y: number } | undefined {
        let calcX = 0;
        let calcY = 0;

        switch (direction) {
            case 0:
                calcX = x - 2;
                calcY = y + 1;
                break;
            case 1:
                calcX = x - 2;
                calcY = y - 1;
                break;
            case 2:
                calcX = x - 1;
                calcY = y - 2;
                break;
            case 3:
                calcX = x + 1;
                calcY = y - 2;
                break;
            case 4:
                calcX = x + 2;
                calcY = y - 1;
                break;
            case 5:
                calcX = x + 2;
                calcY = y + 1;
                break;
            case 6:
                calcX = x + 1;
                calcY = y + 2;
                break;
            case 7:
                calcX = x - 1;
                calcY = y + 2;
                break;

        }
        if (calcX < 0 || calcX > 7 || calcY < 0 || calcY > 7) { return };
        if (board.boardMatrix[calcY][calcX] == null) {
            moves.push({ x: calcX, y: calcY });
        } else {
            if (board.boardMatrix[calcY][calcX]?.color != this.color) {
                if (board.boardMatrix[calcY][calcX]?.kind == "king") {
                    moves.push({ x: calcX, y: calcY, attack: "king" });
                    this.AttackingKing(direction, index, x, y, moves);
                } else {
                    moves.push({ x: calcX, y: calcY, attack: true });
                }
            } else {
                moves.push({ x: calcX, y: calcY, defence: true });
            }
        }
    }

    availableMovesOnChess(board: Board, x: number, y: number): { x: number, y: number }[] {
        return [];
    }
}


class Pawn extends ChessPiece {
    facing: "up" | "down";
    constructor(color: Color, facing: "up" | "down" = "up") {
        super("pawn", color);
        this.facing = facing;
    }

    availableMoves(board: Board, x: number, y: number): { x: number, y: number }[] {
        let moves: any = [{ x: x, y: y }];
        switch (this.facing) {
            case "up":

                try {
                    if (board.boardMatrix[y - 1][x - 0] == null) {
                        moves.push({ x: x - 0, y: y - 1 });
                        if (y == 6) {
                            if (board.boardMatrix[y - 2][x - 0] == null) {
                                moves.push({ x: x - 0, y: y - 2 });
                            }
                        }
                    }

                } catch (error) {
                    break;
                }
                break;
            case "down":
                try {
                    if (board.boardMatrix[y + 1][x + 0] == null) {
                        moves.push({ x: x + 0, y: y + 1 });
                        if (y == 1) {
                            if (board.boardMatrix[y + 2][x + 0] == null) {
                                moves.push({ x: x + 0, y: y + 2 });
                            }
                        }
                    }
                } catch (error) {
                    break;
                }
                break;
        }

        moves.push(...this.avaiableAttackMoves(board, x, y));

        return moves;
    }

    avaiableAttackMoves(board: Board, x: number, y: number, forKing: boolean = false): { x: number, y: number, attack?: boolean | string }[] {
        const moves = [];
        switch (this.facing) {
            case "up":
                if (y - 1 > -1 && x - 1 > -1) {
                    if ((board.boardMatrix[y - 1][x - 1] != null && board.boardMatrix[y - 1][x - 1]?.color != this.color) || forKing) {
                        moves.push({ x: x - 1, y: y - 1, attack: board.boardMatrix[y - 1][x - 1]?.kind == "king" ? "king" : true });
                    }
                }
                if (y - 1 > -1 && x + 1 < 8) {
                    if ((board.boardMatrix[y - 1][x + 1] != null && board.boardMatrix[y - 1][x + 1]?.color != this.color) || forKing) {
                        moves.push({ x: x + 1, y: y - 1, attack: board.boardMatrix[y - 1][x + 1]?.kind == "king" ? "king" : true });
                    }
                }
                break;
            case "down":
                if (y + 1 < 8 && x - 1 > -1) {
                    if ((board.boardMatrix[y + 1][x - 1] != null && board.boardMatrix[y + 1][x - 1]?.color != this.color) || forKing) {
                        moves.push({ x: x - 1, y: y + 1, attack: board.boardMatrix[y + 1][x - 1]?.kind == "king" ? "king" : true });
                    }
                }
                if (y + 1 < 8 && x + 1 < 8) {

                    if ((board.boardMatrix[y + 1][x + 1] != null && board.boardMatrix[y + 1][x + 1]?.color != this.color) || forKing) {
                        moves.push({ x: x + 1, y: y + 1, attack: board.boardMatrix[y + 1][x + 1]?.kind == "king" ? "king" : true });
                    }
                }
                break;
        }

        return moves;
    }
}

class Rook extends ChessPiece {
    constructor(color: Color) {
        super("rook", color);
    }

    override availableMoves(board: Board, x: number, y: number): { x: number, y: number, attack?: boolean | "king" }[] {
        let moves: any = [{ x: x, y: y }];
        for (let i = 1; i < 8; i++) {
            for (let r = 0; r < 8; r += 2) {
                const move = this.getAvailableMovesBySteps(r, x, y, i, moves, board);
                if (move == undefined) continue;
                moves.push(move);
            }
        }
        return moves;
    }
}

class Knight extends ChessPiece {
    constructor(color: Color) {
        super("knight", color);
    }

    override availableMoves(board: Board, x: number, y: number): { x: number, y: number }[] {
        let moves: any = [{ x: x, y: y }];
        const i = 1;
        for (let r = 0; r < 8; r++) {
            const move = this.getAvailableMovesByStepsForHouse(r, x, y, i, moves, board);
            if (move == undefined) continue;
            moves.push(move);
        }
        return moves;
    }
}

class Bishop extends ChessPiece {
    constructor(color: Color) {
        super("bishop", color);
    }

    override availableMoves(board: Board, x: number, y: number): { x: number, y: number }[] {
        let moves: any = [{ x: x, y: y }];
        for (let i = 1; i < 8; i++) {
            for (let r = 1; r < 8; r += 2) {
                const move = this.getAvailableMovesBySteps(r, x, y, i, moves, board);
                if (move == undefined) continue;
                moves.push(move);
            }
        }
        return moves;
    }
}

class Queen extends ChessPiece {
    constructor(color: Color) {
        super("queen", color);
    }

    override availableMoves(board: Board, x: number, y: number): { x: number, y: number }[] {
        let moves: any = [{ x: x, y: y }];
        for (let i = 1; i < 8; i++) {
            for (let r = 0; r < 8; r++) {
                const move = this.getAvailableMovesBySteps(r, x, y, i, moves, board);
                if (move == undefined) continue;
                moves.push(move);
            }
        }
        return moves;
    }

}

class King extends ChessPiece {
    moved: boolean;
    constructor(color: Color, moved: boolean = false) {
        super("king", color);
        this.moved = moved;
    }

    override availableMoves(board: Board, x: number, y: number): { x: number, y: number, castle?: "left" | "right" }[] {
        let moves: any = [];
        const i = 1;
        for (let r = 0; r < 8; r++) {
            const move = this.getAvailableMovesBySteps(r, x, y, i, moves, board);
            if (move == undefined) continue;
            moves.push(move);
        }

        if (!this.moved) {
            if (board.boardMatrix[y][0]?.kind == "rook" && (board.boardMatrix[y][0] as Rook).color == this.color) {
                if (board.boardMatrix[y][1] == null && board.boardMatrix[y][2] == null && board.boardMatrix[y][3] == null) {
                    moves.push({ x: 2, y: y, castle: "left" });
                }
            }
            if (board.boardMatrix[y][0]?.kind == "rook" && (board.boardMatrix[y][0] as Rook).color == this.color) {
                if (board.boardMatrix[y][6] == null && board.boardMatrix[y][5] == null) {
                    moves.push({ x: 6, y: y, castle: "right" });
                }
            }
        }
        
        moves = moves.filter((move: any) => { return board.checkPlacesForKing[move.y][move.x] == undefined || (board.checkPlacesForKing[move.y][move.x] != "both" && board.checkPlacesForKing[move.y][move.x] == this.color) });

        return moves;
    }

    attackMoves(board: Board, x: number, y: number): { x: number, y: number }[] {
        let moves: any = [];
        const i = 1;
        for (let r = 0; r < 8; r++) {
            const move = this.getAvailableMovesBySteps(r, x, y, i, moves, board);
            if (move == undefined) continue;
            moves.push(move);
        }
        return moves;
    }
}