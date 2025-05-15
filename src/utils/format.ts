import { decodeEventLog, parseAbiItem, TransactionReceipt } from 'viem';

export const truncateAddress = (address?: string) => {
  if (!address) return '';
  // Only truncate if the address is longer than a typical short display (e.g., prefix + suffix + '...')
  // 6 (prefix) + 4 (suffix) = 10. If length is > 10, then it's safe to truncate.
  if (address.length <= 10) {
    // Handles cases like "0x123", "0xabcdef1234"
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimestamp = (timestamp?: string, full?: boolean): string => {
  if (!timestamp) return '-';

  // Convert timestamp to milliseconds if needed
  const timestampMs = timestamp.length <= 10 ? Number(timestamp) * 1000 : Number(timestamp);
  const date = new Date(timestampMs);

  // Check if date is valid
  if (isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // getTimezoneOffset returns the difference in minutes between UTC and local time.
  // Positive value if local time is behind UTC (e.g., New York: 300 for UTC-5).
  // Negative value if local time is ahead of UTC (e.g., Berlin: -120 for UTC+2).
  const rawOffsetMinutes = date.getTimezoneOffset();

  let offsetString = '';
  if (full) {
    const offsetSign = rawOffsetMinutes > 0 ? '-' : '+';
    const offsetHours = Math.abs(rawOffsetMinutes / 60);
    // Ensure it's always UTC+0 for zero offset, as per test expectations.
    if (rawOffsetMinutes === 0) {
      offsetString = 'UTC+0';
    } else {
      offsetString = `UTC${offsetSign}${offsetHours}`;
    }
  }

  return full
    ? `${day}/${month}/${year} ${hours}:${minutes} ${offsetString}`
    : `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const getTimeAgo = (timestamp?: string): string => {
  if (!timestamp) return '-';

  // Convert timestamp to milliseconds if needed
  const timestampMs = timestamp.length <= 10 ? Number(timestamp) * 1000 : Number(timestamp);
  const date = new Date(timestampMs);

  // Check if date is valid
  if (isNaN(date.getTime())) return '-';

  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diff < 86400) {
    const hrs = Math.floor(diff / 3600);
    return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  if (diff < 31536000) {
    const months = Math.floor(diff / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diff / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

export const decodeEventsFromReceipt = (receipt: TransactionReceipt, eventAbi: string) => {
  const parsedAbiItem = parseAbiItem(eventAbi);

  return receipt.logs
    .map((log) => {
      try {
        const decodedLog = decodeEventLog({
          abi: [parsedAbiItem],
          data: log.data,
          topics: log.topics,
        });

        return {
          eventName: decodedLog.eventName,
          args: decodedLog.args,
        };
      } catch (error) {
        console.warn('Failed to decode log:', error);
        return null;
      }
    })
    .filter((event): event is { eventName: string; args: Record<string, unknown> } => event !== null); // Remove nulls
};
