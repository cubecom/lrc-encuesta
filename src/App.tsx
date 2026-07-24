import { Toaster } from "./components/ui/sonner";
import "./index.css";
import SurveyPage from "./screen/survey-screen";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/:id"
          element={<SurveyPage />}
        />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
