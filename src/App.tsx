import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './LoginPage';
import SuccessPage from './SuccessPage';
import Link from "./Link";
import PrivateRoute from "./PrivateRoute";
import Onboarding from "./Onboarding";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";


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
                <Router>
                    <Routes>
                        <Route path="" element={<LoginPage/>}/>
                        <Route path="/success" element={<PrivateRoute element={<SuccessPage/>}/>}/>
                        <Route path="/link" element={<PrivateRoute element={<Link/>}/>}/>
                        <Route path="/welcome" element={<Onboarding/>}/>
                    </Routes>
                </Router>
            </CssBaseline>
        </ThemeProvider>

    );
}

export default App;
