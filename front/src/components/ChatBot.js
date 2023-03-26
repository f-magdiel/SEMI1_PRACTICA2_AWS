import React, { useState, useEffect } from 'react';
import { Segment, Comment, Form, Input } from 'semantic-ui-react';
import axios from "axios";
class ChatBot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        messages: [], // Aquí se almacenarán los mensajes
        inputValue: '', // El valor actual del input de texto
        };
        // Enlaza el método handleSubmit con la instancia de la clase
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        // Escucha los mensajes del servidor
        /*socket.on('message', (message) => {
        this.setState((prevState) => ({
            messages: [...prevState.messages, message],
        }));
        });*/
    }

    handleSubmit(e) {
        e.preventDefault();
        const { messages, inputValue } = this.state;
        // Agrega el mensaje predeterminado a la lista de mensajes
        this.setState((prevState) => ({
        messages: [...prevState.messages, { user: 'Me', text: inputValue }],
        inputValue: '',
        }));

        // Agrega el mensaje del usuario a la lista de mensajes después de un retraso de 1 segundo
        setTimeout(() => {
        // Envia el mensaje al servidor
        //socket.emit('message', { user: 'Me', text: inputValue });
        // Agrega el mensaje a la lista de mensajes'
        console.log("Valor a Enviar")
        console.log(inputValue)
        this.setState((prevState) => ({
            messages: [...prevState.messages, { user: 'ChatBot', text: 'Mensaje predeterminado' }],
        }));
        }, 1000);
    }

    render() {
        const { messages, inputValue } = this.state;
        return (
        <div>
            <Segment style={{ height: '500px', overflowY: 'scroll' }}>
            <Comment.Group>
                {messages.map((message, index) => (
                <Comment key={index}>
                    <Comment.Content>
                    <Comment.Author>{message.user}</Comment.Author>
                    <Comment.Text>{message.text}</Comment.Text>
                    </Comment.Content>
                </Comment>
                ))}
            </Comment.Group>
            </Segment>
            <Form onSubmit={this.handleSubmit}>
            <Input
                fluid
                value={inputValue}
                onChange={(e) => this.setState({ inputValue: e.target.value })}
                placeholder='Escribe tu mensaje aquí'
            />
            </Form>
        </div>
        );
    }
}

export default ChatBot;
/*
function ChatBot() {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Agregar el mensaje predeterminado a la lista de mensajes
        setMessages([...messages, { user: 'Me', text: inputValue }]);
        
        // Agregar el mensaje del usuario a la lista de mensajes después de un retraso de 1 segundo
        setTimeout(() => {
            // Enviar el mensaje al servidor
            //socket.emit('message', { user: 'Me', text: inputValue });
            // Agregar el mensaje a la lista de mensajes
            setMessages([...messages, { user: 'ChatBot', text: 'Mensaje predeterminado' }]);
            // Limpiar el campo de texto
            setInputValue('');
        }, 1000);
    };
  
    useEffect(() => {
      //setMessages([{user: 'ChatBot', text: "Esto es una respuesta"}])
    }, [messages]);
    
    

    return (
      <div>
        <Segment style={{ height: '400px', overflowY: 'scroll' }}>
          <Comment.Group>
            {messages.map((message, index) => (
              <Comment key={index}>
                <Comment.Content>
                  <Comment.Author as="span">{message.user}</Comment.Author>
                  <Comment.Text>{message.text}</Comment.Text>
                </Comment.Content>
              </Comment>
            ))}
          </Comment.Group>
        </Segment>
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <Input
              placeholder="Escribe un mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </Form.Field>
          <Form.Button content="Enviar" primary />
        </Form>
      </div>
    );
  }

export default ChatBot;
*/