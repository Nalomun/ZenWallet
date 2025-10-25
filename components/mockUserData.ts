// components/SpendingTrends/mockUserData.ts


export const mockUsers = [
  { id: '1', name: 'Sarah Chen' },
  { id: '2', name: 'Marcus Lee' },
  { id: '3', name: 'Emma Rodriguez' },
  { id: '4', name: 'Alex Johnson' },
 ];
 
 
 // generate random spending pattern
 function randomSpending(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: `${i + 1}`,
    amount: Math.floor(Math.random() * 100),
  }));
 }
 
 
 export const mockSpendingData = {
  '1': {
    daily: randomSpending(1),
    weekly: randomSpending(7),
    monthly: randomSpending(30),
  },
  '2': {
    daily: randomSpending(1),
    weekly: randomSpending(7),
    monthly: randomSpending(30),
  },
  '3': {
    daily: randomSpending(1),
    weekly: randomSpending(7),
    monthly: randomSpending(30),
  },
  '4': {
    daily: randomSpending(1),
    weekly: randomSpending(7),
    monthly: randomSpending(30),
  },
 };
 