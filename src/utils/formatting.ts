export const prettyPrint = (num: string, units: number) => parseFloat(parseFloat(num).toFixed(units)).toLocaleString();

export const prettyPrintAddress = (address: string) => `${address.substr(0, 6)}...${address.substr(-4)}`;

export const getTimeAgo = (date: Date) => {
  const now = new Date().getTime();
  const elapsed = Math.floor((now - date.getTime()) / 1000);
  if (elapsed < 60) {
    return 'just now';
  } else if (elapsed < 3600) {
    return `${Math.floor(elapsed / 60)}m ago`;
  } else if (elapsed < 86400) {
    return `${Math.floor(elapsed / 3600)}h ago`;
  } else {
    return `${Math.floor(elapsed / 86400)}d ago`;
  }
};

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;

export const getDuration = (duration: number) => {
  let value = 0;
  let unit = '';
  if (duration < HOUR) {
    unit = 'minute';
    value = Math.floor(duration / MINUTE) || 1; // min 1 minute
  } else if (duration < DAY) {
    unit = 'hour';
    value = Math.floor(duration / HOUR);
  } else if (duration < (DAY * 7)) {
    unit = 'day';
    value = Math.floor(duration / DAY);
  } else if (duration < (365 * DAY)) {
    unit = 'week';
    value = Math.floor(duration / (7 * DAY));
  } else {
    unit = 'year';
    value = Math.floor(duration / (365 * DAY));
  }
  // return `${duration}`;
  return `${value}${String.fromCharCode(160)}${unit}${value > 1 ? 's' : ''}`;
};

