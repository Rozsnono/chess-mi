"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Board from "@/services/chess.service";
import { BoardContext } from "@/services/context";
import { useState } from "react";
import { Chess } from "chess.js";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const board = new Board();

  return (
    <html lang="en">
      <BoardContext.Provider value={{ board }}>
        <body className={inter.className}>{children}</body>
      </BoardContext.Provider>
    </html>
  );
}
