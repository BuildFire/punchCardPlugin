// eslint-disable-next-line no-unused-vars
const cpShared = {
  syncTimeOut: null,
  syncWithWidget({ cmd, data }) {
    clearTimeout(this.syncTimeOut);
    setTimeout(() => {
      buildfire.messaging.sendMessageToWidget({ cmd, data });
    }, 500);
  },
};
