import { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {

    const [telephone, setTelephone] = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await authService.login({
                telephone,
                motDePasse
            });

            localStorage.setItem(
                "token",
                response.token
            );

            console.log(response);
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (

        <form onSubmit={handleSubmit}>

            <input
                type="text"
                placeholder="Téléphone"
                value={telephone}
                onChange={(e) =>
                    setTelephone(e.target.value)
                }
            />

            <input
                type="password"
                placeholder="Mot de passe"
                value={motDePasse}
                onChange={(e) =>
                    setMotDePasse(e.target.value)
                }
            />

            <button type="submit">
                Connexion
            </button>

        </form>
    );
}