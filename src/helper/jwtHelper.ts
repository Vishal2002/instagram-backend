import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

type User = {
  
  username: string;
  userId: number;
  
 
};

export const creteToken = (data: User): string => {
  const secret = process.env.jwt_secret;
  if (!secret) {
    throw new Error('JWT secret not provided');
  }

  return jwt.sign( data , secret);
};

export const decodeToken = (token: string)=> {
  try {
    const secret = process.env.jwt_secret;
    if (!secret) {
      throw new Error('JWT secret not provided');
    }
    const decoded = jwt.verify(token, secret) as User;
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
