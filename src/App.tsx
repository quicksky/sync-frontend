import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './LoginPage';
import SuccessPage from './SuccessPage';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/success" element={<SuccessPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
