import { Divider } from "semantic-ui-react"
import ChatBot from "./ChatBot";

function PreChat() {
    return (
        <div className="Dashboard-Page">
            <div className="Dashboard-Page-Body">

                <div className="dashboard-page-body-title">
                    <label>ChatBot</label>
                    <Divider />
                </div>
                <ChatBot/>
            </div>
        </div>
    )

}

export default PreChat