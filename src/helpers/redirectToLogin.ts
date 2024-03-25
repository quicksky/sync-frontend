import {useNavigate} from "react-router-dom"

export function redirectToLogin(): void {
    const navigate = useNavigate();
    navigate("/")
}