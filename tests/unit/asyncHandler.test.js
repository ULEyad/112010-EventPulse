const asyncHandler = require('../../utils/asyncHandler');

describe('asyncHandler', () => {
  it('calls the wrapped function with (req, res, next) on success and does not call next', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const fn = jest.fn().mockResolvedValue('ok');

    await asyncHandler(fn)(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a rejected promise to next()', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const error = new Error('boom');
    const fn = jest.fn().mockRejectedValue(error);

    await asyncHandler(fn)(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('forwards a synchronously thrown error to next()', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const error = new Error('sync boom');
    const fn = jest.fn(() => {
      throw error;
    });

    await asyncHandler(fn)(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
