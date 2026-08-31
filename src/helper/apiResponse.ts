class ApiResponse<T> {
    constructor(
        public statusCode: number,
        public data: T,
        public message: string,
        public success?: boolean
    ){
        this.success = statusCode <= 400
    }
}

class ApiError extends Error {
    public data: null = null;
    public success: false = false;
    public errors: unknown[];

    constructor(
        public statusCode: number,
        message = "Something went wrong",
        errors: unknown[] = [],
        stack = ""
    ) {
        super(message);
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            success: this.success,
            errors: this.errors,
            data: this.data,
        };
    }
}

export { ApiResponse, ApiError };