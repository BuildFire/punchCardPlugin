describe('UserCodeSequences Repository', () => {
  let mockPublicDataStore;

  beforeEach(() => {
    mockPublicDataStore = jasmine.createSpyObj('publicData', ['search', 'save', 'update']);
    buildfire.publicData = mockPublicDataStore;
  });

  it('should search for code sequence data', (done) => {
    const mockResponse = [{ data: new UserCodeSequence().toJSON(), id: '1' }];
    mockPublicDataStore.search.and.callFake((options, tag, callback) => callback(null, mockResponse));

    UserCodeSequences.search().then((data) => {
      expect(data).toEqual(mockResponse.map(record => record.data));
      done();
    });
  });

  it('should save code sequence data', (done) => {
    const mockData = new UserCodeSequence().toJSON();
    const mockResponse = { data: mockData };
    mockPublicDataStore.save.and.callFake((data, tag, callback) => callback(null, mockResponse));

    UserCodeSequences.save(mockData).then((data) => {
      expect(data).toEqual(mockData);
      expect(mockPublicDataStore.save).toHaveBeenCalledWith(mockData, UserCodeSequences.TAG, jasmine.any(Function));
      done();
    });
  });

  it('should increment sequence', (done) => {
    const id = '1';
    const mockResponse = { data: { sequence: 1 } };
    mockPublicDataStore.update.and.callFake((id, update, tag, callback) => callback(null, mockResponse));

    UserCodeSequences.incrementSequence(id).then((result) => {
      expect(result).toEqual(mockResponse);
      done();
    });
  });

  it('should get next sequence value', (done) => {
    const mockResponse = [{ data: new UserCodeSequence().toJSON(), id: '1' }];
    mockPublicDataStore.search.and.callFake((options, tag, callback) => callback(null, mockResponse));
    mockPublicDataStore.update.and.callFake((id, update, tag, callback) => callback(null, { data: { sequence: 1 } }));

    UserCodeSequences.getNextSequenceValue().then((nextCode) => {
      expect(nextCode).toEqual(1);
      done();
    });
  });

  it('should generate user code', (done) => {
    spyOn(UserCodeSequences, 'getNextSequenceValue').and.returnValue(Promise.resolve(1));

    UserCodeSequences.generateUserCode().then((nextCode) => {
      expect(nextCode).toEqual(1);
      done();
    });
  });

  it('should initialize code sequence', (done) => {
    const mockData = new UserCodeSequence().toJSON();
    const mockResponse = { data: mockData };
    mockPublicDataStore.save.and.callFake((data, tag, callback) => callback(null, mockResponse));

    UserCodeSequences.initializeCodeSequence().then((data) => {
      expect(data).toEqual(mockData);
      expect(mockPublicDataStore.save).toHaveBeenCalledWith(mockData, UserCodeSequences.TAG, jasmine.any(Function));
      done();
    });
  });
});
