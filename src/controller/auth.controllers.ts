import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../data-source';
import { Organisation } from '../entity/organisation.entities';
import { User } from '../entity/user.entities';
import responseHandle from '../utils/handleResponse';
import tokenHandler from '../utils/handleToken';
import { handleValidation } from '../utils/handleValidation';

const userRepository: any = AppDataSource.getRepository(User);
const orgRepository: any = AppDataSource.getRepository(Organisation);
const authController: any = {};

authController.register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // validate the user fields
    const errors: ValidationError[] = await handleValidation(new User(), req.body, res);
    if (errors.length > 0) {
      return;
    }

    // check if the email exists
    const emailTaken = await userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (emailTaken) {
      res.status(422).json({
        status: 'failed',
        errors: [
          {
            field: 'email',
            message: 'Email already taken',
          },
        ],
      });
      return;
    }

    // create a new user
    const newUser = userRepository.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      phone: phone,
    });
    await userRepository.save(newUser);

    // create a new Organisation using many to many relationship
    const newOrg = orgRepository.create({
      name: `${firstName.trim()}\'s Organisation`,
      description: 'New Organisation',
      User: [newUser],
    });
    await orgRepository.save(newOrg);

    // send the response
    responseHandle.successResponse(res, 201, 'Registration successful', {
      accessToken: tokenHandler.generateToken(
        {
          id: newUser.userId,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
        },
        '1d',
      ),
      user: {
        userId: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error: any) {
    throw new Error(error);
  }
});

authController.login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // validate the user fields
    const errors: ValidationError[] = await handleValidation(new User(), req.body, res);
    if (errors.length > 0) {
      return;
    }
    // check if the email exists
    const user = await userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user || user === null || user === undefined) {
      res.status(401).json({
        errors: [
          {
            field: 'email',
            message: 'user does not exist',
          },
        ],
      });
      return;
    }

    // check if the password is correct
    const validPassword = await user.matchPassword(password);
    if (!validPassword) {
      res.status(401).json({
        errors: [
          {
            field: 'password',
            message: 'Invalid password',
          },
        ],
      });
      return;
    }

    // send the response
    responseHandle.successResponse(res, 200, 'Login successful', {
      accessToken: tokenHandler.generateToken(
        {
          id: user.userId,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        '1d',
      ),
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    throw new Error(error);
  }
});

export default authController;
