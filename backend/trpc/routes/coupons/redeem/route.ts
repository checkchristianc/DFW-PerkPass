import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const redeemCouponProcedure = publicProcedure
  .input(
    z.object({
      couponId: z.string(),
      userId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Redeeming coupon:', input);
    
    const redemption = {
      id: `redemption-${Date.now()}`,
      couponId: input.couponId,
      userId: input.userId,
      redeemedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      redemption,
    };
  });

export default redeemCouponProcedure;
