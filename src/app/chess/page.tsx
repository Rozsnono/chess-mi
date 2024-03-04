"use client";
import { BoardContext } from "@/services/context";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { Square } from "chess.js";
import { ChessPiece } from "@/services/chess.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPanel } from "../components/user.component";
import ChessBoardWhite from "../components/white.chessboard";
import ChessBoardBlack from "../components/black.chessboard";
import FlagIcon from "@/assets/flag.icon.svg";
import PlusIcon from "@/assets/plus.icon.svg";
import End from "../components/end.component";

export default function Home() {

  const { board, stockfish } = useContext(BoardContext);

  const [reload, setReload] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [selectedStart, setSelectedStart] = useState<Square | null>(null);
  const [prevMoves, setPrevMoves] = useState({ from: "", to: "" });
  const [availableMoves, setAvailableMoves] = useState<Array<{ check: string, move: string }>>([]);

  const [promote, setPromote] = useState<{ square: Square, color: "w" | "b" | undefined } | null>(null);

  const [check, setCheck] = useState<"w" | "b" | undefined>(undefined);
  const timeRef = useRef({ w: 600, b: 600 });
  const [time, setTime] = useState({ w: 600, b: 600 });

  const otherMoves = useRef([] as string[]);
  const [end, setEnd] = useState(false);
  const endRef = useRef(false);

  function getCookie(name: string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }


  useEffect(() => {

    stockfish.postMessage("uci");

    stockfish.onmessage = (event: any) => {
      if (end) return;
      if (event.data === 'uciok') {
        stockfish.postMessage('isready');
      } else if (event.data === 'readyok') {
        stockfish.postMessage('ucinewgame');
        stockfish.postMessage('setoption name Skill Level value ' + board.level);
        stockfish.postMessage('setoption name Aggressiveness value ' + parseInt(board.level) * 10);

        if (board.team == "b") {
          stockfish.postMessage('position startpos moves ' + board.chess.history().join(' '));
          stockfish.postMessage('go depth ' + board.depth);
        }
      }

      if (event.data.includes(`info depth ${board.depth} seldepth`)) {
        otherMoves.current = (event.data.split(" pv ")[1].split(" "));
      }
      if (event.data.includes("bestmove")) {
        setTimeout(() => {
          prepareNextMove(event.data.split(" ")[1]);
        }, 1000);
      }
    };

    if (document.cookie != "") {
      const cookie = getCookie("chess");
      if (cookie != null) {
        const res = JSON.parse(cookie);
        const response = board.loadGame(res.fen, res.history, res.time, res.level, res.depth, res.team);
        board.setBoard(board.chess.board());
        setTime(board.time);
        timeRef.current = board.time;
        setReload(reload + 1);
        if (response == "bot") {

          stockfish.postMessage("position fen " + board.chess.fen() + " moves " + board.chess.history().join(" "));
          stockfish.postMessage("go depth " + board.depth);

        } else {

          setCheck(undefined);
          if (response == "check") {
            setCheck(board.turn);
          } else if (response != "none") {
            endRef.current = true;
            setEnd(true);
          }
          setReload(reload + 1);
          setAvailableMoves([]);
          setSelectedStart(null);

        }
        StartTimer(true);

      }
    }
  }, []);


  function prepareNextMove(move: string) {
    StartTimer();
    const res = board.botMove([move, ...otherMoves.current])
    if (res == "none" || res == "check") {
      setCheck(undefined);
      if (res == "check") {
        setCheck(board.turn);
      }
      setReload(reload + 1);
      setAvailableMoves([]);
      setSelectedStart(null);

      const history = board.chess.history({ verbose: true });
      setPrevMoves({ from: history[history.length - 1].from, to: history[history.length - 1].to });
      audioRef.current?.play();

    } else if (res != undefined) {
      onEnd();
      setEnd(true);
      endRef.current = true;

    }
  }

  function onEnd() {
    setCheck(undefined);
    setReload(reload + 1);
    setAvailableMoves([]);
    setSelectedStart(null);
  }

  function startSelection(piece: ChessPiece | null, newPiece?: boolean) {
    if (piece == null) return;
    if (end) return;
    if (selectedStart == null || newPiece || board.getPieceByLabel(selectedStart)?.color == piece.color) {
      setSelectedStart(piece.square);
      setAvailableMoves(board.getAvailableMoves(piece.square, piece.type));
    }
  }

  async function move(move: { check: string, move: string, promotion?: boolean }, square: Square | undefined) {
    if (end) return;
    if (selectedStart == null || square == undefined) return;
    if (selectedStart == square) return;
    if (move == undefined) { return; };
    if (move.promotion) { setPromote({ square: square, color: board.getPieceByLabel(selectedStart)?.color }); return; }
    // if (board.getPieceByLabel(square) != null && board.getPieceByLabel(square)?.color == board.getPieceByLabel(selectedStart)?.color) { startSelection(board.getPieceByLabel(square), true); return; };
    if (board.getPieceByLabel(selectedStart)?.color != board.turn) return;
    const res = board.move(selectedStart, square);
    if (res) {
      setCheck(undefined);
      if (res == "check") {
        setCheck(board.turn);
      } else if (res != "none") {
        endRef.current = true;
        setEnd(true);
      }
      setReload(reload + 1);
      setAvailableMoves([]);
      setSelectedStart(null);
      board.saveGame();
      const history = board.chess.history({ verbose: true });
      setPrevMoves({ from: history[history.length - 1].from, to: history[history.length - 1].to });

      audioRef.current?.play();

      stockfish.postMessage("position fen " + board.chess.fen() + " moves " + board.chess.history().join(" "));
      stockfish.postMessage("go depth " + board.depth);

      StartTimer();
    } else {
      console.error("Invalid move", move.move);
      startSelection(board.getPieceByLabel(square), true);
    }
  }

  function StartTimer(startAnyway?: boolean) {
    if ((timeRef.current.w < 600 || timeRef.current.b < 600) && !startAnyway) return;
    setInterval(() => {
      if (endRef.current) return;
      if (board.checking() == "none" || board.checking() == "check" || timeRef.current.w != 0 || timeRef.current.b != 0) {
        if (board.turn == "b" && board.team == "w" || board.turn == "w" && board.team == "b") {
          timeRef.current = { w: timeRef.current.w - 1, b: timeRef.current.b };
        }
        else {
          timeRef.current = { w: timeRef.current.w, b: timeRef.current.b - 1 };
        }
        board.time = timeRef.current;
        setTime(timeRef.current);
        board.saveGame();
        if (timeRef.current.w <= 0 || timeRef.current.b <= 0) {
          setEnd(true);
        }
      }

    }, 1000);
  }


  function promotion(square: Square, prom: "Q" | "R" | "N" | "B") {
    const res = board.promotion(square, prom);
    if (res) {
      setPromote(null);
      setReload(reload + 1);
      setAvailableMoves([]);
      setSelectedStart(null);
    }
  }

  const [surr, setSurr] = useState(false);

  function getMoves() {
    return board.chess.pgn().split(/\b\d+\b\./).filter((value) => { return value != "" }).map(value => { return value.trim() });
  }

  return (
    <main className="flex min-h-screen items-center justify-center gap-2">

      {
        end &&
        <End />
      }

      <main className="flex flex-col items-center justify-center gap-2">
        <UserPanel board={board} time={time} level={true} icon="robot" user="Stockfish" color={"w"} value={board.missingPieces.white > board.missingPieces.black ? "+" + (board.missingPieces.white - board.missingPieces.black) : ""} />

        <audio ref={audioRef}>
          <source src={"/soundeffects/move.mp3"} type='audio/mp3' />
          Your browser does not support the audio element.
        </audio>
        {
          board.team == "w" &&
          <ChessBoardWhite board={board} reload={reload} selectedStart={selectedStart} availableMoves={availableMoves} prevMoves={prevMoves} check={check} startSelection={startSelection} move={move} promote={promote} promotion={promotion} />
        }

        {
          board.team == "b" &&
          <ChessBoardBlack board={board} reload={reload} selectedStart={selectedStart} availableMoves={availableMoves} prevMoves={prevMoves} check={check} startSelection={startSelection} move={move} promote={promote} promotion={promotion} />
        }

        <UserPanel board={board} time={time} level={false} icon="user" user="User" color={"b"} value={board.missingPieces.black > board.missingPieces.white ? "+" + (board.missingPieces.black - board.missingPieces.white) : ""} />
      </main>
      <main className="flex flex-col items-center justify-start gap-2 w-1/4 2xl:h-[48rem] xl:h-[32rem] lg:h-[32rem] md:h-[24rem] sm:h-[16rem] border rounded-md overflow-hidden">
        <div className="flex justify-between w-full px-5 pt-2">
          <div>
            Depth {board.depth}
          </div>
          <div>
            Level {board.level}
          </div>
        </div>
        <div className="border w-full text-center p-2">
          Moves:
        </div>
        <div className="flex flex-col w-full h-full max-h-full items-start overflow-y-auto">
          {getMoves().map((move, index) => {
            return <div key={index} className="w-full flex gap-10">
              <div className="w-4 px-1">
                {index + 1}.
              </div>

              <div className="flex justify-start items-center w-16">
                {
                  board.getPieceByType(move.split(" ")[0][0].toLocaleLowerCase()) != "pawn" && move.split(" ")[0].length > 2 &&
                  <Image src={`/pieces/${board.getPieceByType(move.split(" ")[0][0].toLocaleLowerCase())}-${"w"}.svg`} alt={board.getPieceByType(move.split(" ")[0][0].toLocaleLowerCase())} width={20} height={20} />
                }
                {
                  board.getPieceByType(move.split(" ")[0][0].toLocaleLowerCase()) != "pawn" && move.split(" ")[0].length > 2 ?
                    <div className="text-md">{move.split(" ")[0].slice(1)}</div> :
                    <div className="text-md">{move.split(" ")[0]}</div>
                }
              </div>
              {
                move.split(" ").length > 1 &&
                <div className="flex justify-start items-center w-16">
                  {
                    board.getPieceByType(move.split(" ")[1][0].toLocaleLowerCase()) != "pawn" && move.split(" ")[1].length > 2 &&
                    <Image src={`/pieces/${board.getPieceByType(move.split(" ")[1][0].toLocaleLowerCase())}-${"b"}.svg`} alt={board.getPieceByType(move.split(" ")[1][0].toLocaleLowerCase())} width={20} height={20} />
                  }
                  {
                    board.getPieceByType(move.split(" ")[1][0].toLocaleLowerCase()) != "pawn" && move.split(" ")[1].length > 2 ?
                      <div className="text-md">{move.split(" ")[1].slice(1)}</div> :
                      <div className="text-md">{move.split(" ")[1]}</div>
                  }
                </div>
              }

            </div>
          })}
        </div>
        <div className="p-2 flex items-center gap-2">
          <Link className="z-50" href={"/"}>
            <button className="border rounded-lg p-2 px-4 border-gray-400 hover:bg-gray-200 hover:text-white duration-100">
              <Image src={PlusIcon} width={18} height={18} alt="" className="cursor-pointer"></Image>
            </button>
          </Link>
          <button className="border rounded-lg p-2 px-4 border-gray-400 hover:bg-gray-200 text-sm duration-100" onClick={() => { if (surr) { setEnd(true) } else { setSurr(true) } }}>
            {
              surr ? "Are you sure?" :
                <Image src={FlagIcon} height={18} width={18} alt="Surrender"></Image>
            }
          </button>

        </div>
      </main>
    </main>
  );
}




