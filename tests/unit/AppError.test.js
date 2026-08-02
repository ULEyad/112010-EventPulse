const AppError = require('../../utils/AppError');

describe('AppError', () => {
  it('sets the message and status code', () => {
    const err = new AppError('Something failed', 400);
    expect(err.message).toBe('Something failed');
    expect(err.statusCode).toBe(400);
  });

  it('marks 4xx errors as "fail" and flags them as operational', () => {
    const err = new AppError('Bad request', 404);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  it('marks 5xx errors as "error"', () => {
    const err = new AppError('Server exploded', 500);
    expect(err.status).toBe('error');
  });
});
