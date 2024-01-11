import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './LoginPage';
import SuccessPage from './SuccessPage';
import Link from "./Link";
import PrivateRoute from "./PrivateRoute";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="" element={<LoginPage/>}/>
                <Route path="/success" element={<PrivateRoute element={<SuccessPage/>}/>}/>
                <Route path="/link" element={<PrivateRoute element={<Link/>}/>}/>
            </Routes>
        </Router>
    );
}

export default App;
