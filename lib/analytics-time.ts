export function getShanghaiDayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function getShanghaiDayRange(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((accumulator, part) => {
      if (part.type !== "literal") {
        accumulator[part.type] = part.value;
      }
      return accumulator;
    }, {});

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const start = new Date(Date.UTC(year, month - 1, day, -8, 0, 0, 0));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return {
    start,
    end,
    dayKey: `${parts.year}-${parts.month}-${parts.day}`
  };
}
