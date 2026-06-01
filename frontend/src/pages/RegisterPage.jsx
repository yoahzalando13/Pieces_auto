import { useState } from "react";
import authService from "../services/authService";
import { useNavigation } from "react-router-dom";

export default function RegisterPage() {

    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        motDePasse: ""
    });
    const navigate = useNavigation();


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response =
                await authService.register(form);

            console.log(response);
            navigate("/");

        } catch (error) {
            console.error(error);
        }
    };

    return (

        <form onSubmit={handleSubmit}>

            <input
                placeholder="Nom"
                onChange={(e) =>
                    setForm({
                        ...form,
                        nom: e.target.value
                    })
                }
            />

            <input
                placeholder="Prénom"
                onChange={(e) =>
                    setForm({
                        ...form,
                        prenom: e.target.value
                    })
                }
            />

            <input
                placeholder="Téléphone"
                onChange={(e) =>
                    setForm({
                        ...form,
                        telephone: e.target.value
                    })
                }
            />

            <input
                placeholder="Email"
                onChange={(e) =>
                    setForm({
                        ...form,
                        email: e.target.value
                    })
                }
            />

            <input
                type="password"
                placeholder="Mot de passe"
                onChange={(e) =>
                    setForm({
                        ...form,
                        motDePasse: e.target.value
                    })
                }
            />

            <button type="submit">
                Inscription
            </button>

        </form>
    );
}