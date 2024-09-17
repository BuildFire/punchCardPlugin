// eslint-disable-next-line no-unused-vars
const contentController = {
  timerDelay: null,
  _saveWithDelay() {
    clearTimeout(this.timerDelay);
    return new Promise((resolve, reject) => {
      this.timerDelay = setTimeout(() => {
        Settings.save(contentState.settings)
          .then(resolve)
          .catch((error) => {
            console.error('Error in saveWithDelay:', error);
            reject(error);
          });
      }, 500);
    });
  },
  initIntroWysiwyg() {
    tinymce.init({
      selector: '#introductionWYSIWYGContent',
      setup: (editor) => {
        editor.on('change keyUp', () => {
          contentState.settings.introductionWYSIWYG = editor.getContent();
          this._saveWithDelay().then(() => {
            cpShared.syncWithWidget({
              cmd: 'contentChanged',
              data: { content: contentState.settings.introductionWYSIWYG },
            });
          });
        });

        editor.on('init', () => {
          editor.setContent(contentState.settings.introductionWYSIWYG || '');
        });
      },
    });
  },
  async getSettings() {
    await AuthManager.refreshCurrentUser();
    const { settingData, isNewInstance } = await Settings.get();
    contentState.settings = settingData;
    if (isNewInstance) {
      await Settings.save(contentState.settings);
      await UserCodeSequences.initializeCodeSequence();
      await AnalyticsManager.init();
    }
  },
  async saveSettings() {
    await this._saveWithDelay();
  },
};
