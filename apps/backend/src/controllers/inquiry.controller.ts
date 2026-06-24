import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import Inquiry from '../models/Inquiry';

const normalizePositiveInt = (value: unknown, fallback: number, max?: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  const rounded = Math.floor(parsed);
  return max ? Math.min(rounded, max) : rounded;
};

export const createInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  const contactNumber =
    typeof req.body.contactNumber === 'string' ? req.body.contactNumber.trim() : '';
  const inquiryPayload: Record<string, unknown> = {
    fullName: req.body.fullName,
    email: req.body.email,
    userType: req.body.userType,
    subject: req.body.subject,
    inquiryType: req.body.inquiryType,
    message: req.body.message,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  };

  if (contactNumber) {
    inquiryPayload.contactNumber = contactNumber;
  }

  const inquiry = await Inquiry.create(inquiryPayload);

  res.status(201).json({
    success: true,
    message: 'Inquiry received successfully',
    data: { inquiry },
  });
};

export const getInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = normalizePositiveInt(req.query.page, 1);
  const limit = normalizePositiveInt(req.query.limit, 25, 100);
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};

  if (typeof req.query.status === 'string' && req.query.status) {
    filter.status = req.query.status;
  }

  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const search = new RegExp(req.query.search.trim(), 'i');
    filter.$or = [
      { fullName: search },
      { email: search },
      { subject: search },
      { inquiryType: search },
      { message: search },
    ];
  }

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Inquiry.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

export const updateInquiryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  const update =
    status === 'archived'
      ? { status, archivedAt: new Date() }
      : { status, $unset: { archivedAt: '' } };

  const inquiry = await Inquiry.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!inquiry) {
    throw new AppError('Inquiry not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Inquiry status updated successfully',
    data: { inquiry },
  });
};

export const deleteInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const inquiry = await Inquiry.findByIdAndDelete(id);

  if (!inquiry) {
    throw new AppError('Inquiry not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Inquiry deleted successfully',
  });
};
