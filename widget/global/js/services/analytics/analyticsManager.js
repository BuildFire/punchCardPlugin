// eslint-disable-next-line no-unused-vars
class AnalyticsManager {
  static trackAction(eventKey, value) {
    buildfire.analytics.trackAction(eventKey, value);
  }

  static registerEvent(title, key, description) {
    buildfire.analytics.registerEvent({ title, key, description }, { silentNotification: true });
  }

  static init() {
    ANALYTICS_EVENTS.forEach((event) => {
      this.registerEvent(event.title, event.key, event.description);
    });
  }
}
