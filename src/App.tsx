import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './LoginPage';
import SuccessPage from './SuccessPage';
import Link from "./Link";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/success" element={<SuccessPage/>}/>
                <Route path="/link"
                       element={<Link/>}/>
            </Routes>
        </Router>
    );
}

export default App;
