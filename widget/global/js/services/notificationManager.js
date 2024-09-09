/* eslint-disable max-len */

const notificationsManager = {
  scheduleNotification(options, _callback) {
    const {
      title,
      users,
    } = options;

    buildfire.notifications.pushNotification.schedule(
      {
        title,
        users,
        queryString: `&dld=${encodeURIComponent(JSON.stringify({ newRegistration: true }))}`,
        sendToSelf: false,
      }, _callback,
    );
  },

  evaluateNotificationLanguageString(stringKey) {
    return new Promise((resolve, reject) => {
      buildfire.language.get({ stringKey }, (err, result) => {
        if (err) {
          console.warn(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  initNotifications() {
    buildfire.notifications.pushNotification.subscribe(
      {},
      (err, subscribed) => {
        if (err) return console.error(err);
      },
    );
  },
};
