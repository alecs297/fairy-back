# fairy-back

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.0.

Fairy is a basic bill management system designed to help with your groups' spendings, build with Angular, express and mongoDB.

## Server (express)

API configuration is done via environment variables, to get started copy `.env_copy` to `.env` and fill in your MongoDB and certificates details.

The backend server can be served via either http or https. In order to enable SSL, certificates paths must be specified and `USE_SSL` must be set to true. In order for the CORS policies to work, `CLIENT_URL` must be set to the correct URLs.

```bash
npm run start
```
