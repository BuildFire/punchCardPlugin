// eslint-disable-next-line no-unused-vars
const contentView = {
  _uiElements: {
    introContent: null,
    form: {
      rewardName: null,
      cardSize: null,
      rewardNameError: null,
    },
  },
  _initializeDomElements() {
    this._initUiElements();
    this._initValues();
    this._setupEventListeners();
  },
  _initUiElements() {
    this.introContent = document.getElementById('introductionWYSIWYGContent');
    this._uiElements.form.rewardName = document.getElementById('rewardName');
    this._uiElements.form.cardSize = document.getElementById('cardSize');
    this._uiElements.form.rewardNameError = document.getElementById('rewardNameError');

  },
  _initValues() {
    this._uiElements.form.rewardName.value = contentState.settings.rewardName;
    this._uiElements.form.cardSize.value = contentState.settings.cardSize;
  },
  _setupEventListeners() {
    this._uiElements.form.rewardName.addEventListener('input', (event) => {
      if (!event.target.value.trim()) {
        this._uiElements.form.rewardNameError.classList.remove('hidden');
        return;
      }
      contentState.settings.rewardName = event.target.value;
      this._uiElements.form.rewardNameError.classList.add('hidden');
      contentController.saveSettings(500).then(() => {
        cpShared.syncWithWidget({ cmd: 'contentChanged', data: { rewardName: event.target.value } });
      });
    });

    this._uiElements.form.cardSize.addEventListener('change', (event) => {
      contentState.settings.cardSize = Number(event.target.value);
      contentController.saveSettings(500).then(() => {
        cpShared.syncWithWidget({ cmd: 'cardChanged', data: { cardSize: Number(event.target.value) } });
      });
    });
  },

  init() {
    this._initializeDomElements();
  },
};
