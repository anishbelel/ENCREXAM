// src/pages/code.tsx
import React from "react";
import dynamic from "next/dynamic";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../components/CodeEditor/theme"; // Adjust the import path as per structure

// Lazy load the editor to avoid SSR issues with Monaco
const CodeEditor = dynamic(
  () => import("../components/CodeEditor/CodeEditor"),
  { ssr: false }
);

const CodeEditorPage = () => {
  return (
    <ChakraProvider theme={theme}>
      <div style={{ minHeight: "100vh", backgroundColor: "#0f0a19", padding: "2rem" }}>
        <CodeEditor />
      </div>
    </ChakraProvider>
  );
};

export default CodeEditorPage;
