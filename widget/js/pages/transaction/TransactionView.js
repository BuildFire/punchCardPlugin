// eslint-disable-next-line no-unused-vars
const TransactionView = {
  customerListView: null,
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
      emptyStateMessage: 'No Transaction Found',
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
      emptyStateMessage: 'No Transaction Found',
    },
  },

  async _initCustomerListView() {
    this._customerListViewOptions.translations.emptyStateMessage = await getLanguage('general.customerHistoryEmptyState');
    document.getElementById('transactionCustomerList').innerHTML = '';
    document.getElementById('transactionCustomerList').classList.add('hidden');
    this.customerListView = new buildfire.components.listView('#transactionCustomerList', this._customerListViewOptions);

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
                const text = await getLanguage('general.rewardsEarned');
                title = `${text}: ${transaction.rewards}`;
              } else {
                const text = await getLanguage('general.rewardEarned');
                title = `${text}: ${transaction.rewards}`;
              }
            }
            if (transaction.action === Transaction.Action.REDEEMED) {
              if (transaction.rewards > 1) {
                const text = await getLanguage('general.rewardsRedeemed');
                title = `${text}: ${transaction.rewards}`;
              } else {
                const text = await getLanguage('general.rewardRedeemed');
                title = `${text}: ${transaction.rewards}`;
              }
            }
            if (transaction.action === Transaction.Action.STAMPS_CHANGE) {
              const stamps = await getLanguage('general.stamps');
              title = `${stamps}: ${transaction.changeValue}`;
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
                  const text = await getLanguage('general.rewardsEarned');
                  description = `${text}: ${transaction.rewards}`;
                } else {
                  const text = await getLanguage('general.rewardEarned');
                  description = `${text}: ${transaction.rewards}`;
                }
              }
              if (transaction.action === Transaction.Action.REDEEMED) {
                if (transaction.rewards > 1) {
                  const text = await getLanguage('general.rewardsRedeemed');
                  description = `${text}: ${transaction.rewards}`;
                } else {
                  const text = await getLanguage('general.rewardRedeemed');
                  description = `${text}: ${transaction.rewards}`;
                }
              }
              if (transaction.action === Transaction.Action.STAMPS_CHANGE) {
                const stamps = await getLanguage('general.stamps');
                description = `${stamps}: ${transaction.changeValue}`;
              }
              return {
                id: transaction.id,
                title: user?.displayName ? user.displayName : 'User',
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
