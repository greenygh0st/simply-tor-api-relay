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
    // tslint:disable-next-line:no-console
    console.log('test request');
    const torAxios = new AxiosTORService();
    const tor = await torAxios.torSetup({
      ip: 'localhost',
      port: '9050'
    });

    const torResponse = await tor.axios.get("https://check.torproject.org/api/ip");
    // tslint:disable-next-line:no-console
    console.log('test tor response', torResponse);

    response.send({
      message: "Hello from tor-relay-ap test endpoint!"
    });
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log('error', error);
    const errorMessage = (error as any).message as string;
    if (errorMessage.includes('ECONNREFUSED')) {
      response.send({
        message: "Please make sure you have tor running on port 9050"
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
  const { requestUri, requestHeaders } = request.body;

  // make sure that the request body has the correct properties
  // UNFINISHED

  // tslint:disable-next-line:no-console
  console.log('relay request', request.body)
  response.send({
    message: "Hello from tor-relay-api!"
  });
});

app.use(relayRouter);
app.use(testRouter);
app.use(baseRouter);

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});