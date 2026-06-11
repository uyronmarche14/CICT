import express from 'express';
import {
  listVotes,
  createVote,
  getVote,
  updateVote,
  deleteVote,
  castBallot,
  getResults,
} from '../controllers/org-vote.controller';
import { authenticate as protect } from '../middleware/auth';
import { authorizeOrganizationScope, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  createVoteValidator,
  updateVoteValidator,
  voteIdValidator,
  castBallotValidator,
} from '../validators/org-vote.validator';

const router = express.Router();

router.use(protect, requireAdminAccess);

const canManageVotes = authorizeOrganizationScope(Permission.MANAGE_ORG_VOTES);

router.get('/:orgId/votes', canManageVotes, listVotes);
router.post('/:orgId/votes', canManageVotes, validate(createVoteValidator), logActivity('create', 'org_vote'), createVote);
router.get('/:orgId/votes/:voteId', canManageVotes, validate(voteIdValidator), getVote);
router.put('/:orgId/votes/:voteId', canManageVotes, validate(updateVoteValidator), logActivity('update', 'org_vote'), updateVote);
router.delete('/:orgId/votes/:voteId', canManageVotes, validate(voteIdValidator), logActivity('delete', 'org_vote'), deleteVote);
router.post('/:orgId/votes/:voteId/cast', canManageVotes, validate(castBallotValidator), logActivity('cast', 'org_ballot'), castBallot);
router.get('/:orgId/votes/:voteId/results', canManageVotes, validate(voteIdValidator), getResults);

export default router;
