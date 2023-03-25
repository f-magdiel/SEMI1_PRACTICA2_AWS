import { React, useState, useEffect } from "react"
import { Grid, Segment, Header, Form, Button, Dropdown, TextArea } from "semantic-ui-react";
import axios from "axios";

function Traduccion(props) {
    const [ImgUrl, setImgUrl] = useState("");
    const [descrip, setDescrip] = useState("");
    const [trad, setTrad] = useState("");
    const [selectedOption, setSelectedOption] = useState('');
    const options = [
        { key: 'Ingles', value: 'en', text: 'Ingles' },
        { key: 'Francés', value: 'fr', text: 'Francés' },
        { key: 'Portugués', value: 'pt', text: 'Portugués' },
      ];
    const url = "http://localhost:5000/rds/Descripcion";
    const url2 = "http://localhost:5000/rds/ruta";
    useEffect(() => {
        axios.post(url, {
            imagen: "a"
        })
        .then(response => {
            setImgUrl(response.data.urlPost)
            setDescrip(response.data.descripcion.descripcion)
        }).catch(err => {
            console.log(err);
        });
    }, [])
    const handleSubmit = (event) => {
        console.log(selectedOption)
        event.preventDefault();
        axios.post(url2, {
            lenguaje: selectedOption,
            texto: descrip
        })
        .then(response => {
            console.log(response.data.traduccion.TranslatedText)
            setTrad(response.data.traduccion.TranslatedText)
            
        }).catch(err => {
            console.log(err);
        });
    }
    const handleSelectChange = (event, data) => {
        setSelectedOption(data.value);
    };



    return (
        <div className="Dashboard-Grid">
            
            <Grid>
                <Grid.Column width={5} >
                    <Grid.Row >
                        <div className="card">
                            <img src={ImgUrl} style={{ width: '200px', height: '200px' }} />
                        </div>
                    </Grid.Row>
                    <Grid.Row >
                        <div className="Register-Form-Button">
                            <Button className="ui black button" type="submit" onClick={handleSubmit} >Traducir</Button>
                        </div>
                    </Grid.Row>
                </Grid.Column >
                <Grid.Column width={5} >
                    <Grid.Row  >
                        <div className="form" style={{ textAlign: "center" }}>
                            <TextArea
                                style={{ minHeight: 200, minWidth: 500 }}
                                value={descrip}
                            />
                        </div>
                    </Grid.Row>
                    <br></br>
                    <Grid.Row>
                        <Dropdown
                            placeholder="Seleccione una opción"
                            fluid
                            selection
                            options={options}
                            value={selectedOption}
                            onChange={handleSelectChange}
                        /> 
                    </Grid.Row> 
                    <br></br>
                    <Grid.Row  >
                        <div className="form" style={{ textAlign: "center" }}>
                            <TextArea
                                style={{ minHeight: 200, minWidth: 500 }}
                                value={trad}
                            />
                        </div>
                    </Grid.Row>
                </Grid.Column>
            </Grid>
        </div>
    )
}

export default Traduccion;