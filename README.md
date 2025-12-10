# Envelope budget
This is a budgeting app designed to allow users to input income per month and allocate that to containers called envelopes.  It then tracks expenses in each envelope and lets the user know how much of the allocation they've used up.

## Prequisites
Node.js v24.11.1
Angular 21.0.2
Atlas MongoDB (make sure the machine you want to run the backend on is whitelisted in networking settings)
Firebase

## Backend setup
Pull the repository.

Run:
```
npm install
```

You need to have a Firebase admin sdk key file in json format, paste that into the root of envelope-backend.
Make a '.env' file in the root of envelope-backend in the following format:

```
MONGO_CONNECTION_STRING=YOUR-MONGO-CONNECTION-STRING-FROM-MONGO

FIREBASE_SERVICE_ACCOUNT_PATH=YOUR-JSON-FILE-THAT-YOU-PASTED-ABOVE
```
Change the strings as needed in .env.

Run the backend with 'npm start'

## Frontend setup
Pull the repository.

Run:
```
npm install
```

Make from envelope-frontent/src, make a folder named environments.  Add a file named 'environment.ts' with the following format:

```
export const environment = {
  firebase: {
    apiKey: 'xxx',
    authDomain: 'xxx',
    projectId: 'xxx',
    storageBucket: 'xxx',
    messagingSenderId: 'xxx',
    appId: 'xxx'
  },
  backendURL: 'http://localhost:3000'
};
```

You can change the backend url port to match what you are running the backend on.  Firebase will provide settings for that sectiion, it's pretty much a copy and paste of what they provide.
