
import './App.css';
import Scene from './scenes/scene';
import TestScene from './scenes/testScene';
import EditorPage from './editor/EditorPage';
import { Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">

      <Routes>
        <Route path="/" element={<Scene />} />
        <Route path="/test" element={<TestScene />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </div>
  );
}

export default App;
