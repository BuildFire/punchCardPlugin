/* eslint-disable max-len */
const NotificationsManager = {
  _scheduleNotification(options, _callback) {
    const {
      title,
      description,
      users,
    } = options;

    buildfire.notifications.pushNotification.schedule(
      {
        title,
        users,
        text: description,
        queryString: `&dld=${encodeURIComponent(JSON.stringify({ earned: true }))}`,
        sendToSelf: false,
      }, _callback,
    );
  },

  async sendEarnedReward(userId) {
    const notificationTitle = await getLanguage('notifications.newReward');
    const notificationDescription = await getLanguage('notifications.newRewardDescription');
    const notificationOptions = {
      title: notificationTitle,
      description: notificationDescription,
      users: [userId],
    };
    NotificationsManager._scheduleNotification(notificationOptions, (err, res) => {
      if (err) console.error(err);
    });
  },
  init() {
    buildfire.notifications.pushNotification.subscribe(
      {},
      (err, subscribed) => {
        if (err) return console.error(err);
      },
    );
  },
};
