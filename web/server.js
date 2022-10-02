const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const axios = require('axios');
const config = require('./src/config.json');
const session = require('express-session');
const fs = require('fs');

app.listen(port, () => {
  console.log(`listening on ${port}`);
});

app.use(
  session({
    secret: '@#@$DISCORDSECRET#@$#$',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.get('/auth', (req, res) => {
  let readDataFile = fs.readFileSync('./data/auth.json');
  let auth = JSON.parse(readDataFile);

  if (auth[req.sessionID] && auth[req.sessionID]?.Auth === true) {
    return res.redirect('/console');
  } else
    return res.redirect(
      'https://discord.com/api/oauth2/authorize?client_id=957579723951714334&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fdiscord%2Fredirect&response_type=code&scope=identify%20email%20guilds%20guilds.join%20guilds.members.read'
    );
});

app.get('/auth/discord/redirect', async (req, res) => {
  var userSession = req.session;
  let readDataFile = fs.readFileSync('./data/auth.json');
  let auth = JSON.parse(readDataFile);

  const code = req.query.code;
  const params = new URLSearchParams();
  params.append('client_id', config.client_id);
  params.append('client_secret', config.client_secret);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append(
    'redirect_uri',
    'http://localhost:3000' + config.client_redirect
  );

  try {
    const response = await axios.post(
      'https://discord.com/api/oauth2/token',
      params
    );
    const nanocraftId = '987045537595420752';
    const { access_token, token_type } = response.data;
    const userDataResponse = await axios.get(
      `https://discord.com/api/users/@me/guilds/${nanocraftId}/member`,
      {
        headers: {
          authorization: `${token_type} ${access_token}`,
        },
      }
    );

    userSession.userData = userDataResponse.data;

    const modId = '987045537645727766';
    const staffId = '987045537645727765';
    if (
      !userDataResponse.data.roles?.find(
        role => role === modId || role === staffId
      )
    ) {
      userSession.Auth = false;
      auth[req.sessionID] = userSession;
      return res.redirect('/');
    }

    userSession.Auth = true;
    auth[req.sessionID] = userSession;
    fs.writeFileSync('./data/auth.json', JSON.stringify(auth));
    return res.redirect(`/console`);
  } catch (error) {
    console.log('Error', error);
    return res.send('Some error occurred! ');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});
