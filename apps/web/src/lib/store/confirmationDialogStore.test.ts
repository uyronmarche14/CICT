import { describe, expect, it, beforeEach } from 'vitest';
import { useConfirmationDialog } from './confirmationDialogStore';

describe('confirmationDialogStore', () => {
  beforeEach(() => {
    useConfirmationDialog.getState().reset();
  });

  it('starts closed with empty state', () => {
    const state = useConfirmationDialog.getState();
    expect(state.open).toBe(false);
    expect(state.title).toBe('');
    expect(state.description).toBe('');
  });

  it('show() opens dialog with config', () => {
    const onConfirm = () => {};
    useConfirmationDialog.getState().show({
      title: 'Delete item?',
      description: 'This cannot be undone',
      onConfirm,
    });

    const state = useConfirmationDialog.getState();
    expect(state.open).toBe(true);
    expect(state.title).toBe('Delete item?');
    expect(state.description).toBe('This cannot be undone');
    expect(state.onConfirm).toBe(onConfirm);
  });

  it('show() uses default button text when not provided', () => {
    useConfirmationDialog.getState().show({
      title: 'Confirm',
      description: 'Are you sure?',
      onConfirm: () => {},
    });

    const state = useConfirmationDialog.getState();
    expect(state.buttonText).toEqual({ cancel: 'Cancel', confirm: 'Confirm' });
  });

  it('show() accepts custom button text', () => {
    useConfirmationDialog.getState().show({
      title: 'Save?',
      description: 'Save changes?',
      buttonText: { cancel: 'No', confirm: 'Yes' },
      onConfirm: () => {},
    });

    const state = useConfirmationDialog.getState();
    expect(state.buttonText).toEqual({ cancel: 'No', confirm: 'Yes' });
  });

  it('setOpen() controls open state', () => {
    useConfirmationDialog.getState().setOpen(true);
    expect(useConfirmationDialog.getState().open).toBe(true);

    useConfirmationDialog.getState().setOpen(false);
    expect(useConfirmationDialog.getState().open).toBe(false);
  });

  it('reset() clears all state', () => {
    useConfirmationDialog.getState().show({
      title: 'Test',
      description: 'Test desc',
      onConfirm: () => {},
    });

    useConfirmationDialog.getState().reset();

    const state = useConfirmationDialog.getState();
    expect(state.open).toBe(false);
    expect(state.title).toBe('');
    expect(state.description).toBe('');
    expect(state.buttonText).toEqual({ cancel: 'Cancel', confirm: 'Confirm' });
  });

  it('has default onConfirm that returns undefined', () => {
    const state = useConfirmationDialog.getState();
    expect(state.onConfirm()).toBeUndefined();
  });
});
