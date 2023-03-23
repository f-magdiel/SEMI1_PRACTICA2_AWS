import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Divider, Form, Grid, Icon } from "semantic-ui-react";
import Webcam from "react-webcam";
import {Camera} from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';



function LoginFaceID(){

    const [photo, setPhoto] = useState(null);
    const [image, setImage] = useState(null);

    const handleTakePhoto = (dataUri) => {
        setPhoto(dataUri);
        const base64Image = btoa(dataUri);
        setImage(base64Image);
        console.log(base64Image)

    }
    const navigate = useNavigate();
    const handleResetPhoto = () => {
        setPhoto(null);
    }

    const sendDatatoServer = () => {
        axios.post("http://localhost:5000/rds/faceid", {
            imagen64: image
        })
        .then(response => {
            console.log(response.data.login);
            if (response.data.login == true){
                sessionStorage.setItem("user", 1111111111);
                alert("Usuario logueado correctamente");
                navigate("/dashboard");
            }else if (response.data.login == false){
                alert("Credenciales incorrectas, por favor revise los datos");
            }
        }).catch(err => {
            console.log(err);
        });
    }
    
    return (

        <div className="upload-page">

            <div className="upload-page-header">
                <div className="upload-page-header-txt">
                    <label> Tomar foto </label><Icon name="photo" />
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
                                        <Button  className="ui black button" type="button">Iniciar Sesion</Button>
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