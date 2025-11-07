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
    console.log("=== DELETE COUPON BACKEND ===");
    console.log("Coupon ID:", input.couponId);
    console.log("Business Name:", input.businessName);

    try {
      const result = {
        success: true,
        couponId: input.couponId,
      };
      console.log("Returning result:", JSON.stringify(result));
      return result;
    } catch (error) {
      console.error("Error in delete procedure:", error);
      throw new Error("Failed to delete coupon");
    }
  });

export default deleteCouponProcedure;
