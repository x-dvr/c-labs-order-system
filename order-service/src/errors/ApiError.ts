class ApiError extends Error {
  static from(error: Error): ApiError {
    return new ApiError(500, error.message, { cause: error })
  }

  constructor(public code: number, message: string, opts?: ErrorOptions) {
    super(message, opts)
  }
}

export default ApiError;