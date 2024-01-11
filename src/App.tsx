import React, {useEffect} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './LoginPage';
import SuccessPage from './SuccessPage';
import Link from "./Link";
import PrivateRoute from "./PrivateRoute";
import {useAppDispatch} from "./redux/store";
import {fetchUser} from "./redux/userSlice";
import Setup from "./Setup";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/success" element={<PrivateRoute element={<SuccessPage/>}/>}/>
                <Route path="/link" element={<PrivateRoute element={<Link/>}/>}/>
            </Routes>
        </Router>
    );
}

export default App;
