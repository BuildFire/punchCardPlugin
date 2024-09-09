// eslint-disable-next-line no-unused-vars
const contentController = {
  timerDelay: null,
  _saveWithDelay(delay = 500) {
    clearTimeout(this.timerDelay);
    return new Promise((resolve, reject) => {
      this.timerDelay = setTimeout(() => {
        Settings.save(contentState.settings)
          .then(resolve)
          .catch((error) => {
            console.error('Error in saveWithDelay:', error);
            reject(error);
          });
      }, delay);
    });
  },
  initIntroWysiwyg() {
    tinymce.init({
      selector: '#introductionWYSIWYGContent',
      setup: (editor) => {
        editor.on('change keyUp', () => {
          contentState.settings.introductionWYSIWYG = editor.getContent();
          this._saveWithDelay(500).then(() => {
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
    const settingData = await Settings.get();
    contentState.settings = settingData.data;
    if (settingData.init) {
      await UserCodeSequences.initializeCodeSequence();
      await AnalyticsManager.init();
    }
  },
  async saveSettings(delay) {
    await this._saveWithDelay(delay);
  },
};
