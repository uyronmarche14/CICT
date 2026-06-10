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
import { authorize, requireAdminAccess } from '../middleware/permissions';
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

router.use(protect, requireAdminAccess, authorize(Permission.MANAGE_ORG_VOTES));

router.get('/:orgId/votes', listVotes);
router.post('/:orgId/votes', validate(createVoteValidator), logActivity('create', 'org_vote'), createVote);
router.get('/:orgId/votes/:voteId', validate(voteIdValidator), getVote);
router.put('/:orgId/votes/:voteId', validate(updateVoteValidator), logActivity('update', 'org_vote'), updateVote);
router.delete('/:orgId/votes/:voteId', validate(voteIdValidator), logActivity('delete', 'org_vote'), deleteVote);
router.post('/:orgId/votes/:voteId/cast', validate(castBallotValidator), logActivity('cast', 'org_ballot'), castBallot);
router.get('/:orgId/votes/:voteId/results', validate(voteIdValidator), getResults);

export default router;
