import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
// const oracledb = require('oracledb');
// oracledb.initOracleClient({ libDir: "C:\\oracle\\instantclient_19_20" }); 

import {
 emp
} from "./src/routes/index.js"

const app = express()
app.use(express.json())

app.use(cors())

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const path = __dirname + '/client/build/';

app.use(express.static(path));

app.get('/', function (req, res) {
  res.sendFile(path + "index.html");
});

BigInt.prototype['toJSON'] = function () {
  return parseInt(this.toString());
};

app.use('/emp', emp)


const PORT = 9047;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
