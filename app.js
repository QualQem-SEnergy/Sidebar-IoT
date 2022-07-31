const { MqttClient } = require('mqtt')
const mqtt = require('mqtt')


let express = require('express');
let app = express();

app.set('view engine', 'ejs');

const host = '127.0.0.1'
const port = '1886'
const bodyParser = require("body-parser");


var timeStamp
var machineID
var machineStatus

// let date_ob = new Date();

var hours
var minutes
var seconds
var current_time

const connectUrl = `mqtt://${host}:${port}`

const clientId = `mqtt_nodejs`

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'Senergy',
  password: 'Senergy',
  reconnectPeriod: 1000,
})
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//DB Connection

const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'trinitySteelDB',
  password: 'postgres',
  port: 5432,
})

const clientPG = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'FZ',
  password: 'postgres',
  port: 5432,
})

clientPG.connect()

const clientErrorListener = error =>{
  console.log(error)
}

clientPG.on('error',clientErrorListener)

//READ MQTT SUBSCRIPTION PACKET
const topic = "trinity-m1"
var message = "NULL"

client.subscribe(topic)

client.on("message", function (topic, payload) {
  // console.log(payload.toString())
  
  // time_now = date_ob.getTime();
  //WRITE TO DB
  // year = date_ob.getFullYear();
  // month = date_ob.getMonth();
  // day = date_ob.getDay();

  let date_ob = new Date();
  
  hours = date_ob.getHours();
  minutes = date_ob.getMinutes();
  seconds = date_ob.getSeconds();

  // timeStamp = year+"-"+month+"-"+day+" "+hours + ":" + minutes + ":" +seconds;
  timeStamp = hours + ":" + minutes + ":" +seconds;
  console.log(timeStamp)

  const writeString = 'INSERT INTO public."Basetable" ("Time Stamp", "MachineID", "Event") VALUES ($1, $2, $3)'
  // const writeValues = [timeStamp, 'm1', payload.toString()]
  const writeValues = [timeStamp, 'm1', payload.toString()]

  app.get("/", function(req,res){
    res.render("assetview",{Dola:payload});
})
  console.log(payload.toString())


    clientPG.query(writeString, writeValues, (err, res) => {
    if (err){
        console.log(err.stack)
    } else {
        console.log(res.rows)
    }
  })
    // client.end()

  
});

app.listen(3001, function(){
    console.log("Server started on port 3001");
  }); 