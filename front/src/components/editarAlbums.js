import { React, useState, useEffect } from "react"
import { Grid, Segment, Header, Form, Button, ButtonGroup, TextArea } from "semantic-ui-react";
import AvatarComponent from "./Perfil"
import { useNavigate } from "react-router-dom";
import GridButtons from "./GridButtons";
import DropdownMenu from "./DropdownMenu";
import axios from "axios";
import FileInput from "./FileInput";

function AlbumsGrid(props) {
    


    return (
        <div className="Dashboard-Grid">
            
            <Grid>
            <Grid.Column width={8} >
                <Grid.Row>
                    <FileInput   title={"Foto"}></FileInput>
                </Grid.Row>
            </Grid.Column >
            <Grid.Row >
                <div className="Register-Form-Button">
                    <Button className="ui black button" type="submit" >Extraer texto</Button>
                </div>
            </Grid.Row>
            <Grid.Row centered >
                <div className="form" style={{ textAlign: "center" }}>
                    <TextArea
                        style={{ minHeight: 200 }}
                        Column={16}
                        Row={16}
                    />
                </div>
            </Grid.Row>        

            </Grid>
        </div>
    )
}

export default AlbumsGrid;