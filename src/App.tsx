import { Routes, Route, BrowserRouter } from "react-router";
import Dashboard from "./components/Dashboard";
import EmbedChat from "./components/EmbedChat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chatbot/session/:sessionToken" element={ <EmbedChat /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
