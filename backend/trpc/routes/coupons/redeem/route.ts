import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

export const redeemCouponProcedure = publicProcedure
  .input(
    z.object({
      couponId: z.string(),
      userId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('Redeeming coupon:', input);
      
      if (!input.couponId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Coupon ID is required',
        });
      }
      
      const redemption = {
        id: `redemption-${Date.now()}`,
        couponId: input.couponId,
        userId: input.userId || 'anonymous',
        redeemedAt: new Date().toISOString(),
      };
      
      console.log('Redemption successful:', redemption);
      
      return {
        success: true,
        redemption,
      };
    } catch (error) {
      console.error('Error in redeemCouponProcedure:', error);
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to redeem coupon',
        cause: error,
      });
    }
  });

export default redeemCouponProcedure;
