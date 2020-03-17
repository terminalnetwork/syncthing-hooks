const { fetchNewEvents } = require('./api');

require('dotenv').config();

const state = {};

setInterval(async () => {
  const { events, seenIds } = await fetchNewEvents(state.seenIds);
  state.seenIds = seenIds;
  events.forEach(event => {
    console.log(event);
  });
}, 1000);
