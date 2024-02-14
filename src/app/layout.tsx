"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Board from "@/services/piece.service";
import { BoardContext } from "@/services/board.context";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const board = new Board();
  const setBoard = () => {};

  return (
    <html lang="en">
      <BoardContext.Provider value={{ board, setBoard }}>
        <body className={inter.className}>{children}</body>
      </BoardContext.Provider>
    </html>
  );
}
