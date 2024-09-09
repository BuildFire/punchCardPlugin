// eslint-disable-next-line no-unused-vars
const userName = (user) => {
  const firstName = user?.firstName?.trim() || '';
  const lastName = user?.lastName?.trim() || '';
  return `${firstName} ${lastName}`.trim() || user?.displayName;
};
