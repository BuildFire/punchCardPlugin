// eslint-disable-next-line no-unused-vars
const formatDate = async (date) => {
  const parsedDate = new Date(date);
  const todayText = await getLanguage('general.today');
  const yesterdayText = await getLanguage('general.yesterday');

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) => d1.getDate() === d2.getDate()
    && d1.getMonth() === d2.getMonth()
    && d1.getFullYear() === d2.getFullYear();

  if (isSameDay(parsedDate, today)) {
    return todayText;
  } if (isSameDay(parsedDate, yesterday)) {
    return yesterdayText;
  }

  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return parsedDate.toLocaleDateString('en-US', options);
};
