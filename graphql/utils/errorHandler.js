const { GraphQLError } = require('graphql');
const { ApolloServerErrorCode } = require('@apollo/server/errors');

const dict_codes = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND'
}

function throwApiError(err) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (!dict_codes[statusCode]) console.log(err);

  throw new GraphQLError(message, {
    extensions: {
      code: dict_codes[statusCode] || "INTERNAL_SERVER_ERROR",
      isApiHandledError: true,
      http: {
        status: statusCode
      },
    }
  });
}

function formatError(formattedError, error) {

  if (formattedError.extensions?.code === ApolloServerErrorCode.BAD_USER_INPUT) {
    return {
      code: formattedError.extensions.code,
      message: formattedError.message
    }
  }

  if (formattedError.extensions.isApiHandledError) {
    return {
      code: formattedError.extensions.code,
      message: formattedError.message
    }
  }

  return formattedError;

}

module.exports = { throwApiError, formatError };