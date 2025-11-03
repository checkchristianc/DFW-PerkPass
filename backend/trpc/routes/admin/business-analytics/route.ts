import { publicProcedure } from "../../../create-context";

export const getBusinessAnalyticsProcedure = publicProcedure.query(async () => {
  try {
    console.log('Getting business analytics');
  
  const mockBusinesses = [
    {
      id: '1',
      businessName: 'Zophia Check, LMT',
      ownerName: 'Zophia Check',
      email: 'zophia@example.com',
      signupDate: new Date('2025-01-15T10:30:00Z').toISOString(),
      subscriptionActive: true,
      totalCoupons: 3,
      totalRedemptions: 45,
      revenue: 9.99,
    },
    {
      id: '2',
      businessName: 'Dallas Fitness Studio',
      ownerName: 'Mike Johnson',
      email: 'mike@dallasfitness.com',
      signupDate: new Date('2025-02-01T14:20:00Z').toISOString(),
      subscriptionActive: true,
      totalCoupons: 5,
      totalRedemptions: 128,
      revenue: 9.99,
    },
    {
      id: '3',
      businessName: 'Fort Worth Eats',
      ownerName: 'Sarah Martinez',
      email: 'sarah@fweats.com',
      signupDate: new Date('2025-02-10T09:15:00Z').toISOString(),
      subscriptionActive: true,
      totalCoupons: 8,
      totalRedemptions: 234,
      revenue: 9.99,
    },
    {
      id: '4',
      businessName: 'DFW Auto Care',
      ownerName: 'James Wilson',
      email: 'james@dfwauto.com',
      signupDate: new Date('2025-02-20T16:45:00Z').toISOString(),
      subscriptionActive: false,
      totalCoupons: 2,
      totalRedemptions: 12,
      revenue: 0,
    },
    {
      id: '5',
      businessName: 'Spa Luxe Dallas',
      ownerName: 'Emma Davis',
      email: 'emma@spaluxe.com',
      signupDate: new Date('2025-03-01T11:00:00Z').toISOString(),
      subscriptionActive: true,
      totalCoupons: 4,
      totalRedemptions: 89,
      revenue: 9.99,
    },
  ];

  const totalBusinesses = mockBusinesses.length;
  const activeSubscriptions = mockBusinesses.filter(b => b.subscriptionActive).length;
  const totalRevenue = mockBusinesses.reduce((sum, b) => sum + (b.revenue || 0), 0);
  const totalCoupons = mockBusinesses.reduce((sum, b) => sum + (b.totalCoupons || 0), 0);
  const totalRedemptions = mockBusinesses.reduce((sum, b) => sum + (b.totalRedemptions || 0), 0);
  const avgRedemptionsPerBusiness = totalBusinesses > 0 ? Math.round(totalRedemptions / totalBusinesses) : 0;

  console.log('Analytics computed:', {
    totalBusinesses,
    activeSubscriptions,
    totalRevenue,
    totalCoupons,
    totalRedemptions,
    avgRedemptionsPerBusiness,
  });

    const response = {
      totalBusinesses,
      activeSubscriptions,
      totalRevenue,
      totalCoupons,
      totalRedemptions,
      avgRedemptionsPerBusiness,
      businesses: mockBusinesses,
    };

    console.log('Returning analytics response');
    return response;
  } catch (error) {
    console.error('Error in business analytics:', error);
    throw new Error('Failed to fetch business analytics');
  }
});

export default getBusinessAnalyticsProcedure;
