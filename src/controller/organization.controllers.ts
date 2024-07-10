import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../data-source';
import { Organisation } from '../entity/organisation.entities';
import { User } from '../entity/user.entities';
import responseHandle from '../utils/handleResponse';
import tokenHandler from '../utils/handleToken';
import { handleValidation } from '../utils/handleValidation';

const orgController: any = {};
const orgRepository: any = AppDataSource.getRepository(Organisation);
const userRepository: any = AppDataSource.getRepository(User);

orgController.getOrganisations = asyncHandler(async (req: Request, res: Response) => {
  let receivedToken: string | undefined = req.headers.authorization;
  let token: any;
  try {
    token = receivedToken?.split(' ')[1];
    const decoded: any = tokenHandler.decodeToken(token);

    const orgs = await orgRepository.find({
      where: { User: { userId: decoded.id } },
      select: ['orgId', 'name', 'description'],
      // relations: { User: true },
    });

    if (!orgs) {
      res.status(400);
      throw new Error('No organisation found');
    }

    responseHandle.successResponse(res, 200, 'Organisations found successfully', {
      organisations: orgs,
    });
  } catch (error: any) {
    throw new Error(error);
  }
});

orgController.getOrganisationById = asyncHandler(async (req: Request, res: Response) => {
  try {
    // get the org for id provided
    const org = await orgRepository.findOne({
      where: { orgId: Number(req.params.orgId) },
    });

    if (!org || org === null || org === undefined) {
      res.status(400);
      throw new Error('not a registered organisation');
    }

    // send the response
    responseHandle.successResponse(res, 200, 'Organisation found successfully', org);
  } catch (error: any) {
    throw new Error(error);
  }
});

orgController.createOrganisation = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  let receivedToken: string | undefined = req.headers.authorization;
  let token: any;

  try {
    token = receivedToken?.split(' ')[1];
    const decoded: any = tokenHandler.decodeToken(token);

    // validate the user fields
    const errors: ValidationError[] = await handleValidation(new Organisation(), req.body, res);
    if (errors.length > 0) {
      return;
    }

    // check if the name exists
    const nameTaken = await orgRepository.findOne({
      where: { name: name.trim() },
    });

    if (nameTaken) {
      res.status(422).json({
        errors: [
          {
            field: 'name',
            message: 'Name already taken',
          },
        ],
      });
      return;
    }

    // get the user data
    const userData = await userRepository.findOne({
      where: { userId: decoded.id },
    });

    // create a new org
    const newOrg = orgRepository.create({
      name: name.trim(),
      description: description.trim(),
      User: [userData],
    });

    await orgRepository.save(newOrg);

    responseHandle.successResponse(res, 201, 'Organisation created successfully', newOrg);
  } catch (error: any) {
    throw new Error(error);
  }
});

orgController.addUserToOrganisation = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const orgId = Number(req.params.orgId);

  try {
    // get the org for id provided
    const org = await orgRepository.findOne({
      where: { orgId: orgId },
      relations: { User: true },
    });

    if (!org || org === null || org === undefined) {
      res.status(400);
      throw new Error('Organisation not found');
    }

    const user = await userRepository.findOne({
      where: { userId: userId },
    });

    if (!user || user === null || user === undefined) {
      res.status(400);
      throw new Error('User not found');
    }

    if (org.User) {
      org.User = [...org.User, user];
      await orgRepository.save(org);
    } else {
      org.User = [user];
      await orgRepository.save(org);
    }

    responseHandle.successResponse(res, 200, 'Organisation updated successfully', org);
  } catch (error: any) {
    throw new Error(error);
  }
});

orgController.deleteOrg = asyncHandler(async (req: Request, res: Response) => {
  try {
    // get the org for id provided
    const org = await orgRepository.findOne({
      where: { userId: Number(req.params.id) },
    });

    if (!org || org === null || org === undefined) {
      res.status(400);
      throw new Error('You are not a registered organisation');
    }

    // delete the user
    await orgRepository.remove(org);

    // send the response
    responseHandle.successResponse(res, 200, 'Organisation deleted successfully', org);
  } catch (error: any) {
    throw new Error(error);
  }
});

export default orgController;
