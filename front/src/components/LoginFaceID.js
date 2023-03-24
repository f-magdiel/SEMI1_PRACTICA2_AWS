import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Divider, Form, Grid, Icon } from "semantic-ui-react";
import Webcam from "react-webcam";
import {Camera} from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';


async function getBase64ImageFromUrl(imageUrl) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
    resolve(reader.result);
    };
    reader.readAsDataURL(blob);
    });
}

function LoginFaceID(){

    const [photo, setPhoto] = useState(null);
    const [image, setImage] = useState(null);
    const [imagen2, setImagen2] = useState(null);
    const [username, setUsername] = useState("");

    const handleTakePhoto = (dataUri) => {
        setPhoto(dataUri);
        const base64Image = btoa(dataUri);
        setImage(base64Image);
        console.log(base64Image)

    }

    const handleInputChange = (event) => {
        setUsername({
            ...username,
            [event.target.name]: event.target.value
        });
    
            console.log(username);

    }

    const navigate = useNavigate();
    const handleResetPhoto = () => {
        setPhoto(null);
    }

    const sendDatatoServer = () => {
        axios.post("http://localhost:5000/rds/getfotoperfil", {
            username: username
        })
        .then(response => {
            // Convertir fotoperfil a base64
            getBase64ImageFromUrl(response.data[0].urlPerfil)
                .then(base64Image => {
                    // Establecer imagen2 con la cadena base64 de la imagen de perfil
                    const base64ImageString = base64Image.split(",")[1];
                    setImagen2(base64ImageString);
                    
                    // Hacer la segunda solicitud POST con la imagen2 establecida
                    axios.post("http://localhost:5000/rekognition/compararfotos", {
                        imagen1: image,
                        imagen2: base64ImageString
                    })
                    .then(response => {
                        console.log(response.data.login);
                        if (response.data.login == true) {
                            alert("Usuario logueado correctamente");
                            navigate("/dashboard");
                        } else if (response.data.login == false) {
                            alert("Credenciales incorrectas, por favor revise los datos");
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
    };
    
    
    return (

        <div className="upload-page">
            
            <div className="upload-page-header">
                <div className="upload-page-header-txt">
                    <label> Tomar foto </label><Icon name="photo" />
                </div>
                    <div className="Login-Form-Body">
                <Form>
                        <Form.Input icon={"user"} /*required*/ autoComplete="username" type='text' name='username' label="Usuario / e-mail" labelPosition="left" placeholder='Enter your username/e-mail' onChange={handleInputChange}  />
                        
                    </Form>
                </div>
                <Divider />
            </div>

            <div className="upload-page-body">
                <div >
                    <Form className="upload-form">
                        <Grid centered >
                            
                            <Grid.Column width={8}>
                                <Grid.Row>
                                
                                </Grid.Row>
                            </Grid.Column>

                            <Grid.Row centered >
                            {photo ? (
                                    <div>
                                        <PreviewPhoto photo={photo} />
                                        <Button  className="ui black button" type="button" onClick={sendDatatoServer}>Iniciar Sesion</Button>
                                        <button className="ui black button" type="button" onClick={handleResetPhoto}>Tomar otra foto</button>
                                    </div>
                                ) : (
                                    
                                    <Camera
                                    onTakePhoto={(dataUri) => {
                                        handleTakePhoto(dataUri);
                                    }}
                                    width={280}
                                    height={280}
                                    />
                                )}
                                
        
                            </Grid.Row>
                        </Grid>
                    </Form>

                </div>
            </div>
        </div>
    )

}

const PreviewPhoto = ({ photo }) => {
    return (
    <div>
        <img src={photo} alt="preview" width="280" height="280" />
    </div>
    );
};

export default LoginFaceID;