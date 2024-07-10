import Router from 'express';
import userController from '../controller/user.controllers';
import AuthMiddleware from '../middleware/userMiddleware';

const userRoutes = Router.Router();

// protected routes
userRoutes.use(AuthMiddleware.protectUser);

// User Routes
userRoutes.get('/users/:id', userController.getUser);
userRoutes.delete('/users/:id', userController.deleteUser);

export default userRoutes;
