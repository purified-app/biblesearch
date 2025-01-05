import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import packageJson from '../../../package.json';
const { version } = packageJson;

@Injectable({ providedIn: 'root' })
export class LoggerService {
  logSlowRequest<TData = unknown>(req: HttpRequest<TData>, duration: number) {
    const { method, body, url } = req;
    const { loggerUrl, production } = environment;
    const app = { name: 'biblesearch.app', type: 'Angular', version };
    const level = 'warn';
    const tag = 'slowRequest';
    const request = { method, body, url };
    const info = { duration, production, request, tag };
    const reqBody = { app, info, level, tag };

    fetch(loggerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    })
      .then(() => console.log('Slow request logged successfully', reqBody))
      .catch((error) => console.error('Error logging slow request:', error));
  }
}
