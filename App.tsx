import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { TypingTrainer } from './pages/vocab/TypingTrainer';
import { Writing } from './pages/ielts/Writing';
import { Speaking } from './pages/ielts/Speaking';
import { Reading } from './pages/ielts/Reading';
import { Listening } from './pages/ielts/Listening';
import { Resources } from './pages/Resources';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vocab" element={<TypingTrainer />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/speaking" element={<Speaking />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;