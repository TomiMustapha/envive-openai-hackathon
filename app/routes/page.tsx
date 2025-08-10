import type { Route } from "./+types/home";
import { useFetcher } from "react-router";
import { useEffect, useRef, useState, useMemo, useContext } from "react";
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
import { createContext } from "react";

type ProductsContextType = {
  products: any[];
  setProducts: (products: any[]) => void;
};

export const ProductsContext = createContext<ProductsContextType>({
  products: [],
  setProducts: () => {},
});

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<any[]>([]);

  return (
    <ProductsContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}

export default function Page() {

  
  const [switchPage, setSwitchPage] = useState<boolean>(false);

  

  return (
    <main className="min-h-[100dvh] p-6">
      <ProductsProvider>
        {switchPage ? <Home2 /> : <Home1 />}

      <button onClick={() => setSwitchPage(!switchPage)}>Switch Page</button>
      </ProductsProvider>
    </main>
  );
}
