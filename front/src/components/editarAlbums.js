import { React, useState, useEffect } from "react"
import { Grid, Segment, Header, Form, Button, ButtonGroup, TextArea } from "semantic-ui-react";
import AvatarComponent from "./Perfil"
import { useNavigate } from "react-router-dom";
import GridButtons from "./GridButtons";
import DropdownMenu from "./DropdownMenu";
import axios from "axios";
import FileInput from "./FileInput";

function AlbumsGrid(props) {
    const [base64Image, setBase64Image] = useState('');
    const [ImgUrl, setImgUrl] = useState("");
    const [texto, setTexto] = useState("");
    const [userData, setUserData] = useState({
        image: []
    })

    const handleInputChange = (event) => {
        setUserData({
            ...userData,
            [event.target.name]: event.target.value
        });
    }

    const handleFilesChange = (event) => {
        const files = event.target.files;
        if(!event.target.files[0]){
            return;
        }
        
        if (userData.image.length > 0) {
            userData.image[0] = (event.target.files[0]);
        } else {
            userData.image.push(event.target.files[0]);
        }
        setImgUrl(URL.createObjectURL(event.target.files[0]));
        const file =  files[0]
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setBase64Image(reader.result.split(',')[1]);
        };
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const objectImage = {
            imagen: base64Image
        }
       
        axios.post('http://localhost:5000/rekognition/detectartexto', objectImage)
            .then(res => {
                let textos = "";
                console.log(res.data);
                res.data.texto.forEach(element => {
                    //console.log(element.DetectedText)
                    textos += element.DetectedText + " ";
                });
                setTexto(textos);
                textos = ""
            })
            .catch(err => {
                console.log(err);
            })
    }




    return (
        <div className="Dashboard-Grid">
            
            <Grid>
            <Grid.Column width={5} >
                <Grid.Row >
                    <FileInput change={handleFilesChange} ImgUrl={ImgUrl}  title={"Foto"}></FileInput>
                </Grid.Row>
                <Grid.Row >
                
                <div className="Register-Form-Button">
                    <Button className="ui black button" type="submit" onClick={handleSubmit} >Extraer texto</Button>
                </div>
            </Grid.Row>
            </Grid.Column >

            
           
            
            
            <Grid.Column width={5} >
            <Grid.Row  >
                <div className="form" style={{ textAlign: "center" }}>
                    <TextArea
                        style={{ minHeight: 300, minWidth: 500 }}
                        value={texto}
                    />
                </div>
            </Grid.Row> 
            </Grid.Column>
                   

            </Grid>
        </div>
    )
}

export default AlbumsGrid;