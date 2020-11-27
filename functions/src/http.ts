import * as functions from 'firebase-functions';
import * as spectrometerCtrl from './spectrometer.controller';
// Express
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

// We can put authentication here
// const auth = (request, response, next) => {
//   if (!request.header.authorization) {
//     response.status(400).send('unauthorized');
//   }

//   next();
// };

// Multi Route ExpressJS HTTP Function
const app = express();
app.use(bodyParser.json())
app.use(cors({ origin: true }));
// app.use(auth);

app.get('/spectrometer/:id', spectrometerCtrl.index);


export const api = functions.https.onRequest(app);