// Aqui se llamar la informacion del usuario para mostrarla en la pantalla principal

import { useEffect, useState } from "react";

import { Card, Image } from "semantic-ui-react"
import matthew from "../images/matthew.png"

function AvatarComponent(props) {
    const [descrip, setDescrip] = useState("Descripcion");
    const [imageUrl, setImageUrl] = useState(matthew);

    useEffect(() => {
        if ((props.descrip !== null && props.imageUrl !== null) && (props.descrip !== undefined && props.imageUrl !== undefined)) {
            setImageUrl(props.imageUrl);
            setDescrip(props.descrip)
        }

    },[props.descrip, props.imageUrl])

    return (
        <Card>
            <Image src={imageUrl} size={"medium"} />
            <Card.Content>
                <Card.Header>{descrip}</Card.Header>
                <Card.Description>
                </Card.Description>
            </Card.Content>
        </Card>
    )

}

export default AvatarComponent
