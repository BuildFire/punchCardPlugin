/* eslint-disable no-template-curly-in-string */

const searchTableConfig = {
  options: {
    showEditButton: false,
    showDeleteButton: false,
  },
  columns: [{
    header: 'Date',
    data: '<span class=\'margin-bottom-five\'>${TransactionController.formatDate(data.createdOn)}</span>',
    type: 'string',
    width: '165px',
    sortBy: 'date1',
    defaultSorted: true,
  }, {
    header: 'Customer',
    data: '<span class=\'margin-bottom-five\'>${data.customerName}</span>',
    type: 'string',
    width: '200px',
  }, {
    header: 'Stamps',
    data: '<span class=\'margin-bottom-five\'>${data.changeValue}</span>',
    type: 'string',
    width: '90px',
  }, {
    header: 'Rewards',
    data: '<span class=\'margin-bottom-five\'>${TransactionController.getRewards(data)}</span>',
    type: 'string',
    width: '90px',
  },
  {
    header: 'Redeems',
    data: '<span class=\'margin-bottom-five\'>${TransactionController.getRedeems(data)}</span>',
    type: 'string',
    width: '90px',
  },
  {
    header: 'Authorized by',
    data: '<span class=\'margin-bottom-five\'>${data.employeeName}</span>',
    type: 'string',
    width: '200px',
  },
  ],
};

// eslint-disable-next-line no-unused-vars
const TransactionController = {
  transactionsTable: null,
  transactions: [],
  maxTransactionsReached: false,
  page: 0,
  pageSize: 50,
  sortedBy: 'date1',
  sortType: -1,
  emptyMessageType: 'noTransaction',

  handleSortTable(sortConfig) {
    this.sortedBy = sortConfig.key;
    this.sortType = sortConfig.type;
    this.maxTransactionsReached = false;
    this.page = 0;
    this.transactions = [];

    this.transactionsTable.clearData();

    transactionUtils.handleEmptyState(true);
    this.getTransactionsRecord();
  },
  checkEmptyTable() {
    const table = document.querySelector('#transactionTableContainer');
    const notHiddenRows = table.querySelectorAll('tr:not(.hidden)');

    if (!notHiddenRows.length) {
      transactionUtils.handleEmptyState(false, true, this.emptyMessageType);
      table.classList.add('hidden');
    }
  },

  appendToTable(items) {
    const transactionsTableContainer = document.getElementById('transactionTableContainer');

    if (items && items.length) {
      transactionsTableContainer.classList.remove('hidden');
      items.forEach((item) => {
        this.transactionsTable.renderRow(item);
      });
    }
  },

  getTransactionsRecord() {
    if (this.maxTransactionsReached) return;
    this.transactionsTable.table.classList.add('loading-transaction-table');

    transactionUtils.handleEmptyState(true, false, this.emptyMessageType);
    const filterOption = {
      sort: { [`_buildfire.index.${this.sortedBy}`]: this.sortType },
    };

    Transactions.search(filterOption)
      .then(async (transactionsData) => {
        this.page += 1;
        this.maxTransactionsReached = transactionsData.data.length < 50;

        const referrerList = transactionsData.data.map((referee) => ({
          ...referee,
          date: new Date(referee.createdOn).toLocaleDateString(),
        }));
        this.transactions = [...referrerList, ...this.transactions];
        transactionUtils.handleEmptyState(false, false, this.emptyMessageType);
        this.appendToTable(referrerList);
        this.transactionsTable.canSort = true;
        this.transactionsTable.table.classList.remove('loading-transaction-table');
        this.checkEmptyTable();
      })
      .catch((err) => {
        console.error(err);
        this.transactionsTable.canSort = true;
        this.transactionsTable.table.classList.remove('loading-transaction-table');
      });
  },
  getRewards(data) {
    if (data.action === 'earned') {
      return data.rewards;
    }
    return 0;
  },
  getRedeems(data) {
    if (data.action === 'redeemed') {
      return data.rewards;
    }

    return 0;
  },
  formatDate(dateString) {
    console.log('dateString:', dateString);
    const date = new Date(dateString);

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${month}/${day}/${year}, ${hours}:${formattedMinutes} ${ampm}`;
  },

  init() {
    this.transactionsTable = new SearchTable('transactionTableContainer', searchTableConfig);

    this.transactionsTable.canSort = true;

    this.transactionsTable.onSort = (event) => this.handleSortTable(event);
    this.transactionsTable.onLoadMore = () => this.getTransactionsRecord();
    this.getTransactionsRecord();
  },
};

window.onload = () => {
  TransactionController.init();
};
