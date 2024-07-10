import Router from 'express';
import authController from '../controller/auth.controllers';

const authRoutes = Router.Router();

// Auth Routes
authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);

export default authRoutes;
