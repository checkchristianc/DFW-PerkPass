import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const trackCouponViewProcedure = publicProcedure
  .input(
    z.object({
      couponId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Tracking coupon view:', input.couponId);
    
    return {
      success: true,
    };
  });

export default trackCouponViewProcedure;
