import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import { S3 } from 'aws-sdk'
import * as Jimp from 'jimp/es'

const s3 = new S3()
const bucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucket = process.env.THUMBNAILS_S3_BUCKET

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event:', JSON.stringify(event))
  for (const record of event.Records) {
    const s3EventStr = record.Sns.Message
    console.log('Processing S3 event:', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      await processImage(record)
    }
  }
}

async function processImage(record: S3EventRecord) {
  const key = record.s3.object.key
  const response = await s3.getObject({
    Bucket: bucketName,
    Key: key
  }).promise()

  const body: Buffer = new Buffer(JSON.stringify(response.Body), 'utf8')
  console.log('Response', response)
  console.log('Body', body)

  const image = await Jimp.read(body)
  image.resize(150, Jimp.AUTO)
  const convertedBuffer = await image.getBufferAsync('-1')

  await s3.putObject({
    Bucket: thumbnailBucket,
    Key: `${key}.jpeg`,
    Body: convertedBuffer
  }).promise()
}