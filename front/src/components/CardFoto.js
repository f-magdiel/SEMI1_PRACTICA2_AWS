import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CardFoto(props) {
    const navigate = useNavigate();
    const url = "http://localhost:5000/rds/GuardarImagen";
    function handleClick() {
        axios.post(url, {
            imagen: props.foto
        })
        .then(response => {
            navigate("/Traduccion");
        }).catch(err => {
            console.log(err);
        });
    }
    return (

       <div>
         <div className="card">
            <img src={props.foto} style={{ width: '110px', height: '100px' }} onClick={handleClick} />
        </div>
       </div>

    );
}

export default CardFoto;