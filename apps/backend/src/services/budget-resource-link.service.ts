import OrgBudget from '../models/OrgBudget';
import OrgTransaction from '../models/OrgTransaction';
import ResourceRequest from '../models/ResourceRequest';
import OrganizationFile from '../models/OrganizationFile';
import logger from '../utils/logger';

export async function linkResourceApprovalToBudget(
  requestId: string,
  organizationId: string,
  approvedBy: string
): Promise<void> {
  const request = await ResourceRequest.findById(requestId);
  if (request?.resourceType !== 'budget') {return;}

  const budget = await OrgBudget.findOne({ organizationId });
  if (!budget) {return;}

  try {
    const transaction = await OrgTransaction.create({
      organizationId,
      type: 'expense',
      category: 'resource-request',
      amount: request.quantity || 0,
      description: `Approved resource request: ${request.description}`,
      date: new Date(),
      createdBy: approvedBy,
    });

    await OrganizationFile.updateMany(
      { 'attachedTo.id': requestId },
      {
        $push: {
          attachedTo: {
            type: 'budget_transaction',
            id: String(transaction._id),
            relation: 'receipt',
          },
        },
      }
    );
  } catch (error) {
    logger.error(`Failed to link resource request ${requestId} to budget:`, error);
  }
}
