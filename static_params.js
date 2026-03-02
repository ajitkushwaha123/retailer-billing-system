
import dbConnect from "./src/lib/dbConnect.js";
import StaticEnvironmentMetadata from "./src/models/demand-forcasting/StaticEnvironmentMetadata.js";

const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const getSeason = (month) => {
  switch(month){
    case "December":
    case "January":
    case "February": return "Winter";
    case "March":
    case "April":
    case "May": return "Summer";
    case "June":
    case "July":
    case "August": return "Monsoon";
    case "September":
    case "October":
    case "November": return "Autumn";
  }
}

const festivals = {
  "2026-01-01": { code: "NEW_YEAR", importance: 5 },
  "2026-01-26": { code: "REPUBLIC_DAY", importance: 4 },
  "2026-03-04": { code: "HOLI", importance: 5 },
  "2026-04-21": { code: "EID", importance: 5 },
  "2026-08-15": { code: "INDEPENDENCE_DAY", importance: 4 },
  "2026-11-08": { code: "DIWALI", importance: 5 },
  "2026-12-25": { code: "CHRISTMAS", importance: 4 },
};

const isPaydayWindow = (date) => {
  const day = date.getDate();
  return day >= 25 || day <= 3;
}

const generateTags = ({ dayOfWeek, festivalCode, paydayWindow }) => {
  const tags = [];
  if(["Saturday","Sunday"].includes(dayOfWeek)) tags.push("weekend");
  if(festivalCode) tags.push("festival", "high_demand");
  if(paydayWindow) tags.push("payday");
  return tags;
}

const isLongWeekend = (date) => {
  const dayOfWeek = date.getDay(); 
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  const tomorrowIsHoliday = festivals[nextDay.toISOString().slice(0,10)]?.importance > 0;
  return ["Saturday","Sunday"].includes(daysOfWeek[dayOfWeek]) || tomorrowIsHoliday;
}

async function seed() {
  await dbConnect();
  await StaticEnvironmentMetadata.deleteMany({});
  console.log("Old data cleared");

  const startDate = new Date("2026-01-01");
  const endDate = new Date("2026-12-31");

  const bulkData = [];

  for(let d = new Date(startDate); d <= endDate; d.setDate(d.getDate()+1)){
    const isoDate = d.toISOString().slice(0,10);
    const dayOfWeek = daysOfWeek[d.getDay()];
    const month = months[d.getMonth()];
    const season = getSeason(month);
    const weekend = ["Saturday","Sunday"].includes(dayOfWeek);
    const festival = festivals[isoDate] || {};
    const payday = isPaydayWindow(d);
    const publicHoliday = !!festival.code;
    const longWeekend = isLongWeekend(d);
    const tags = generateTags({ dayOfWeek, festivalCode: festival.code, paydayWindow: payday });

    bulkData.push({
      date: new Date(isoDate),
      day_of_week: dayOfWeek,
      month,
      season,
      is_weekend: weekend,
      festival_code: festival.code || null,
      festival_importance: festival.importance || null,
      payday_window: payday,
      is_public_holiday: publicHoliday,
      is_long_weekend: longWeekend,
      tags
    });
  }

  await StaticEnvironmentMetadata.insertMany(bulkData);
  console.log(`Seeded ${bulkData.length} days for 2026`);
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});