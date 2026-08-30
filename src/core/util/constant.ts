export const PAGINATION_PAGE = 1;
export const PAGINATION_LIMIT = 10;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6868';
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export enum AUTH_PROVIDER {
    CUSTOM = 'CUSTOM',
    EMAIL = 'EMAIL',
    GOOGLE = 'GOOGLE',
    FACEBOOK = 'FACEBOOK',
    APPLE = 'APPLE',
    MICROSOFT = 'MICROSOFT',
    TWITTER = 'TWITTER',
    LINKEDIN = 'LINKEDIN',
    GITHUB = 'GITHUB',
}

export enum DOCUMENT_STATUS {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum DOCUMENT_COMPLIANCE_STATUS {
    NON_COMPLIANT = 'NON_COMPLIANT',
    PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
    COMPLIANT = 'COMPLIANT',
}

export enum TOKEN_TYPE {
    REFRESH = 'REFRESH',
    ACCESS = 'ACCESS',
    RESET_PASSWORD = 'RESET_PASSWORD',
    VERIFICATION = 'VERIFICATION',
}

export enum BUSINESS_STATUS {
    'PENDING' = 'PENDING',
    'APPROVED' = 'APPROVED',
    'REJECTED' = 'REJECTED',
    'SUSPENDED' = 'SUSPENDED',
    'CLOSED' = 'CLOSED',
}

export enum BUSINESS_IMAGE_TYPE {
    'LOGO' = 'LOGO',
    'COVER' = 'COVER',
    'BANNER' = 'BANNER',
    'OTHER' = 'OTHER',
}

export enum GOOGLE_MAP_AUTOCOMPLETE_TYPES {
    'ESTABLISHMENT' = 'establishment',
    'ADDRESS' = 'address',
    'GEOCODE' = 'geocode',
}

export const GOOGLE_MAP_BUSINESS_FIELDS = [
    'address_components',
    'geometry',
    'name',
    'website',
    'opening_hours',
    'types',
    'photos',
    'rating',
    'user_ratings_total',
] as const;



export const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCq75gmiCFB2nvFneDNXrRAmIUeoQv4QTA';
export const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN || 'portvibe-5e855.firebaseapp.com';
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'portvibe-5e855';
export const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'portvibe-5e855.firebasestorage.app';
export const FIREBASE_MESSAGING_SENDER_ID = process.env.FIREBASE_MESSAGING_SENDER_ID || '955286294863';
export const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID || '1:955286294863:web:462f3a36a59e46e053b53a';
export const FIREBASE_MEASUREMENT_ID = process.env.FIREBASE_MEASUREMENT_ID || 'G-3XYV6G4HQ8';



export const FIREBASE_TYPE = 'service_account';
export const FIREABSE_PRIVATE_KEY_ID = 'bb53983793b2d04db2acf3e426f5e6cd4fbce89a';
export const FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmKNh8lk+3jbEn\nIr4CP22nDGgxJfj8BYpB3vdU2B/i8rfILERxECtfzHaDuK9UrdPVuKAf7AmMvNgy\nxp7lhj1ANfcQSoYscq/NOTvwj7SZom21e902l4epLknQAIu/mTpV725MxKrVMCKf\nQGGJL+W7oAw7u+JYtmBHU42zN4aWKcra+iTbBnCbTbmJUEX1bNL4uZNt9FY/Bgyi\nvEh4rohYJOXqkbUlNXVxLuuElc/b/Q2EydZJdoZHBtu3GZqWtYuZrsA99o3qVzsO\n3tSZcFqzYCmj7SCLWK01NElGJaZ9097t4U9PvH8674+U9QPuBsRgyLfWYHFqnlxv\nevF/AFSzAgMBAAECggEAD9ITyskFDhUPqQpFzTD838ruoL9c1aIxZ9Qy+IEbiCBU\nH1sXqSxA9P4iyqfrCcUDRnYtyNxQjHXun+cJehEuA88flw2BePnygzfP3TfRmk88\n4urIRUpoQFOH86YZqESOqWACwIx5N5M9uKwInWdSGGtEvutEwe2bfS8Xbtj6l5F7\nlhQTfNbjQRiMgynNCsonV+j/8FCeLPcMpG6uCAyZx21QKUV71WT6w5rjU0NKftlD\nvcJbBkowpVzuuqh3zkIeNTU5WUBiNcehmTPvyB8ofIb/A24L3lcemCgIMVxfckLW\nWzUQQjix4XUAPylEOtDSjMnne1aPNonM4DEdlkAjAQKBgQDnZC89nfuRoaVr1hz5\nO/gOWrc6a0uxvuZxR+1m+MWysIdRx3e+wWhA09giSq4gpGfuI4WLvPg5/2x+Y660\nJhjB6Gi74r+ioHRX2AurXrd72XUZtLJx2CNrNMdsTK1tXfgY70zb4DhG5UpOQXEw\nTjgIl0vefqwXbrwxSmWn6Kks3QKBgQC31KxQ4gg908IAa2SFpM/r6suLK/1hpVMR\nsaVtCfnThTD1rA9AHjBRJPvqx2sO9xmcd1WnZ4U740WFDjMBE6bHbDWqfZrhMIn4\nL2CTusQBKV116CEceAIu/tcv9AfxobvphVT3E0BxBpgOnKSCD9iwEdaaHLU7QG/Q\nJnp3O9lmzwKBgQCp2tUCujGtGafAnQ/vtKHGh7jw3UpXU/b9OPuAFyWoogTzdyTj\nlj3dOKTzpzZjJ8xS9yhVB4Z/rIwLy0i3XS/XR696HFzoGDjPMvx9861k8KARGp/T\nCgIV9Exfp3m3Sr+QLjmRPeqRwEbnYwqflwty4v0CeqIBIXxsAlzVAOkO0QKBgAs7\n5u/mcER+/VsTNQhpwv8S0S+HF6vw83ugVJCuTGMdv5kz05bCgYdj8DUvzJ4Uga8r\nJ8PcMqsvP19bN8i4D7geJ8VseZuLYNMW6hr9Dd9YTMrYzbU0rEV881+N1TJyBM7H\nhCK5PXXqxj4WWoNMPpy76lZurLCbRnn87/z7XlTHAoGARRZLIeZ0bMKp6KmfiMHK\n3hTG9KJcZgGW2WORUGfr/Us3QmI5DMfbz18ylqfqOsboJ7RZZSeUCBAhq47UhQCu\nb95X9CnhTGB8Kjom+c5BjIp0Ha2XpOi24OjknQgq5fd29SXypI9W69D5cB2nQj1p\nXzwGxhUTEWGjTjn6IEHeA/o=\n-----END PRIVATE KEY-----\n'



export const CACHE_EXPIRATE = {
    '5M': 1000 * 60 * 5,
    '10M': 1000 * 60 * 10,
    '15M': 1000 * 60 * 15,
    '30M': 1000 * 60 * 30,
    '1H': 1000 * 60 * 60,
    '2H': 1000 * 60 * 120,
    '3H': 1000 * 60 * 180,
    '4H': 1000 * 60 * 240,
    '5H': 1000 * 60 * 300,
    '1D': 1000 * 60 * 60 * 24,
    '1W': 1000 * 60 * 60 * 24 * 7,
    '1M': 1000 * 60 * 60 * 24 * 30,
    '1Y': 1000 * 60 * 60 * 24 * 365,
}



export enum BUSINESS_SUBMISSION_STATUS {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum BUSINESS_SUBMISSION_TYPE {
    NEW = 'NEW',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}



export const LIMIT_FILE_SIZE = {
    '10MB': 10 * 1024 * 1024,
    '20MB': 20 * 1024 * 1024,
    '30MB': 30 * 1024 * 1024,
    '40MB': 40 * 1024 * 1024,
    '50MB': 50 * 1024 * 1024,
    '100MB': 100 * 1024 * 1024,
    '200MB': 200 * 1024 * 1024,
    '300MB': 300 * 1024 * 1024,
    '400MB': 400 * 1024 * 1024,
    '500MB': 500 * 1024 * 1024,
}

export enum SUBSCRIPTION_STATUS {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    TRIALING = 'TRIALING',
}

export enum STUDENT_STATUS {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    DROPPED = 'DROPPED',
    GRADUATED = 'GRADUATED',
}

export enum ROLE {
    ADMIN = 'ADMIN',
    USER = 'USER',
    INSTRUCTOR = 'INSTRUCTOR',
    STUDENT = 'STUDENT',
}

export enum COURSE_TYPE {
    UNIVERSITY = 'UNIVERSITY',
    REQUIRED = 'REQUIRED',
    ELECTIVE = 'ELECTIVE',
}

export enum ENROLLMENT_STATUS {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    DROPPED = 'DROPPED',
    FAILED = 'FAILED',
    WITHDRAWN = 'WITHDRAWN',
}

export enum USER_ROLE {
    ADMIN = 'ADMIN',
    USER = 'USER',
    INSTRUCTOR = 'INSTRUCTOR',
    STUDENT = 'STUDENT',
}

export enum POST_ATTACHMENT_TYPE {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    LINK = 'LINK',
    FILE = 'FILE',
}

export enum POINT_TRANSACTION_TYPE {
    EARNED = 'EARNED',
    REDEEMED = 'REDEEMED',
}

export enum POINT_TRANSACTION_REFERENCE_TYPE {
    POST_ATTACHMENT = 'POST_ATTACHMENT',
    POST = 'POST',
    POST_COMMENT = 'POST_COMMENT',
    POST_REACTION = 'POST_REACTION',
    POST_VIEW = 'POST_VIEW',
    SECTION = 'SECTION',
    COURSE = 'COURSE',
    DEPARTMENT = 'DEPARTMENT',
    FACULTY = 'FACULTY',
}


export const EVENT_NAMES = {
    LOGIN: 'login',
    POST_VIEWED: 'post-viewed',
    POST_CREATED: 'post-created',
    POST_COMMENT_CREATED: 'post-comment-created',
    POST_REACTION_CREATED: 'post-reaction-created',
    STUDENT_CREATED: 'student-created',
    INSTRUCTOR_CREATED: 'instructor-created',
    ADMIN_CREATED: 'admin-created',
    SECTION_CREATED: 'section-created',
    ENROLLMENT_CREATED: 'enrollment-created',
    MESSAGE_CREATED: 'message-created',
}

export enum QUIZ_STATUS {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    CLOSED = 'CLOSED',
}

export enum QUIZ_QUESTION_TYPE {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    TRUE_FALSE = 'TRUE_FALSE',
    FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
    ESSAY = 'ESSAY',
    MATCHING = 'MATCHING',
    SHORT_ANSWER = 'SHORT_ANSWER',
    LONG_ANSWER = 'LONG_ANSWER',
}

export enum TASK_STATUS {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    IN_PROGRESS = 'IN_PROGRESS',
    FAILED = 'FAILED',
}



export enum ANNOUNCEMENT_SECTION_STATUS {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export const POST_POINT = {
    UPLOAD_VIDEO: 5,
    COMMENT: 1,
    VIEW: 3,
    REACTION: 1,

}

export enum POST_STATUS {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    CLOSED = 'CLOSED',
}

export enum CONNECTION_STATUS {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    BLOCKED = 'BLOCKED',
    DELETED = 'DELETED',
}


export const ROLE_ID = {
    INSTRUCTOR: 5,
    STUDENT: 6,
    ADMIN: 1,
}

export enum LIVE_STATUS {
    DRAFT = 'DRAFT',
    SCHEDULED = 'SCHEDULED',
    ON_AIR = 'ON_AIR',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED',
}


export enum LIVE_REACTION_TYPE {
    LIKE = 'LIKE',
    DISLIKE = 'DISLIKE',
    LOVE = 'LOVE',
    HAHA = 'HAHA',
    WOW = 'WOW',
    SAD = 'SAD',
    ANGRY = 'ANGRY',
}

export enum BADGE_RARITY {
    COMMON = 'COMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
}

export enum BADGE_CATEGORY {
    MILESTONE = 'MILESTONE',
    CONTENT = 'CONTENT',
    SOCIAL = 'SOCIAL',
    ACADEMIC = 'ACADEMIC',
    OTHER = 'OTHER',
}

export enum BADGE_RULE_TYPE {
    TOTAL_POINTS = 'TOTAL_POINTS',
    ACTION_COUNT = 'ACTION_COUNT',
}

export enum BADGE_ACTION_TYPE {
    UPLOAD_VIDEO = 'UPLOAD_POST',
    COMMENT = 'POST_COMMENT',
    VIEW = 'POST_VIEW',
    REACTION = 'POST_REACTION',
}

export enum MESSAGE_RECEIPT_STATUS {
    SENT = 'SENT',
    READ = 'READ',
    DELETED = 'DELETED',
}

export enum MESSAGE_ATTACHMENT_TYPE {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    FILE = 'FILE',
}

export enum EMAIL_MODULE {
    AUTH = 'AUTH',
    LMS = 'LMS',
    BILLING = 'BILLING',
}

export enum EMAIL_FUNCTION {
    PASSWORD_RESET = 'PASSWORD_RESET',
    COURSE_INVITE = 'COURSE_INVITE',
    ACCOUNT_CREATED = 'ACCOUNT_CREATED',
}

export enum API_REQUEST_QUEUE_STATUS {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum API_REQUEST_QUEUE_HTTP_METHOD {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}


export enum BULL_QUEUE_NAMES {
    CREATE_STUDENT_BULK = 'create-student-bulk',
    CREATE_INSTRUCTOR_BULK = 'create-instructor-bulk',
    CREATE_COURSE_BULK = 'create-course-bulk',
    CREATE_SECTION_BULK = 'create-section-bulk',
    GENERATE_REPORT = 'generate-report',
}



export const BULL_QUEUE_FLUSH_SIZE = 100;
export const BULL_QUEUE_CONCURRENCY = 5;



export enum REPORT_TYPE {
    PERFORMANCE = 'PERFORMANCE',
    ENGAGEMENT = 'ENGAGEMENT',
}

export enum REPORT_FORMAT {
    PDF = 'PDF',
    CSV = 'CSV',
    EXCEL = 'EXCEL',
}

export enum REPORT_STATUS {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum REPORT_DATE_RANGE {
    THIS_WEEK = 'THIS_WEEK',
    THIS_MONTH = 'THIS_MONTH',
    THIS_YEAR = 'THIS_YEAR',
    THIS_SEMESTER = 'THIS_SEMESTER',
    ALL_TIME = 'ALL_TIME',
}


export enum EVENT_TYPE {
    WEDDING = 'WEDDING',
    BIRTHDAY = 'BIRTHDAY',
    ANNIVERSARY = 'ANNIVERSARY',
    PARTY = 'PARTY',
    OTHER = 'OTHER',
}

export enum EVENT_STATUS {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED'
}

export enum EVENT_MEDIA_STATUS {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export enum ORDER_STATUS {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    CANCELLED = 'CANCELLED',
}

export enum ORDER_PAYMENT_PROVIDER {
    STRIPE = 'STRIPE',
    MIDTRANS = 'MIDTRANS',
    XENDIT = 'XENDIT',
    PAYPAL = 'PAYPAL',
}