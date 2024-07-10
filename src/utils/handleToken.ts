import dotenv from 'dotenv';
import jsonwebtoken from 'jsonwebtoken';
import path from 'path';

// Configure dotenv to load the .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const secret: string | undefined = process.env.JWT_SECRET;

const tokenHandler: any = {};

tokenHandler.generateToken = (fieldToSecure: any, duration: any) => {
  try {
    return jsonwebtoken.sign(fieldToSecure, secret!, {
      expiresIn: duration ? duration : 18408600000,
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

tokenHandler.decodeToken = (token: string) => {
  try {
    return jsonwebtoken.verify(token, secret!);
  } catch (error: any) {
    // res.status(422);
    throw new Error(error);
  }
};

export default tokenHandler;
