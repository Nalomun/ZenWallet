'use client';


import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';




export default function SpendingTrends() {
 // 👤 Step 1: choose which user
 const [currentUser, setCurrentUser] = useState(mockUsers[0]);
 // 📈 Step 2: choose view (daily / weekly / monthly) yes
 const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');


type SpendingTrendsProps = {
 view: 'daily' | 'weekly' | 'monthly';
 user: any;
 transactions: any[];
};




export default function SpendingTrends({ view, user, transactions }: SpendingTrendsProps) {
 let data = [];
 let total = 0;


 // Mock data based on view - replace with actual transaction processing if needed
 const mockDailyData = [
   { date: '8am', amount: 12 },
   { date: '10am', amount: 8 },
   { date: '12pm', amount: 20 },
   { date: '2pm', amount: 15 },
   { date: '4pm', amount: 10 },
   { date: '6pm', amount: 25 },
   { date: '8pm', amount: 18 },
 ];


 const mockWeeklyData = [
   { date: 'Mon', amount: 50 },
   { date: 'Tue', amount: 70 },
   { date: 'Wed', amount: 30 },
   { date: 'Thu', amount: 90 },
   { date: 'Fri', amount: 110 },
   { date: 'Sat', amount: 60 },
   { date: 'Sun', amount: 40 },
 ];


 const mockMonthlyData = [
   { date: 'Week 1', amount: 280 },
   { date: 'Week 2', amount: 450 },
   { date: 'Week 3', amount: 620 },
   { date: 'Week 4', amount: 780 },
 ];


 switch (view) {
   case 'daily':
     data = mockDailyData;
     total = mockDailyData.reduce((sum, d) => sum + d.amount, 0);
     break;
   case 'weekly':
     data = mockWeeklyData;
     total = mockWeeklyData.reduce((sum, d) => sum + d.amount, 0);
     break;
   case 'monthly':
     data = mockMonthlyData;
     total = mockMonthlyData.reduce((sum, d) => sum + d.amount, 0);
     break;
 }


 return (
   <div>
     {/* Total Display */}
     <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
       <p className="text-sm text-gray-600 font-medium mb-1">
         {view === 'daily' && 'Total Spent Today'}
         {view === 'weekly' && 'Total Spent This Week'}
         {view === 'monthly' && 'Total Spent This Month'}
       </p>
       <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
         ${total}
       </p>
     </div>


     {/* Chart */}
     <ResponsiveContainer width="100%" height={240}>
       <AreaChart data={data}>
         <defs>
           <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
             <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
             <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
           </linearGradient>
         </defs>
         <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
         <XAxis
           dataKey="date"
           tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
           stroke="#9ca3af"
         />
         <YAxis
           tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
           stroke="#9ca3af"
           tickFormatter={(value) => `$${value}`}
         />
         <Tooltip
           contentStyle={{
             backgroundColor: 'rgba(255, 255, 255, 0.95)',
             border: '2px solid #9333ea',
             borderRadius: '12px',
             padding: '8px 12px',
             fontWeight: 600
           }}
           formatter={(value: number) => [`$${value}`, 'Spent']}
         />
         <Area
           type="monotone"
           dataKey="amount"
           stroke="#9333ea"
           strokeWidth={3}
           fill="url(#colorTrend)"
         />
       </AreaChart>
     </ResponsiveContainer>
   </div>
 );
}
