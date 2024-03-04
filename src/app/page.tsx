"use client";
import { useContext, useState } from "react";
import { BoardContext } from "@/services/context";
import { useRouter } from "next/navigation";
import PieceIcon from "@/assets/pieces/icon";
import { ChessPiece } from "@/services/chess.service";

export default function Home() {

  const [finish, setFinish] = useState(false);
  const [start, setStart] = useState(false);

  const route = useRouter();

  const { board } = useContext(BoardContext);

  const [level, setLevel] = useState("1");
  const [depth, setDepth] = useState("1");
  const [team, setTeam] = useState("w");

  function eraseCookie(c_name: string) {
    document.cookie = c_name + "=;expires=" + new Date(0).toUTCString() + ";path=/";
  }

  function startGame() {
    setStart(true);
    board.chess.reset();
    setFinish(false);
    board.depth = depth;
    board.level = level;
    board.team = team;
    board.createBoard();
    eraseCookie("chess");
    route.push("/chess");
  }

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow text-center items-center flex flex-col gap-2">
        <PieceIcon piece={new ChessPiece("KING", "w", "a1")} className="flex justify-center"></PieceIcon>
        <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 ">Play chess against Stockfish</h5>
        <div className="w-full mx-auto">
          <label htmlFor="underline_select" className="block mb-2 text-sm font-medium text-gray-900 ">Select depth</label>
          <select id="underline_select" onChange={(e) => { setLevel(e.target.value) }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
            <optgroup label="Easy">
              <option value="1">Beginner</option>
              <option value="3">Novice</option>
              <option value="4">Easy</option>
            </optgroup>
            <optgroup label="Medium">
              <option value="5">Intermediate</option>
              <option value="7">Regular</option>
              <option value="8">Normal</option>
            </optgroup>
            <optgroup label="Hard">
              <option value="10">Hard</option>
              <option value="12">Difficult</option>
              <option value="14">Challenging</option>
            </optgroup>
            <optgroup label="Expert">
              <option value="15">Expert</option>
              <option value="17">Master</option>
              <option value="19">Grandmaster</option>
            </optgroup>
            <optgroup label="Magnus">
              <option value="20">Magnus</option>
            </optgroup>
          </select>
        </div>

        <div className="w-full mx-auto">
          <label htmlFor="underline_select" className="block mb-2 text-sm font-medium text-gray-900 ">Select depth</label>
          <select id="underline_select" onChange={(e) => { setDepth(e.target.value) }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
            <optgroup label="Fast response">
              <option value="1">depth 1</option>
              <option value="2">depth 2</option>
              <option value="3">depth 3</option>
            </optgroup>
            <optgroup label="More then a second response">
              <option value="4">depth 4</option>
              <option value="5">depth 5</option>
              <option value="6">depth 6</option>
            </optgroup>
            <optgroup label="Slow response">
              <option value="7">depth 7</option>
              <option value="8">depth 8</option>
              <option value="9">depth 9</option>
              <option value="10">depth 10</option>
            </optgroup>
            <optgroup label="Slower response">
              <option value="11">depth 11</option>
              <option value="12">depth 12</option>
              <option value="13">depth 13</option>
              <option value="14">depth 14</option>
            </optgroup>
            <optgroup label="Really slow response">
              <option value="15">depth 15</option>
            </optgroup>

          </select>
        </div>

        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button type="button" onClick={() => { setTeam("w") }} className={"inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-s-lg " + (team === "w" ? "bg-green-700 text-white" : "hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-700 focus:text-green-700 ")}>
            <PieceIcon piece={new ChessPiece("KING", "w", "a1")} className="flex justify-center max-w-8"></PieceIcon>
            White
          </button>
          <button type="button" onClick={() => { setTeam("b") }} className={"inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-e-lg " + (team === "b" ? "bg-green-700 text-white" : "hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-700 focus:text-green-700 ")}>
            <PieceIcon piece={new ChessPiece("KING", "b", "a1")} className="flex justify-center max-w-8"></PieceIcon>
            Black
          </button>
        </div>

        <button onClick={startGame} className="p-1 px-4 bg-green-800 rounded-lg text-white">Play</button>

      </div>
    </div>
  )
}