import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const deleteCouponProcedure = publicProcedure
  .input(
    z.object({
      couponId: z.string(),
      businessName: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("Delete coupon request:", input);

    return {
      success: true,
      couponId: input.couponId,
    };
  });

export default deleteCouponProcedure;
