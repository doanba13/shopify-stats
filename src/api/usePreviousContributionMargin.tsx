import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useContributionMargin } from "./useContributionMargin";

dayjs.extend(utc);

const padding = 60 * 60 * 24;

export function usePreviousContributionMargin(
  startDate: number = 0,
  endDate: number = 0,
  app?: string
) {

  const isOneDay = startDate != 0 && endDate != 0 && endDate === startDate
  const duration = isOneDay ? 86400 : endDate - startDate;

  // shift backwards by the same duration
  const prevStart = isOneDay ? startDate - duration : startDate - duration - padding;
  const prevEnd = isOneDay ? startDate - duration : endDate != 0 ? endDate - duration - padding : 0;

  console.log(prevEnd, prevStart)

  return useContributionMargin(prevStart, prevEnd, app);
}
