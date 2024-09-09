describe('Customers Repository', () => {
  let mockData;
  beforeEach(() => {
    mockData = {
      id: null,
      customerId: '123',
      customerUserId: '456',
      currentStamps: 10,
      lifeTimeStamps: 20,
      lifeTimeRedeems: 5,
      availableRewards: [],
      createdBy: null,
      updatedBy: null,
      createdOn: new Date(),
      updatedOn: new Date(),
      isActive: true,
      _buildfire: {
        index: { string1: '123' },
      },
    };
  });

  it('returns customers data when found', () => {
    spyOn(buildfire.publicData, 'search').and.callFake((options, tag, callback) => {
      callback(null, [{ id: 'dummyId', data: {} }]);
    });

    return Customers.search().then((data) => {
      expect(data[0].id).toEqual('dummyId');
    });
  });
  it('saves customer data and returns saved data', () => {
    spyOn(buildfire.publicData, 'insert').and.callFake((data, tag, callback) => {
      callback(null, { id: 'dummyId', data: { id: 'dummyId' } });
    });

    return Customers.save({}).then((data) => {
      expect(data.id).toEqual('dummyId');
    });
  });
  it('updates customer data and returns updated data', () => {
    spyOn(buildfire.publicData, 'update').and.callFake((id, data, tag, callback) => {
      callback(null, { id: 'dummyId', data: {} });
    });

    return Customers.update('dummyId', {}).then((data) => {
      expect(data.id).toEqual('dummyId');
    });
  });
});

describe('Customer Controller', () => {
  beforeEach(() => {
    spyOnProperty(AuthManager, 'currentUser', 'get').and.returnValue({ _id: 'employeeId', userId: 'testUserId', name: 'Employee Name' });
    spyOn(Customers, 'search').and.callFake(() => Promise.resolve([{ customerId: 'testCustomerId' }]));
    spyOn(Customers, 'save').and.callFake(() => Promise.resolve({ customerId: 'newCustomerId' }));
    spyOn(UserCodeSequences, 'generateUserCode').and.callFake(() => Promise.resolve('12345'));
  });
  it('should handle customer ID generation when customer exists', async () => {
    await CustomerController.handleCustomerIdGeneration();
    expect(Customers.search).toHaveBeenCalledWith({
      filter: { '_buildfire.index.string1': 'testUserId' },
      limit: 1,
    });
    expect(Customers.save).not.toHaveBeenCalled();
  });
  it('should handle customer ID generation when customer does not exist', async () => {
    Customers.search.and.callFake(() => Promise.resolve([]));
    await CustomerController.handleCustomerIdGeneration();
    expect(UserCodeSequences.generateUserCode).toHaveBeenCalled();
    expect(Customers.save).toHaveBeenCalledWith({
      customerUserId: '12345',
    });
  });
  it('should increment stamps correctly', () => {
    spyOnProperty(AuthManager, 'isEmployee', 'get').and.returnValue(true);
    const result = CustomerController.incrementStamps(5);
    expect(result).toEqual(6);
  });
  it('should decrement stamps correctly', () => {
    spyOnProperty(AuthManager, 'isEmployee', 'get').and.returnValue(true);
    const result = CustomerController.decrementStamps(5, 10);
    expect(result).toEqual(4);
  });
  it('should not decrement when current stamps are zero', () => {
    spyOnProperty(AuthManager, 'isEmployee', 'get').and.returnValue(true);
    const result = CustomerController.decrementStamps(5, 0);
    expect(result).toEqual(0);
  });
  it('should add rewards when user deserves them', () => {
    const newStamps = 10;
    const currentStamps = 5;
    const cardSize = 5;
    const availableRewards = [];
    const currentUser = { _id: 'dummyUserId' };

    const result = CustomerController.addRewards(newStamps, currentStamps, cardSize, availableRewards, currentUser);

    expect(result.availableRewards.length).toEqual(3);
    expect(result.currentStamps).toEqual(0);
  });
  it('should add two rewards where new stamps is 8, current stamps is 5 , card size is 6', () => {
    const newStamps = 8;
    const currentStamps = 5;
    const cardSize = 6;
    const availableRewards = [];
    const currentUser = { _id: 'dummyUserId' };

    const result = CustomerController.addRewards(newStamps, currentStamps, cardSize, availableRewards, currentUser);

    expect(result.availableRewards.length).toEqual(2);
    expect(result.currentStamps).toEqual(1);
  });
  it(' should not add rewards when user does not deserve them', () => {
    const newStamps = 2;
    const currentStamps = 2;
    const cardSize = 5;
    const availableRewards = [];
    const currentUser = { _id: 'dummyUserId' };

    const result = CustomerController.addRewards(newStamps, currentStamps, cardSize, availableRewards, currentUser);

    expect(result.availableRewards.length).toEqual(0);
    expect(result.currentStamps).toEqual(4);
  });
  it(' should redeem available rewards when enough rewards are available', () => {
    const newStamps = 3;
    const currentStamps = 5;
    const cardSize = 5;
    const availableRewards = [1, 2, 3, 4, 5];
    const lifeTimeRedeems = 10;
    const numberOfSelectedReward = 3;

    const result = CustomerController.redeem(newStamps, currentStamps, cardSize,
      availableRewards, lifeTimeRedeems, numberOfSelectedReward);

    expect(result.availableRewards.length).toEqual(2);
    expect(result.lifeTimeRedeems).toEqual(13);
  });
  it('should add new rewards and decrease current stamps when card size is less than or equal to current stamps', () => {
    spyOn(CustomerController, 'addRewards').and.returnValue({
      availableRewards: ['reward1', 'reward2'],
      currentStamps: 1,
    });

    const result = CustomerController.isCardSizeChanged(5, 4, ['reward1']);

    expect(result).toEqual({
      currentStamps: 1,
      availableRewards: ['reward1', 'reward2'],
    });
  });
  it('should throw an error when a non-employee tries to increment stamps', () => {
    spyOnProperty(AuthManager, 'isEmployee', 'get').and.returnValue(false);
    expect(() => CustomerController.incrementStamps(5)).toThrowError('Only employees can increment stamps');
  });
  it('should throw an error when a non-employee tries to decrement stamps', () => {
    spyOnProperty(AuthManager, 'isEmployee', 'get').and.returnValue(false);
    expect(() => CustomerController.decrementStamps(5, 10)).toThrowError('Only employees can increment stamps');
  });
  it('should throw an error when a non-employee tries to add new transaction', async () => {
    spyOnProperty(AuthManager, 'isEmployee', 'get').and.returnValue(false);
    await expectAsync(CustomerController.addNewTransaction(5, 10, 5, [],
      10, { id: 'dummyId' })).toBeRejectedWithError('Only employees can increment stamps');
  });
  it('should return customer info if customer id is valid', async () => {
    spyOn(CustomerController, 'isCardSizeChanged').and.returnValue({ currentStamps: 5, availableRewards: [] });
    const result = await CustomerController.getCustomerInfo('testCustomerId', 10);
    expect(result.currentStamps).toEqual(5);
    expect(result.availableRewards).toEqual([]);
  });
  it('should throw an error if customer id is not valid', async () => {
    try {
      const result = await CustomerController.getCustomerInfo('invalidCustomerId', 10);
      expect(result.currentStamps).toEqual(undefined);
      expect(result.availableRewards).toEqual(undefined);
    } catch (error) {
      expect(error.message).toEqual('Customer does not exist');
    }
  });
  it('should add a new transaction successfully', async () => {
    spyOn(AuthManager, 'getUserProfile').and.returnValue(Promise.resolve({ name: 'Test User' }));
    spyOn(Customers, 'update').and.returnValue(Promise.resolve({}));
    spyOn(TransactionController, 'addTransactions').and.returnValue(Promise.resolve({}));
    spyOn(CustomerController, 'addRewards').and.returnValue({
      availableRewards: [],
      currentStamps: 0,
    });
    spyOnProperty(AuthManager, 'isEmployee', 'get').and.returnValue(true);

    const newStamps = 5;
    const currentStamps = 9;
    const cardSize = 10;
    const availableRewards = [];
    const lifeTimeRedeems = 0;
    const currentCustomer = { id: 'customerId', customerId: 'customerId' };

    await CustomerController.addNewTransaction(newStamps, currentStamps,
      cardSize, availableRewards, lifeTimeRedeems, currentCustomer);

    expect(Customers.update).toHaveBeenCalled();
    expect(TransactionController.addTransactions).toHaveBeenCalled();
  });
});
