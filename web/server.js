const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const axios = require('axios');
const config = require('./src/config.json');

app.listen(port, () => {
  console.log(`listening on ${port}`);
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.get('/auth/redirect', async (req, res) => {
  const code = req.query.code;
  const params = new URLSearchParams();
  let user;
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

    const modId = '987045537645727766';
    const staffId = '987045537645727765';
    if (
      !userDataResponse.roles.find(role => role === modId || role === staffId)
    )
      return;

    return res.send(userDataResponse);
  } catch (error) {
    console.log('Error', error);
    return res.send('Some error occurred! ');
  }
});
