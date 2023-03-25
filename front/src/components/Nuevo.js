import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { Divider } from "semantic-ui-react"
import Traduccion from "./Traduccion";

function Dasd() {
    return (
        <div className="Dashboard-Page">
            <div className="Dashboard-Page-Body">

                <div className="dashboard-page-body-title">
                    <label>Traducir Texto</label>
                    <Divider />
                </div>
                <Traduccion/>
            </div>
        </div>
    )

}

export default Dasd