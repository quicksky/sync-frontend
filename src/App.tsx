import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './LoginPage';
import SuccessPage from './SuccessPage';
import PrivateRoute from "./PrivateRoute";
import Onboarding from "./Onboarding";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import SettingsPage from "./SettingsPage";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";


const theme = createTheme({
    palette: {
        background: {
            default: "#20202e",
        },
        primary: {
            main: "#FFFFFF",
        },
    },
});


function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Router>
                        <Routes>
                            <Route path="" element={<LoginPage/>}/>
                            <Route path="/home" element={<PrivateRoute element={<SuccessPage/>}/>}/>
                            <Route path="/settings" element={<PrivateRoute element={<SettingsPage/>}/>}/>
                            <Route path="/welcome" element={<Onboarding/>}/>
                        </Routes>
                    </Router>
                </LocalizationProvider>
            </CssBaseline>
        </ThemeProvider>

    );
}

export default App;
