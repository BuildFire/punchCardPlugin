// eslint-disable-next-line no-unused-vars
const TransactionView = {
  customerListView: null,
  translations: {},
  _customerListViewOptions: {
    settings: {
      itemImage: 'none',
      showSearchBar: false,
      paginationEnabled: true,
      enableSkeleton: false,
      paginationOptions: {
        page: 0,
        pageSize: 50,
      },
    },
    translations: {
      emptyStateMessage: '',
    },
  },
  _employeeListViewOptions: {
    settings: {
      itemImage: 'circle',
      showSearchBar: false,
      paginationEnabled: true,
      enableSkeleton: true,
      paginationOptions: {
        page: 0,
        pageSize: 50,
      },
    },
    translations: {
      emptyStateMessage: '',
    },
  },

  async _initCustomerListView() {
    this._customerListViewOptions.translations.emptyStateMessage = await getLanguage('general.customerHistoryEmptyState');
    document.getElementById('transactionCustomerList').innerHTML = '';
    document.getElementById('transactionCustomerList').classList.add('hidden');
    this.customerListView = new buildfire.components.listView('#transactionCustomerList', this._customerListViewOptions);
    this.translations = {
      rewardsEarned: await getLanguage('general.rewardsEarned'),
      rewardEarned: await getLanguage('general.rewardEarned'),
      rewardsRedeemed: await getLanguage('general.rewardsRedeemed'),
      rewardRedeemed: await getLanguage('general.rewardRedeemed'),
      stamps: await getLanguage('general.stamps'),
    };

    this.customerListView.onDataRequest = async (event, callback) => {
      const searchOptions = {
        filter: { '_buildfire.index.array1.string1': `customerId_${widgetAppState.currentCustomer.customerId}` },
        sort: { '_buildfire.index.date1': -1 },
        limit: event.pageSize,
        skip: event.page * event.pageSize,
        recordCount: true,
      };
      let type = '';
      for (let i = 0; i <= event.pageSize; i++) {
        if (i === event.pageSize) {
          type += 'sentence';
        } else {
          type += 'sentence, ';
        }
      }
      const skeleton = new buildfire.components.skeleton('#customerTransaction #transactionCustomerSkeletonContainer',
        { type }).start();

      TransactionController.getCustomerTransaction(searchOptions)
        .then(async (transactionData) => {
          const transactionList = transactionData.data.map(async (transaction, i) => {
            let title = '';
            if (transaction.action === Transaction.Action.EARNED) {
              if (transaction.rewards > 1) {
                title = `${this.translations.rewardsEarned}: ${transaction.rewards}`;
              } else {
                title = `${this.translations.rewardEarned}: ${transaction.rewards}`;
              }
            }
            if (transaction.action === Transaction.Action.REDEEMED) {
              if (transaction.rewards > 1) {
                title = `${this.translations.rewardsRedeemed}: ${transaction.rewards}`;
              } else {
                title = `${this.translations.rewardRedeemed}: ${transaction.rewards}`;
              }
            }
            if (transaction.action === Transaction.Action.STAMPS_CHANGE) {
              title = `${this.translations.stamps}: ${transaction.changeValue}`;
            }
            return {
              id: i + event.page * event.pageSize,
              title,
              subtitle: await formatDate(transaction.createdOn),

            };
          });
          const listViewItems = await Promise.all(transactionList);
          callback(listViewItems);
          skeleton.stop();
          document.getElementById('transactionCustomerList').classList.remove('hidden');
        })
        .catch((error) => {
          console.error('Error getting transactions', error);
        });
    };
  },

  async _initEmployeeListView() {
    this._employeeListViewOptions.translations.emptyStateMessage = await getLanguage('general.employeeHistoryEmptyState');
    document.getElementById('transactionTrainerList').innerHTML = '';
    const listView = new buildfire.components.listView('#transactionTrainerList',
      this._employeeListViewOptions);

    this.translations = {
      rewardsEarned: await getLanguage('general.rewardsEarned'),
      rewardEarned: await getLanguage('general.rewardEarned'),
      rewardsRedeemed: await getLanguage('general.rewardsRedeemed'),
      rewardRedeemed: await getLanguage('general.rewardRedeemed'),
      stamps: await getLanguage('general.stamps'),
    };

    listView.onDataRequest = (event, callback) => {
      const searchOptions = {
        sort: { '_buildfire.index.date1': -1 },
        limit: event.pageSize,
        skip: event.page * event.pageSize,
      };

      TransactionController.getEmployeeTransaction(searchOptions)
        .then((transactionData) => {
          const transactionList = transactionData.data.map(async (transaction, i) => {
            try {
              const user = await AuthManager.getUserProfile(transaction.customerId);

              let description = '';
              if (transaction.action === Transaction.Action.EARNED) {
                if (transaction.rewards > 1) {
                  description = `${this.translations.rewardsEarned}: ${transaction.rewards}`;
                } else {
                  description = `${this.translations.rewardEarned}: ${transaction.rewards}`;
                }
              }
              if (transaction.action === Transaction.Action.REDEEMED) {
                if (transaction.rewards > 1) {
                  description = `${this.translations.rewardsRedeemed}: ${transaction.rewards}`;
                } else {
                  description = `${this.translations.rewardRedeemed}: ${transaction.rewards}`;
                }
              }
              if (transaction.action === Transaction.Action.STAMPS_CHANGE) {
                description = `${this.translations.stamps}: ${transaction.changeValue}`;
              }
              return {
                id: transaction.id,
                title: userName(user),
                description,
                subtitle: await formatDate(transaction.createdOn),

                imageUrl: user?.imageUrl ? user.imageUrl : 'https://app.buildfire.com/app/media/avatar.png',
              };
            } catch (err) {
              console.error(err);
            }
          });

          return Promise.all(transactionList);
        })
        .then((transactionList) => {
          callback(transactionList);
        })
        .catch((error) => {
          console.error('Error getting user profiles', error);
        });
    };
  },

  init() {
    if (!AuthManager.isEmployee) {
      this._initCustomerListView();
    } else {
      this._initEmployeeListView();
    }
  },

};
