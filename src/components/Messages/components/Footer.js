import React, { useState } from 'react';
import { io } from 'socket.io-client';
import config from '../../../config';
import "../../../utils/constants";
import getBotResponse from '../../../utils/getBotResponse';
import getRandomDelay from '../../../utils/getRandomDelay';
import parseResponseDataset from '../../../utils/parseResponseDataset';
import express from 'express';
const app = express();
const http = require('http').createServer(app);

let botResponses = null;

const {
  PORT,
  RESPONSES_FILE_PATH,
  USER_MESSAGE_EVENT,
  BOT_MESSAGE_EVENT,
  BOT_TYPING_EVENT,
  MIN_TYPING_S,
  MAX_TYPING_S,
  MIN_NATURAL_PAUSE_S,
  MAX_NATURAL_PAUSE_S
} = require('../../../utils/constants');

const socket = io(
      config.BOT_SERVER_ENDPOINT,
      { transports: ['websocket', 'polling', 'flashsocket'] }
    );

const RETURN_KEY_CODE = 13;

export default function Footer({ sendMessage, onChangeMessage, message }) {
  const [value,setValue]=useState("");

  const onKeyDown = ({ keyCode }) => {
    if (keyCode !== RETURN_KEY_CODE ) { return; }

    sendMessage();
  }
  parseResponseDataset(RESPONSES_FILE_PATH).then(parsedResponses => {
    botResponses = parsedResponses;
  });

  function sendMessage(){
    
    socket.on(USER_MESSAGE_EVENT, (message) => {
    setTimeout(() => {
      //send sound
      if(message){new Audio(config.SEND_AUDIO_URL).play();}

      if(MAX_TYPING_S) { socket.emit(BOT_TYPING_EVENT); }

      setTimeout(() => {
        socket.emit(
          BOT_MESSAGE_EVENT,
          getBotResponse(message, botResponses)
        );
      }, getRandomDelay(MIN_TYPING_S, MAX_TYPING_S));

    }, getRandomDelay(MIN_NATURAL_PAUSE_S, MAX_NATURAL_PAUSE_S));
  }
    )
  }


  return (
    <div className="messages__footer">
      <input
        onKeyDown={onKeyDown}
        placeholder="Write a message..."
        id="user-message-input"
        onChange={(event)=>{setValue(event.target.value)}}
      />
      <div className="messages__footer__actions">
        <i className="far fa-smile" />
        <i className="fas fa-paperclip" />
        <i className="mdi mdi-ticket-outline" />
        <button onClick={sendMessage} disabled={!message}>Send</button>
      </div>
    </div>
  );
}

http.listen(PORT, () => {
  console.log(`Botty server listening on *:${PORT} 🚀`);
});
