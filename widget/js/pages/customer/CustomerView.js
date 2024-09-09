const CustomerView = {
  _uiElement: {
    cardName: null,
    qrCodeElement: null,
    qrSkeleton: null,
    introductionWYSIWYG: null,
    customerUserId: null,
    historyIcon: null,
    incrementButton: null,
    decrementButton: null,
    newStampsValue: null,
    confirmTransactionBtn: null,
    customerInfo: {
      userName: null,
      userImage: null,
      lifeTimeStamps: {
        title: null,
        value: null,
      },
      lifeTimeRedeems: {
        title: null,
        value: null,
      },
    },
    skeleton: {
      weysiwygContentSkeleton: null,
      cardSizeSkeleton: null,
    },
  },
  _listViewOptions: {
    settings: {
      newBehavior: true,
      showSearchBar: false,
      paginationEnabled: false,
    },
    translations: {
      emptyStateMessage: 'No rewards available yet',
    },
  },
  newStamps: 0,
  removedStamps: 0,
  _initUiElements() {
    const { isEmployee } = AuthManager;
    this._uiElement.cardName = document.getElementById('cardName');
    this._uiElement.historyIcon = document.getElementById('historyIcon');
    if (!isEmployee) {
      this._uiElement.qrCodeElement = document.getElementById('qrCode');
      this._uiElement.customerUserId = document.getElementById('customerUserId');
      this._uiElement.introductionWYSIWYG = document.getElementById('introductionWYSIWYG');
      this.openTransactionView = this._openTransactionView.bind(this);
      this._uiElement.historyIcon.addEventListener('click', this.openTransactionView);
    } else {
      this._uiElement.customerInfo.userName = document.getElementById('userName');
      this._uiElement.customerInfo.userImage = document.getElementById('userImage');
      this._uiElement.incrementButton = document.getElementById('incrementStamp');
      this._uiElement.decrementButton = document.getElementById('decrementStamp');
      this._uiElement.newStampsValue = document.getElementById('stampValue');
      this._uiElement.confirmTransactionBtn = document.getElementById('confirmTransactionBtn');
      this._uiElement.customerInfo.lifeTimeStamps.title = document.querySelector('#lifeTimeStamps .title');
      this._uiElement.customerInfo.lifeTimeStamps.value = document.querySelector('#lifeTimeStamps .value');
      this._uiElement.customerInfo.lifeTimeRedeems.title = document.querySelector('#lifeTimeRedeems .title');
      this._uiElement.customerInfo.lifeTimeRedeems.value = document.querySelector('#lifeTimeRedeems .value');

      this.incrementStampsHandler = this._incrementStamps.bind(this);
      this.decrementStampsHandler = this._decrementStamps.bind(this);
      this.addNewTransactionHandler = this._addNewTransaction.bind(this);

      this._uiElement.incrementButton.addEventListener('click', this.incrementStampsHandler);
      this._uiElement.decrementButton.addEventListener('click', this.decrementStampsHandler);
      this._uiElement.confirmTransactionBtn.addEventListener('click', this.addNewTransactionHandler);
    }
  },
  reset() {
    if (AuthManager.isEmployee) {
      this._uiElement.incrementButton.removeEventListener('click', this.incrementStampsHandler);
      this._uiElement.decrementButton.removeEventListener('click', this.decrementStampsHandler);
      this._uiElement.confirmTransactionBtn.removeEventListener('click', this.addNewTransactionHandler);
      this._uiElement.newStampsValue.innerHTML = 0;
      this.newStamps = 0;
      this.removedStamps = 0;
    }

    this._uiElement.historyIcon.removeEventListener('click', this.openTransactionView);

    const rewardItems = document.querySelectorAll('.reward-item');
    rewardItems.forEach((rewardItem) => rewardItem.remove());
  },
  _incrementStamps() {
    this.newStamps = CustomerController.incrementStamps(this.newStamps);
    if (this.newStamps <= 0) {
      this.removedStamps = this.newStamps;
    }
    this._uiElement.newStampsValue.innerHTML = this.newStamps;
    this.drawStamps(widgetAppState.settings.cardSize);
    let availbleRewardLength = CustomerController.getAvailbleRewardLength(this.newStamps, widgetAppState.currentCustomer.currentStamps, widgetAppState.settings.cardSize);
    availbleRewardLength += widgetAppState.currentCustomer.availableRewards.length;
    this._initRewardList(availbleRewardLength);
    this._updateConfirmButton();
  },
  _decrementStamps() {
    if (widgetAppState.currentCustomer.currentStamps + this.newStamps === 0) {
      return;
    }
    this.newStamps = CustomerController.decrementStamps(this.newStamps,
      widgetAppState.currentCustomer.currentStamps + this.newStamps);
    if (this.newStamps < 0) {
      this.removedStamps = this.newStamps;
    }
    this._uiElement.newStampsValue.innerHTML = this.newStamps;
    this.drawStamps(widgetAppState.settings.cardSize);
    let availbleRewardLength = CustomerController.getAvailbleRewardLength(this.newStamps, widgetAppState.currentCustomer.currentStamps, widgetAppState.settings.cardSize);
    availbleRewardLength += widgetAppState.currentCustomer.availableRewards.length;
    this._initRewardList(availbleRewardLength);
    this._updateConfirmButton();
  },
  _addNewTransaction() {
    try {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');

      const checkedCheckboxes = Array.from(checkboxes).filter((checkbox) => checkbox.checked);
      CustomerController.addNewTransaction(this.newStamps, widgetAppState.currentCustomer.currentStamps,
        widgetAppState.settings.cardSize, widgetAppState.currentCustomer.availableRewards, widgetAppState.currentCustomer.lifeTimeRedeems,
        widgetAppState.currentCustomer,
        checkedCheckboxes.length).then((data) => {
        this.showToastMessage(data);
        TransactionView._initEmployeeListView().then(() => {
          widgetAppRouter.back();
          if (widgetAppState.openedFromScanner) {
            EmployeeView._openScanner();
          }
          this.reset();
        });
      });
    } catch (error) {
      console.error('Error while adding new transaction:', error);
    }
  },
  async showToastMessage(data) {
    let message = '';
    if (data.newStamps > 0) {
      const stampsMessage = await getLanguage('general.stampsAdded');
      message += `${data.newStamps} ${stampsMessage}`;
    }
    if (data.newRewards > 0) {
      const rewardsMessage = await getLanguage('general.rewardEarned');
      message += message ? `, ${data.newRewards} ${rewardsMessage}` : `${data.newRewards} ${rewardsMessage}`;
    }
    if (data.redeems > 0) {
      const redeemsMessage = await getLanguage('general.rewardRedeemed');
      message += message ? `, ${data.redeems} ${redeemsMessage}` : `${data.redeems} ${redeemsMessage}`;
    }
    buildfire.dialog.toast({ message });
  },

  async _initValues() {
    const { isEmployee } = AuthManager;
    this._uiElement.cardName.innerHTML = widgetAppState.settings.rewardName;
    if (!isEmployee) {
      this._uiElement.introductionWYSIWYG.innerHTML = '';
      this._uiElement.customerUserId.innerHTML = widgetAppState.currentCustomer.customerUserId;
      if (widgetAppState.settings.introductionWYSIWYG.trim() !== '') {
        this._uiElement.introductionWYSIWYG.innerHTML = widgetAppState.settings.introductionWYSIWYG;
      } else {
        this._uiElement.introductionWYSIWYG.classList.display = 'none';
      }
    } else {
      const lifeTimeStampsMessage = await getLanguage('general.lifeTimeStamps');
      const lifeTimeRedeemsMessage = await getLanguage('general.lifeTimeRedeems');

      this._uiElement.customerInfo.userName.innerHTML = widgetAppState.currentCustomer.userName;
      this._uiElement.customerInfo.userImage.src = widgetAppState.currentCustomer.imageUrl;
      this._uiElement.customerInfo.lifeTimeStamps.title.innerHTML = `${lifeTimeStampsMessage}:`;
      this._uiElement.customerInfo.lifeTimeStamps.value.innerHTML = widgetAppState.currentCustomer.lifeTimeStamps;
      this._uiElement.customerInfo.lifeTimeRedeems.title.innerHTML = `${lifeTimeRedeemsMessage}:`;
      this._uiElement.customerInfo.lifeTimeRedeems.value.innerHTML = widgetAppState.currentCustomer.lifeTimeRedeems;
    }

    this.drawStamps(widgetAppState.settings.cardSize);
  },
  drawStamps(cardSize) {
    const stampContainer1 = document.getElementById('stampList1');
    const stampContainer2 = document.getElementById('stampList2');
    stampContainer1.innerHTML = '';
    stampContainer2.innerHTML = '';
    const isTablet = window.innerWidth > 768;
    if (cardSize === 6) {
      stampContainer1.style.width = '80%';
      stampContainer1.style.margin = '0 auto';
    } else {
      stampContainer1.style.width = '100%';
      stampContainer1.style.margin = '0';
    }

    if (cardSize > 5 && !isTablet) {
      if (cardSize === 7 || cardSize === 9 || cardSize === 6) {
        stampContainer2.style.width = '80%';
      } else {
        stampContainer2.style.width = '100%';
      }

      const cardSize1 = Math.ceil(cardSize / 2);
      const cardSize2 = Math.floor(cardSize / 2);

      this.createStamps(stampContainer1, cardSize1, 0);
      this.createStamps(stampContainer2, cardSize2, cardSize1);
    } else {
      this.createStamps(stampContainer1, cardSize, 0);
    }
  },
  createStamps(container, size, start = 0) {
    // Calculate total stamps including removed stamps
    const totalStamps = widgetAppState.currentCustomer.currentStamps + this.newStamps;
    const { cardSize } = widgetAppState.settings;
    const currentStampsWithRemoved = widgetAppState.currentCustomer.currentStamps + this.removedStamps;

    for (let i = 0; i < size; i++) {
      const stampItem = document.createElement('div');
      stampItem.classList.add('stamp-item');
      stampItem.style.width = `${100 / size}%`;
      const itemImage = document.createElement('img');

      if (AuthManager.isEmployee) {
        if (totalStamps > cardSize) {
          const diff = (totalStamps % cardSize);
          if (i + start < diff) {
            if (i === diff && diff !== 0) {
              itemImage.classList.add('stamp-border');
            } else {
              itemImage.src = './images/un-stamp.png';
            }
          } else if (diff === 0) {
            itemImage.src = './images/un-stamp.png';
          } else {
            itemImage.classList.add('stamp-border');
          }
        } else if (i + start < currentStampsWithRemoved) {
          itemImage.src = './images/stamp.png';
        } else if (i + start < this.newStamps + currentStampsWithRemoved) {
          itemImage.src = './images/un-stamp.png';
        } else {
          itemImage.classList.add('stamp-border');
        }
      } else if (i + start < currentStampsWithRemoved) {
        itemImage.src = resizeImage(widgetAppState.settings.design.stampedImageUrl) || './images/stamp.png';
      } else {
        itemImage.src = resizeImage(widgetAppState.settings.design.unstampedImageUrl) || './images/un-stamp.png';
      }

      stampItem.appendChild(itemImage);
      container.appendChild(stampItem);
    }
  },
  _updateConfirmButton() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    const isCheckboxSelected = Array.from(checkboxes).some((checkbox) => checkbox.checked);
    const isNewStampsChanged = this.newStamps !== 0;

    this._uiElement.confirmTransactionBtn.disabled = !(isCheckboxSelected || isNewStampsChanged);
  },

  _initQrCode() {
    while (this._uiElement.qrCodeElement.firstChild) {
      this._uiElement.qrCodeElement.removeChild(this._uiElement.qrCodeElement.firstChild);
    }
    new QRCode(this._uiElement.qrCodeElement, {
      text: `${String(widgetAppState.currentCustomer.customerUserId)}-${widgetAppState.secretKey}`,
      width: 150,
      height: 150,
      colorDark: '#000000',
      colorLight: '#ffffff',
    });
  },

  async _initListView() {
    this._listViewOptions.translations.emptyStateMessage = await getLanguage('general.rewardsEmptyState');
    document.querySelector('#home #listContainer').innerHTML = '';

    const listView = new buildfire.components.listView('#home #listContainer', this._listViewOptions);
    const listViewItemsPromises = widgetAppState.currentCustomer.availableRewards.map(async (item, index) => ({
      title: widgetAppState.settings.rewardName,
      subtitle: await formatDate(item.grantedOn).then((date) => date),
      id: index,
    }));
    const listViewItems = await Promise.all(listViewItemsPromises);

    listView.append(listViewItems);
  },
  _initRewardList(rewardsLength = widgetAppState.currentCustomer.availableRewards.length) {
    const availableRewardList = document.getElementById('availableRewardList');
    availableRewardList.innerHTML = '';

    for (let i = 0; i < rewardsLength; i++) {
      const rewardItem = document.createElement('div');
      rewardItem.classList.add('reward-item');

      const itemTitle = document.createElement('p');
      itemTitle.classList.add('reward-title');
      itemTitle.textContent = widgetAppState.settings.rewardName;
      rewardItem.appendChild(itemTitle);

      const checkbox = this._createCheckbox(i);
      rewardItem.appendChild(checkbox);

      const checkboxInput = rewardItem.querySelector('input[type="checkbox"]');

      checkboxInput.addEventListener('click', (event) => {
        event.stopPropagation();
        this._updateConfirmButton();
      });

      availableRewardList.appendChild(rewardItem);
      availableRewardList.classList.remove('empty-state');

      rewardItem.addEventListener('click', (event) => {
        event.stopPropagation();
        checkboxInput.checked = !checkboxInput.checked;
        this._updateConfirmButton();
      });
    }

    if (rewardsLength === 0) {
      const emptyState = document.createElement('img');
      emptyState.src = './images/empty-state.png';
      availableRewardList.classList.add('empty-state');
      availableRewardList.appendChild(emptyState);
    }
  },

  _createCheckbox(index) {
    const template = document.getElementById('template');
    return template.content.cloneNode(true);
  },

  toggleSkeleton(action, showWysiwygContent) {
    document.getElementById('skeletonContainer')
      .classList
      .remove('hidden');
    if (action === 'start') {
      if (showWysiwygContent) {
        this._uiElement.skeleton.weysiwygContentSkeleton = new buildfire.components.skeleton('.skeleton-wysiwyg',
          { type: 'image, sentence' }).start();
      }
      this._uiElement.skeleton.cardSizeSkeleton = new buildfire.components.skeleton('.skeleton-card-size',
        { type: 'image' }).start();
      new buildfire.components.skeleton('#listSkeleton',
        { type: 'sentence, sentence, sentence, sentence, sentence' }).start();
    } else {
      if (showWysiwygContent) {
        this._uiElement.skeleton.weysiwygContentSkeleton.stop();
      }
      this._uiElement.skeleton.cardSizeSkeleton.stop();
      document.getElementById('skeletonContainer')
        .classList
        .add('hidden');
    }
  },

  _openTransactionView() {
    widgetAppRouter.goToPage('customerTransaction');
    widgetAppRouter.push({ pageId: 'customerTransaction', pageName: 'customerTransaction', name: 'history' });
    TransactionView._initCustomerListView();
  },
  showElements() {
    const { isEmployee } = AuthManager;
    if (isEmployee) {
      document.querySelectorAll('.employee-only').forEach((element) => {
        element.classList.remove('hidden');
      });
    } else {
      document.querySelectorAll('.customer-only').forEach((element) => {
        element.classList.remove('hidden');
      });
    }
  },

  init() {
    const { isEmployee } = AuthManager;
    this.showElements();
    if (!isEmployee) {
      this._initUiElements();
      this._initValues();
      this._initQrCode();
      this._initListView();
    } else {
      this._initUiElements();
      this._initValues();
      this._initRewardList();
    }
    widgetAppRouter.push({ pageId: 'home', pageName: 'home', name: 'home' });
  },
};
