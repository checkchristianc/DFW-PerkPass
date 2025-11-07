import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const updateProfilePictureProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      profilePicture: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Updating profile picture for user:', input.userId);
    console.log('Profile picture size:', input.profilePicture.length, 'bytes');
    
    return {
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: input.profilePicture,
    };
  });
