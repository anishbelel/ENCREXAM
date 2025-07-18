import { useRef, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "./constants";
import Output from "./Output";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase"; // adjust import as per your setup
import { toast } from "react-toastify";

const CodeEditor = () => {

  
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [user] = useAuthState(auth); // Get current user
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveSnippet = async () => {
    setIsLoading(true);
    if (!user) return alert("Please sign in to save your snippet.");

    const code = editorRef.current?.getValue();
    if (!code) return;

    const userRef = doc(firestore, "users", user.uid);
    try {
      await setDoc(userRef, {
        snippit: {
          language,
          code,
        },
      }, { merge: true });

      toast.success("Snippit saved successfully!", {position: "top-center", autoClose: 2000,theme: "dark", });
    } catch (err) {
      console.error("Failed to save snippet:", err);
    }
    finally {
      setIsLoading(false);
    }
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };
  

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="50%">
          <LanguageSelector isLoading={isLoading} language={language} onSelect={onSelect} onSaveSnippet={handleSaveSnippet}/>
          <Editor
            options={{
              minimap: {
                enabled: false,
              },
            }}
            height="75vh"
            theme="hc-black"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};
export default CodeEditor;
