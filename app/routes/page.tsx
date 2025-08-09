import type { Route } from "./+types/home";
import { useFetcher } from "react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { LeftPanel } from "../components/LeftPanel";
import type { AgentEmailResponse, ChatMessage } from "../lib/chat/types";
import Home1 from "./home1";
import Home2 from "./home2";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Envive | AI Chat" },
    { name: "description", content: "Landing page with an AI chatbot" },
  ];
}

// Using shared ChatMessage type from lib

export default function Page() {

  
  const [switchPage, setSwitchPage] = useState<boolean>(false);

  

  return (
    <main className="min-h-[100dvh] p-6">
      {switchPage ? <Home1 /> : <Home2 />}
      <button onClick={() => setSwitchPage(!switchPage)}>Switch Page</button>
    </main>
  );
}
