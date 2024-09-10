const EmployeeView = {
  dialog: null,

  _initFabSpeedDial() {
    const scannerOptions = {
      mainButton: {
        content: '<span class="material-icons">qr_code_scanner</span>',
        type: 'success',
      },
    };
    const formOptions = {
      mainButton: {
        content: '<span class="material-icons">pin</span>',
        type: 'default',
      },
    };

    const formFab = new buildfire.components.fabSpeedDial('#fabSpeedDialContainer', formOptions);
    const scannerFab = new buildfire.components.fabSpeedDial('#fabSpeedDialContainer', scannerOptions);
    scannerFab.onMainButtonClick = () => this._openScanner();
    formFab.onMainButtonClick = () => this._openMaterialForm();
  },

  _initEventListener() {
    this.dialog = new mdc.dialog.MDCDialog(document.querySelector('.mdc-dialog'));
    const confirmBtn = document.getElementById('confirmBtn');
    const closeBtn = document.getElementById('closeBtn');
    const userIdError = document.getElementById('userIdError');
    document.getElementById('userIdField').addEventListener('input', (event) => {
      if (event.target.value.trim() !== '') {
        document.querySelector('.hint-text').classList.add('top');
      } else {
        document.querySelector('.hint-text').classList.remove('top');
      }
    });

    confirmBtn.addEventListener('click', async () => {
      const userId = document.getElementById('userIdField').value;
      if (!userId) {
        userIdError.innerText = await getLanguage('general.userIdRequired');
        return;
      }
      if (userId.length < 5) {
        userIdError.innerText = await getLanguage('general.invalidId');
        return;
      }
      confirmBtn.disabled = true;

      this._openCustomerProfile(userId).then(() => {
        widgetAppState.openedFromScanner = false;
        this.dialog.close();
        confirmBtn.disabled = false;
        userIdError.innerText = '';
        document.getElementById('userIdField').value = '';
      }).catch(async (error) => {
        userIdError.innerText = await getLanguage('general.userNotFound');
        confirmBtn.disabled = false;
      });
    });
    closeBtn.addEventListener('click', async () => {
      confirmBtn.disabled = false;
      userIdError.innerText = '';
      document.getElementById('userIdField').value = '';
    });
  },
  _openScanner() {
    const isWeb = buildfire.getContext().device.platform === 'web';
    if (isWeb) return;
    buildfire.services.camera.barcodeScanner.scan(
      {
        preferFrontCamera: false,
        showFlipCameraButton: false,
        formats: 'QR_CODE',
      },
      async (err, result) => {
        if (err) return console.error(err);
        if (result.cancelled) {
          return null;
        }

        const resultText = result.text;
        const parts = resultText.split('-');
        if (parts.length < 2) {
          buildfire.dialog.toast({
            message: 'Invalid QR code. Please try again.',
          });
          return null;
        }
        const userId = parts[0];
        const secretKey = parts[1];
        if (secretKey !== widgetAppState.secretKey) {
          buildfire.dialog.toast({
            message: await getLanguage('general.invalidQRCode'),
          });
          return null;
        }
        if (!userId) {
          buildfire.dialog.toast({
            message: await getLanguage('general.invalidId'),
          });
          return null;
        }

        this._openCustomerProfile(userId).then(() => {
          widgetAppState.openedFromScanner = true;
        }).catch(async (error) => {
          buildfire.dialog.toast({
            message: await getLanguage('general.userNotFound'),
          });
          console.log(error);
        });
      },
    );
  },
  _openMaterialForm() {
    this.dialog.open();
  },
  async  _openCustomerProfile(userId) {
    try {
      const result = await CustomerController.getCustomerInfo(userId, widgetAppState.settings.cardSize);
      if (result.currentStamps) {
        widgetAppState.currentCustomer.currentStamps = result.currentStamps;
        widgetAppState.currentCustomer.availableRewards = result.availableRewards;
      }
      widgetAppState.currentStamps = widgetAppState.currentCustomer.currentStamps;
      widgetAppState.availableRewards = widgetAppState.currentCustomer.availableRewards;
      const userData = await AuthManager.getUserProfile(widgetAppState.currentCustomer.customerId);
      widgetAppState.currentCustomer.userName = userName(userData);
      widgetAppState.currentCustomer.imageUrl = userData?.imageUrl ? userData.imageUrl : 'https://app.buildfire.com/app/media/avatar.png';
      CustomerView.init();
      widgetAppRouter.push({ pageId: 'home', pageName: 'home', name: 'home' });

    } catch (error) {
      throw error;
    }
  },
  init() {
    this._initEventListener();
    this._openScanner();
    TransactionView.init();
    this._initFabSpeedDial();
    widgetAppRouter.goToPage('employeeTransaction');
  },
};
