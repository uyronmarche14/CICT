import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ConfirmationDialog from './confirmation-dialog';
import { useConfirmationDialog } from '@/lib/store/confirmationDialogStore';

describe('ConfirmationDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<ConfirmationDialog />);
    expect(container.textContent).toBe('');
  });

  it('renders dialog content when open', async () => {
    render(<ConfirmationDialog />);

    await act(async () => {
      useConfirmationDialog.getState().show({
        title: 'Delete item?',
        description: 'This action cannot be undone.',
        onConfirm: () => {},
      });
    });

    expect(await screen.findByText('Delete item?')).toBeTruthy();
    expect(await screen.findByText('This action cannot be undone.')).toBeTruthy();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    let confirmed = false;
    render(<ConfirmationDialog />);

    await act(async () => {
      useConfirmationDialog.getState().show({
        title: 'Confirm?',
        description: 'Are you sure?',
        onConfirm: () => { confirmed = true; },
      });
    });

    const confirmBtn = await screen.findByText('Confirm');
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(confirmed).toBe(true);
  });

  it('closes dialog when cancel clicked', async () => {
    render(<ConfirmationDialog />);

    await act(async () => {
      useConfirmationDialog.getState().show({
        title: 'Cancel?',
        description: 'Cancel this?',
        onConfirm: () => {},
      });
    });

    expect(await screen.findByText('Cancel?')).toBeTruthy();

    const cancelBtn = await screen.findByText('Cancel');
    await act(async () => {
      fireEvent.click(cancelBtn);
    });

    expect(useConfirmationDialog.getState().open).toBe(false);
  });
});
