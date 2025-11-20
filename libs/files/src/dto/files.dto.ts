import * as dotenv from 'dotenv';
dotenv.config();

export const PRIVATE_BUCKET = process.env.S3_AWS_PRIVATE_BUCKET_NAME || '';
export const PUBLIC_BUCKET = process.env.AWS_S3_BUCKET_PUBLIC_NAME || '';

export enum Directories {
  materialIssues = 'material-issues',
  materialIndents = 'material-indents',
  materialPurchases = 'material-purchases',
  vendorQuotations = 'vendor-quotations',
  vehicleExpenses = 'vehicle-expenses',
}
