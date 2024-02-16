

// export default class ChessAi {

//     board: Board;
//     AImoves: string = "";

//     stockfish = new Worker('stockfish.js');

//     constructor(board: Board) {
//         console.log("ChessAi constructor");
//         this.board = board;

//     }

//     public startAiMessage() {
//         return this.stockfish;
//     }

//     public sendAI(message: any){
//         this.stockfish.postMessage(message);
//     }

//     public startChessMatch() {
//         this.stockfish.postMessage('uci'); // Initialize the UCI (Universal Chess Interface)
//         this.stockfish.postMessage('ready'); // Initialize the UCI (Universal Chess Interface)
//     }

//     public readBook() {
//         var bookRequest = new XMLHttpRequest();
//         bookRequest.open('GET', 'book.bin', true);
//         bookRequest.responseType = "arraybuffer";
//         bookRequest.onload = (event) => {
//             if (bookRequest.status == 200){
//                 this.sendAI({ book: bookRequest.response });
//             }
//         };
//         bookRequest.send(null);
//     }

//     public nextMove(): any {
//         const fen = this.board.getBoardFEN();
//         console.log(fen);
//         this.stockfish.postMessage("position fen " + fen);
//         this.stockfish.postMessage("go depth 10");

//         return "moved";
//     }
// }