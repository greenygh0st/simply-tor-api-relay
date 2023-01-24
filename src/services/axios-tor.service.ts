// import axios from 'axios';
import { Axios } from 'axios';
import os from 'os';
import net from 'net';
import { SocksProxyAgent } from 'socks-proxy-agent';

export class AxiosTORService {
  torConfig = {
    ip: '127.0.0.1',
    port: '9050',
    path: '',
    controlPort: '9051',
    controlPassword: 'giraffe',
  };

  async torSetup({ ip = 'localhost', port = '9050', path = '', controlPort = '9051', controlPassword = 'giraffe' }) {

    this.torConfig.ip = ip === 'localhost' ? '127.0.0.1' : ip;
    this.torConfig.port = port;
    this.torConfig.path = path;
    this.torConfig.controlPort = controlPort;
    this.torConfig.controlPassword = controlPassword;

    const newTorSession = await this.torNewSession();
    const httpAgent = this.httpAgent();
    const httpsAgent = this.httpsAgent();
    const axios = new Axios({
      httpAgent,
      httpsAgent,
    });

    return {
      newTorSession,
      httpAgent,
      httpsAgent,
      axios
    };
  }

  httpAgent() {
    return new SocksProxyAgent(`socks5h://${this.torConfig.ip}:${this.torConfig.port}`);
  }

  httpsAgent() {
    return new SocksProxyAgent(`socks5h://${this.torConfig.ip}:${this.torConfig.port}`);
  }

  torIPC(commands: any) {
    const classConfig = this.torConfig;
    return new Promise((resolve, reject) => {
      const socket = net.connect({
        host: classConfig.ip || '127.0.0.1',
        port: classConfig.controlPort || 9051,
      } as any, () => {
        const commandString = commands.join('\n') + '\n';
        socket.write(commandString);
      });

      socket.on('error', (err: any) => {
        reject(err);
      });

      let data = '';
      socket.on('data', (chunk: any) => {
        data += chunk.toString();
      });

      socket.on('end', () => {
        resolve(data);
      });
    });
  }

  torNewSession() {
    const commands = [
      'authenticate "' + this.torConfig.controlPassword + '"', // authenticate the connection
      'signal newnym', // send the signal (renew Tor session)
      'quit' // close the connection
    ];

    return new Promise((resolve, reject) => {
      this.torIPC(commands).then((data: any) => {
        const lines = data.split(os.EOL).slice(0, -1);
        const success = lines.every((val: any, ind: any, arr: any) => {
          // each response from the ControlPort should start with 250 (OK STATUS)
          return val.length <= 0 || val.indexOf('250') >= 0
        });

        if (!success) {
          const err = new Error('Error communicating with Tor ControlPort\n' + data)
          reject(err);
        }

        resolve('Tor session successfully renewed!!');
      }).catch((err: any) => {
        reject(err);
      });
    });
  }
}
