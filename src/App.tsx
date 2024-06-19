import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ExplorePage from "./components/ExplorePage";
import MainBar from "./components/MainBar";
import PetitionPage from "./components/PetitionPage";
import RegisterPage from "./components/RegisterPage";
import EditProfilePage from "./components/EditProfilePage";
import LoginPage from "./components/LoginPage";
import MyPetitionsPage from "./components/MyPetitionsPage";
import CreatePetitionPage from "./components/CreatePetitionPage";
import EditPetitionPage from "./components/EditPetitionPage";

import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#6A5ACD',
        },
    },
});


function App() {
  return (
      <ThemeProvider theme={theme}>
          <Router>
              <div className="App">
                  <MainBar/>
                  <div>
                      <Routes>
                          <Route path="/" element={<ExplorePage/>}/>
                          <Route path="/register" element={<RegisterPage/>}/>
                          <Route path="/login" element={<LoginPage/>}/>
                          <Route path="/edit-profile" element={<EditProfilePage/>}/>
                          <Route path="/my-petitions" element={<MyPetitionsPage />}/>
                          <Route path="/petitions/create" element={<CreatePetitionPage />}/>
                          <Route path="/petitions/:id" element={<PetitionPage />}/>
                          <Route path="/petitions/:id/edit" element={<EditPetitionPage />}/>
                      </Routes>
                  </div>
              </div>
          </Router>
      </ThemeProvider>
  );
}

export default App;
