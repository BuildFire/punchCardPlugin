// eslint-disable-next-line no-unused-vars
const parseDeeplinkData = (deeplinkQueryString) => {
  let cleanedString;
  if (typeof deeplinkQueryString === 'string') {
    cleanedString = deeplinkQueryString.replace(/^&dld=/, '');
  } else {
    return deeplinkQueryString;
  }

  try {
    const decodedString = decodeURIComponent(cleanedString);
    return JSON.parse(decodedString);
  } catch (error) {
    console.error('Error decoding deepLinkData:', error);
    return null;
  }
};
