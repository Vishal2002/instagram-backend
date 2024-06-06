import {z} from 'zod';
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

export const UserSchema=z.object({
  username:z.string().max(20,"Reached Maximum Limit for Username"),
  email:z.string().email("Invalid Email Address"),
  password:passwordSchema,
})

export const LoginSchema=z.object({
    username:z.string(),
    password:passwordSchema,
})

export const PostSchema=z.object({
  caption:z.string().min(3).max(200,"Reached Maximum Limit for the Caption")
})

export const CommmentSchema=z.object({
    content:z.string().max(100,"Limit Reached foor Comments")
})

