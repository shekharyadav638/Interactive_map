import { useState } from "react";
import "./App.css";
import Maps from "./components/Maps";
import Sidebar from "./components/Sidebar";

function App() {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [marker, setMarker] = useState(null);

  return (
    <>
      <Sidebar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <Maps
        marker={marker}
        setMarker={setMarker}
        selectedCategory={selectedCategory}
      />
    </>
  );
}

export default App;
