import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import path from 'path';
import { AppDataSource } from '../data-source';
import { User } from '../entity/user.entities';
import tokenHandler from '../utils/handleToken';

// Configure dotenv to load the .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * @description This middleware checks the user admin token supplied as Bearer authorization
 * @required Bearer Authorization
 */

const AuthMiddleware: any = {};
const userRepository: any = AppDataSource.getRepository(User);

AuthMiddleware.protectUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let receivedToken: string | undefined = req.headers.authorization;
  let token: any;

  if (receivedToken && receivedToken.startsWith('Bearer')) {
    try {
      token = receivedToken.split(' ')[1];
      const decoded: any = tokenHandler.decodeToken(token);

      const user = await userRepository.findOne({
        where: { email: decoded.email },
        select: ['userId', 'firstName', 'lastName', 'email', 'password', 'phone'],
      });

      if (!user) {
        res.status(401);
        throw new Error('You are not authorized to use this service yet. ');
      }

      // req.user = user;
    } catch (error: any) {
      res.status(401);
      throw new Error(error);
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('You are not authorized to use this service, no token provided.');
  }
  next();
});

export default AuthMiddleware;
