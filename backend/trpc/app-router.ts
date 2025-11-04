import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import redeemCouponProcedure from "./routes/coupons/redeem/route";
import getCouponAnalyticsProcedure from "./routes/coupons/analytics/route";
import trackCouponViewProcedure from "./routes/coupons/track-view/route";
import deleteCouponProcedure from "./routes/coupons/delete/route";
import getBusinessAnalyticsProcedure from "./routes/admin/business-analytics/route";
import { updateProfilePictureProcedure } from "./routes/profile/update-picture/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  coupons: createTRPCRouter({
    redeem: redeemCouponProcedure,
    analytics: getCouponAnalyticsProcedure,
    trackView: trackCouponViewProcedure,
    delete: deleteCouponProcedure,
  }),
  admin: createTRPCRouter({
    businessAnalytics: getBusinessAnalyticsProcedure,
  }),
  profile: createTRPCRouter({
    updatePicture: updateProfilePictureProcedure,
  }),
});

export type AppRouter = typeof appRouter;
