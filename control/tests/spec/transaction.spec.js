describe('Transactions Repository', () => {
  let mockData;
  const dummyTransactions = [
    {
      action: Transaction.Action.STAMPS_CHANGE,
      customerId: 'dummyCustomerId',
      employeeId: 'dummyEmployeeId',
      customerName: 'Dummy Customer1',
      employeeName: 'Dummy Employee1',
      changeValue: 10,
      rewards: 5,
      createdBy: 'dummyCreator',
    },
    {
      action: Transaction.Action.REDEEMED,
      customerId: 'dummyCustomerId',
      employeeId: 'dummyEmployeeId',
      customerName: 'Dummy Customer2',
      employeeName: 'Dummy Employee2',
      changeValue: 10,
      rewards: 5,
      createdBy: 'dummyCreator',
    },
  ];
  beforeEach(() => {
    spyOn(buildfire.publicData, 'search').and.callFake((options, tag, callback) => {
      callback(null, { result: [{ data: new Transaction().toJSON(), id: 'testId' }], totalRecord: 1 });
    });
    spyOn(buildfire.publicData, 'insert').and.callFake((data, tag, callback) => {
      callback(null, { data: new Transaction(data).toJSON() });
    });
    spyOn(buildfire.publicData, 'bulkInsert').and.callFake((data, tag, callback) => {
      callback(null, data.map((item) => new Transaction(item).toJSON()));
    });
    mockData = {
      id: 'testId',
      action: Transaction.Action.STAMPS_CHANGE,
      customerId: 'dummyCustomerId',
      employeeId: 'dummyEmployeeId',
      customerName: 'Dummy Customer',
      employeeName: 'Dummy Employee',
      changeValue: 10,
      rewards: 5,
      createdBy: 'dummyCreator',
      createdOn: new Date(),
      _buildfire: {
        index: {
          array1: [
            { string1: 'employeeId_dummyEmployeeId' },
            { string1: 'customerId_dummyCustomerId' },
          ],
          date1: new Date(),
        },
      },
    };
  });
  it('returns transactions data', async () => {
    const result = await Transactions.search();
    expect(result).toEqual(jasmine.any(Object));
    expect(result.data).toEqual(jasmine.any(Array));
    expect(result.totalItems).toEqual(1);
  });
  it('insert transaction data', async () => {
    const data = dummyTransactions[0];
    const result = await Transactions.save(data);
    expect(result).toEqual(jasmine.any(Object));
    expect(result.action).toEqual(Transaction.Action.STAMPS_CHANGE);
  });
  it('inserts multiple transactions', async () => {
    const result = await Transactions.bulkInsert(dummyTransactions);
    expect(result).toEqual(jasmine.any(Array));
  });
  it('should save transaction data that matches the Transaction model', (done) => {
    Transactions.save(mockData).then((data) => {
      expect(buildfire.publicData.insert).toHaveBeenCalledWith(jasmine.objectContaining(mockData), Transactions.TAG, jasmine.any(Function));
      expect(data).toEqual(mockData);
      done();
    });
  });
});
describe('Transaction Controller', () => {
  beforeEach(() => {
    spyOnProperty(AuthManager, 'currentUser', 'get').and.returnValue({ userId: 'testUserId' });
    spyOn(Transactions, 'search').and.returnValue(Promise.resolve({ data: [] }));
    spyOn(Transactions, 'save').and.returnValue(Promise.resolve({}));
    spyOn(Transactions, 'bulkInsert').and.returnValue(Promise.resolve({}));
  });


  it('should get employee transactions successfully', async () => {
    const result = await TransactionController.getEmployeeTransaction();
    expect(Transactions.search).toHaveBeenCalledWith({
      filter: { '_buildfire.index.array1.string1': 'employeeId_testUserId' },
    });
    expect(result).toEqual({ data: [] });
  });

  it('should add single transaction successfully', async () => {
    await TransactionController.addTransactions([{}]);
    expect(Transactions.save).toHaveBeenCalled();
  });

  it('should add multiple transactions successfully', async () => {
    await TransactionController.addTransactions([{}, {}]);
    expect(Transactions.bulkInsert).toHaveBeenCalled();
  });
});
