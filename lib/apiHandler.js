import { NextResponse } from 'next/server';
import { ApiError, toJson } from './errors.js';
import connectDB from './db.js';

export function apiHandler(handler, options = {}) {
  return async (request, context) => {
    console.log('[API_HANDLER] Request:', request.method, request.url);
    try {
      // Connect to database
      await connectDB();
      console.log('[API_HANDLER] Database connected');

      // Validate request body if validator is provided
      if (options.validator && request.method !== 'GET' && request.method !== 'DELETE') {
        const body = await request.json();
        console.log('[API_HANDLER] Request body:', JSON.stringify(body).substring(0, 200));
        const validationResult = options.validator.safeParse(body);

        if (!validationResult.success) {
          const errorMessage = validationResult.error.errors
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
          console.log('[API_HANDLER] Validation failed:', errorMessage);
          throw new ApiError(errorMessage, 400);
        }

        console.log('[API_HANDLER] Validation passed');
        // Attach validated data to request for use in handler
        request.validatedData = validationResult.data;

        // Create a new request with the body for the handler
        request.json = async () => validationResult.data;
      }

      // Call the actual handler
      console.log('[API_HANDLER] Calling handler');
      const result = await handler(request, context);

      // If result is already a Response, return it
      if (result instanceof Response) {
        console.log('[API_HANDLER] Handler returned Response, status:', result.status);
        return result;
      }

      // Otherwise wrap in success response
      console.log('[API_HANDLER] Handler returned data, wrapping in success response');
      return NextResponse.json({ ok: true, data: result });
    } catch (error) {
      console.error('[API_HANDLER] Error:', error.message, error.statusCode || 500);
      console.error('[API_HANDLER] Error stack:', error.stack);
      const errorResponse = toJson(error);
      return NextResponse.json(errorResponse, {
        status: errorResponse.error.statusCode,
      });
    }
  };
}
