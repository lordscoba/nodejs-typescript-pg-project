import Router from 'express';
import orgController from '../controller/organization.controllers';
import AuthMiddleware from '../middleware/userMiddleware';

const orgRoutes = Router.Router();

// protected routes
orgRoutes.use(AuthMiddleware.protectUser);

// Organisation Routes
orgRoutes.get('/organisations', orgController.getOrganisations);
orgRoutes.get('/organisations/:orgId', orgController.getOrganisationById);
orgRoutes.delete('/organisations/:orgId', orgController.getOrganisationById);
orgRoutes.post('/organisations', orgController.createOrganisation);
orgRoutes.post('/organisations/:orgId/users', orgController.addUserToOrganisation);

export default orgRoutes;
