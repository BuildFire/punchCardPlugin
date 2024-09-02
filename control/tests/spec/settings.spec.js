describe('Settings', () => {
  let mockDatastore;

  beforeEach(() => {
    // Mock buildfire.datastore
    mockDatastore = jasmine.createSpyObj('datastore', ['get', 'save']);
    buildfire.datastore = mockDatastore;
  });

  it('should get settings data when data exists', (done) => {
    // Mock response
    const mockResponse = { data: new Setting().toJSON() };
    mockDatastore.get.and.callFake((tag, callback) => callback(null, mockResponse));

    // Call Settings.get
    Settings.get().then((data) => {
      expect(data).toEqual(mockResponse.data);
      done();
    });
  });

  it('should initialize and save settings data when no data exists', (done) => {
    // Mock response
    const mockResponse = { data: {} };
    mockDatastore.get.and.callFake((tag, callback) => callback(null, mockResponse));
    mockDatastore.save.and.callFake((data, tag, callback) => callback(null, { data: new Setting(data).toJSON() }));

    // Call Settings.get
    Settings.get().then((data) => {
      expect(data).toEqual(new Setting().toJSON());
      expect(mockDatastore.save).toHaveBeenCalled();
      done();
    });
  });

  it('should handle error when getting settings data', (done) => {
    // Mock response
    const mockError = new Error('Error getting data');
    mockDatastore.get.and.callFake((tag, callback) => callback(mockError, null));

    // Call Settings.get
    Settings.get().catch((err) => {
      expect(err).toEqual(mockError);
      done();
    });
  });

  it('should save settings data', (done) => {
    // Mock response
    const mockData = new Setting().toJSON();
    const mockResponse = { data: mockData };
    mockDatastore.save.and.callFake((data, tag, callback) => callback(null, mockResponse));

    // Call Settings.save
    Settings.save(mockData).then((data) => {
      expect(data).toEqual(mockData);
      expect(mockDatastore.save).toHaveBeenCalledWith(mockData, Settings.TAG, jasmine.any(Function));
      done();
    });
  });

  it('should handle error when saving settings data', (done) => {
    // Mock response
    const mockError = new Error('Error saving data');
    mockDatastore.save.and.callFake((data, tag, callback) => callback(mockError, null));

    // Call Settings.save
    Settings.save({}).catch((err) => {
      expect(err).toEqual(mockError);
      done();
    });
  });
});
