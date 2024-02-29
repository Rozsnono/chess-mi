"use client";
import { useContext, useState } from "react";
import ChessBoard from "./chess/page";
import Link from "next/link";
import { BoardContext } from "@/services/context";
import { useRouter } from "next/navigation";

export default function Home() {

  const [finish, setFinish] = useState(false);
  const [start, setStart] = useState(false);

  const route = useRouter();

  const { board } = useContext(BoardContext);

  const [level, setLevel] = useState("1");
  const [depth, setDepth] = useState("1");

  function startGame() {
    setStart(true);
    board.chess.reset();
    setFinish(false);
    board.depth = depth;
    board.level = level;
    route.push("/chess");
  }

  return (
    <div className="flex flex-col gap-2 justify-center items-center w-screen h-screen">
      <div className="flex flex-col gap-2 border rounded-lg p-6 px-12 border-gray-500 justify-center items-center">
        <h1 className="text-2xl">Chess-MI</h1>
        <hr />
        <p>Play chess with a computer</p>
        <div className="w-full mx-auto">
          <label htmlFor="underline_select" className="block mb-2 text-sm font-medium text-gray-900">Select a level</label>
          <select id="underline_select" onChange={(e) => { setLevel(e.target.value) }} className="block py-2.5 px-0 w-full text-sm text-gray-800 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
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
          <label htmlFor="underline_select" className="block mb-2 text-sm font-medium text-gray-900">Select depth</label>
          <select id="underline_select" onChange={(e) => { setDepth(e.target.value) }} className="block py-2.5 px-0 w-full text-sm text-gray-800 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
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


        <button onClick={startGame} className="p-1 px-4 bg-green-800 rounded-lg text-white">Play</button>
      </div>


    </div>
  )
}