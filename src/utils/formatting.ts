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

export const getDuration = (duration: number) => {
  let value = 0;
  let unit = '';
  if (duration < 3600) {
    unit = 'minute';
    value = Math.floor(duration / 60) || 1; // min 1 minute
  } else if (duration < 86400) {
    unit = 'hour';
    value = Math.floor(duration / 3600);
  } else if (duration < (2 * 604800)) {
    unit = 'day';
    value = Math.floor(duration / 86400);
  } else {
    unit = 'week';
    value = Math.floor(duration / 604800);
  }
  return `${value}${String.fromCharCode(160)}${unit}${value > 1 ? 's' : ''}`;
};

