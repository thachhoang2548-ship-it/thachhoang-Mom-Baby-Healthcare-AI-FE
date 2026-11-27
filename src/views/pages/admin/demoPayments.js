// Presentation data for the admin dashboard. These are not payment provider records.
const names = [
  'Bảo Anh', 'Minh Anh', 'Khánh An', 'Ngọc Anh', 'Thùy Anh',
  'Hải Yến', 'Hoài An', 'Phúc An', 'Tú Anh', 'Thanh An',
  'Kim Ngân', 'Thùy Dương', 'Ngọc Hà', 'Thanh Huyền', 'Phương Linh',
  'Mai Phương', 'Bích Ngọc', 'Hồng Nhung', 'Quỳnh Anh', 'Thảo Vy',
  'Mỹ Linh', 'Ngọc Trâm', 'Thu Hằng', 'Diệu Linh', 'Thanh Trúc',
  'Hà My', 'Hồng Ánh', 'Ngọc Diệp', 'Thảo Nguyên', 'Trúc Linh',
];

const plans = [
  { planCode: 'HD_1M', tier: 'MomHienDai', durationMonths: 1, amount: 99000 },
  { planCode: 'VIP_1M', tier: 'SuperMomVip', durationMonths: 1, amount: 199000 },
  { planCode: 'HD_6M', tier: 'MomHienDai', durationMonths: 6, amount: 499000 },
  { planCode: 'VIP_6M', tier: 'SuperMomVip', durationMonths: 6, amount: 999000 },
];

const vietnamDay = (value) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

const today = vietnamDay(new Date());
const noonToday = new Date(`${today}T12:00:00+07:00`);

export const demoTransactions = names.map((userName, index) => {
  const number = String(index + 1).padStart(2, '0');
  const paidAt = new Date(noonToday.getTime() - (index % 14) * 86400000 - (index % 4) * 3600000).toISOString();
  return {
    id: `demo-payment-${number}`,
    orderCode: `MOMOI${today.replaceAll('-', '')}${String(index + 1).padStart(8, '0')}`,
    userId: `demo-member-${number}`,
    userName,
    userEmail: `member${number}@example.com`,
    ...plans[index % plans.length],
    currency: 'VND',
    paymentMethod: 'VietQR',
    status: 'Completed',
    paidAt,
    updatedAt: paidAt,
  };
}).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

const byPlan = plans.map((plan) => {
  const transactions = demoTransactions.filter((item) => item.planCode === plan.planCode);
  return {
    ...plan,
    transactionCount: transactions.length,
    revenue: transactions.reduce((sum, item) => sum + item.amount, 0),
  };
});

const monthlyTrend = Array.from({ length: 14 }, (_, index) => {
  const date = new Date(noonToday.getTime() - (13 - index) * 86400000);
  const month = vietnamDay(date);
  const transactions = demoTransactions.filter((item) => vietnamDay(new Date(item.paidAt)) === month);
  return {
    month,
    revenue: transactions.reduce((sum, item) => sum + item.amount, 0),
    transactionCount: transactions.length,
  };
});

export const demoRevenueSummary = {
  totalRevenue: demoTransactions.reduce((sum, item) => sum + item.amount, 0),
  monthlyRevenue: demoTransactions
    .filter((item) => vietnamDay(new Date(item.paidAt)).slice(0, 7) === today.slice(0, 7))
    .reduce((sum, item) => sum + item.amount, 0),
  todayRevenue: demoTransactions
    .filter((item) => vietnamDay(new Date(item.paidAt)) === today)
    .reduce((sum, item) => sum + item.amount, 0),
  completedTransactionCount: demoTransactions.length,
  payingUserCount: new Set(demoTransactions.map((item) => item.userId)).size,
  byPlan,
  monthlyTrend,
  recentTransactions: demoTransactions.slice(0, 10),
};
