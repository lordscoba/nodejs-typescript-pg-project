import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../data-source';
import { User } from '../entity/user.entities';
import responseHandle from '../utils/handleResponse';

const userController: any = {};
const userRepository: any = AppDataSource.getRepository(User);

userController.getUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    // get the user for id provided
    const user = await userRepository.findOne({
      where: { userId: Number(req.params.id) },
    });

    if (!user || user === null || user === undefined) {
      res.status(400);
      throw new Error('You are not a registered user');
    }

    // send the response
    responseHandle.successResponse(res, 200, 'User found successfully', user);
  } catch (error: any) {
    throw new Error(error);
  }
});

userController.deleteUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    // get the user for id provided
    const user = await userRepository.findOne({
      where: { userId: Number(req.params.id) },
    });

    if (!user || user === null || user === undefined) {
      res.status(400);
      throw new Error('You are not a registered user');
    }

    // delete the user
    await userRepository.remove(user);

    // send the response
    responseHandle.successResponse(res, 200, 'User deleted successfully', user);
  } catch (error: any) {
    throw new Error(error);
  }
});

export default userController;
