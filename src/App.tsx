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
import {Worker} from "@react-pdf-viewer/core";
import ResetPassword from "./ResetPassword";
import PasswordResetForm from "./PasswordResetForm";


export const theme = createTheme({
    palette: {
        background: {
            default: "#20202e",
        },
        primary: {
            main: "#FFFFFF",
        },
        secondary: {
            main: "#20202e",
        },
        warning: {
            main: "#d3d3d3",
        }
    },
});


function App() {
    return (
        <Worker workerUrl={'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'}>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Router>
                            <Routes>
                                <Route path="" element={<LoginPage/>}/>
                                <Route path="/home" element={<PrivateRoute element={<SuccessPage/>}/>}/>
                                <Route path="/settings" element={<PrivateRoute element={<SettingsPage/>}/>}/>
                                <Route path="/welcome" element={<Onboarding/>}/>
                                <Route path="/resetPassword" element={<ResetPassword/>}/>
                                <Route path="/forgotPassword" element={<PasswordResetForm/>}/>
                            </Routes>
                        </Router>
                    </LocalizationProvider>
                </CssBaseline>
            </ThemeProvider>
        </Worker>

    );
}

export default App;
