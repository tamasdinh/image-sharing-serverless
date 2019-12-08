import { CustomAuthorizerEvent, CustomAuthorizerHandler, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import {verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

export const handler: CustomAuthorizerHandler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  
  try {
    const decodedToken = await verifyToken(event.authorizationToken)
    console.log('User was authorized')

    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtToken> {
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authorization header')
  }

  const token = authHeader.split(' ')[1]

  const cert = `-----BEGIN CERTIFICATE-----
  MIIDCTCCAfGgAwIBAgIJLsyrAJ1QyOkOMA0GCSqGSIb3DQEBCwUAMCIxIDAeBgNV
  BAMTF3RkLWRldjIwMTkuZXUuYXV0aDAuY29tMB4XDTE5MTIwNzEzMzMxMloXDTMz
  MDgxNTEzMzMxMlowIjEgMB4GA1UEAxMXdGQtZGV2MjAxOS5ldS5hdXRoMC5jb20w
  ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCdGCEp2SA+J4RpfckIVMSN
  Q6HQ/PxQVoJxHLSt3pkcUfizWe1u2o9burIYxDR6Riqbm2habUrcKwogfjR2FKM5
  r68oagzSMLYtH1qaODFI8jSusiOs9f3jPRkKE+OmP5bqmgItV7jZ6/RZj3YbRWUT
  DGg/7keX/SQw27YBmG7k5RKKenLfU70cJJT3f5B6k1PTQ+272JmnBQNaY3uQl3nq
  DCPRJ6vubt2Dlv1DhxOwC9CQ6FG9x+9eV1hdzLkjhBh/UAyQ30RaB1td5hzhn48O
  5C3SPx5NLv6lSYT4143UE01up/rgy8d0zE5N5gNYiucE7G1rdQtXPrq///atFRg5
  AgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFLpwL8eb0DCWBwpE
  gzOAeJam6MoYMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAT/nY
  L4kuDENgq09Dl9OmMdFWjlPShhKCE9og5CngCUtL77YnVmBpcQ6caFriSngTLj6F
  Q90dPGqpn6m/L4rf509RPKE6kmFPjvYtFGQBbpq25gyzEsJY9Siyd/N67qPglnDz
  1lGFbAZuX2SuO4WWdisQ9LwEnRewte646Mqx8gop7JgOgY5P16eolg4TddS54UhG
  WKzradcIUsj4ugs34nRJ0f74SkxtydrtTc3DSJaiJ77DQ61QczrKCW7Kd1o/5sZQ
  knYhLQ2MO8r7i+67/7LVG9i+vafJrd8oyz0M1jpqSzWSwggKh4M5z4IQDyo49PtK
  wm2IVfTQ5G0DGWH23w==
  -----END CERTIFICATE-----`
  
  return verify(token, cert, {algorithms: ['RS256']}) as JwtToken

  // If there are no exceptions, the request is authorized
}