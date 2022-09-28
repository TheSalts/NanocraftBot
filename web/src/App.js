import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Error from './pages/Error';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route index element={<Home />} />
          <Route path="error" element={<Error />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
