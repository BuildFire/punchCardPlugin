const EmployeeView = {
  getAvailbleRewardLength(newStamps, currentStamps, cardSize) {
    return Math.floor((newStamps + currentStamps) / cardSize);
  },
};
