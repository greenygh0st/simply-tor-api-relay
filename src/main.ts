import axios from "axios";
import bodyParser from "body-parser";
import express, { Router } from "express";
import { AxiosTORService } from "./services/axios-tor.service";
// import { baseRouter } from "./controllers/base.controller";
// import { relayRouter } from "./controllers/relay.controller";
// import { testRouter } from "./controllers/test.controller";

// basic setup
const app = express();
const port: number = 8080;

// middleware
app.use(bodyParser.json());

// routers
const relayRouter = Router();
const baseRouter = Router();
const testRouter = Router();

testRouter.get("/test", async (request, response) => {
  try {
    const torAxios = new AxiosTORService();
    const tor = await torAxios.torSetup({
      ip: 'localhost',
      port: '9050'
    });

    const torResponse = await tor.axios.get("https://check.torproject.org/api/ip");
    // tslint:disable-next-line:no-console
    console.log('test tor response', torResponse.data);

    response.send({
      message: "Hello from tor-relay-ap test endpoint!",
      data: torResponse.data
    });
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log('error', error);
    const errorMessage = (error as any).message as string;
    if (errorMessage.includes('ECONNREFUSED')) {
      response.send({
        message: "Please make sure you have tor running on port 9050, if you just started the container you may need to wait a minute or two."
      });
    } else {
      response.send({
        message: "An unhandled error occurred"
      });
    }
  }
});

baseRouter.get("/", async (request, response) => {
  // tslint:disable-next-line:no-console
  console.log('base / request');
  response.send({
    message: "Hello from tor-relay-api!"
  });
});

relayRouter.post("/relay", async (request, response) => {
  try {
    const { requestUri, requestHeaders } = request.body;

    // make sure the requesturi is present
    if (!requestUri) {
      response.send({
        message: "Please provide a requestUri"
      });
      return;
    }    

    // make sure that the request body has the correct properties
    const torAxios = new AxiosTORService();
    const tor = await torAxios.torSetup({
      ip: 'localhost',
      port: '9050'
    });
    const relayResponse = await tor.axios.get(requestUri, { headers: requestHeaders });

    // tslint:disable-next-line:no-console
    console.log('relay request', request.body)
    response.send({
      message: "success",
      data: relayResponse.data
    });
  } catch (error) {
    
  }
});

app.use(relayRouter);
app.use(testRouter);
app.use(baseRouter);

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});