<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Registration Number Formats
    |--------------------------------------------------------------------------
    |
    | Prefix and formatting pattern for generated registration numbers.
    | See Skema-Database-Padindi.md section 6.1
    |
    */
    'student_number_format' => env('REGISTRATION_STUDENT_FORMAT', 'PPDB-{YEAR}-{NUMBER}'),
    'teacher_number_format' => env('REGISTRATION_TEACHER_FORMAT', 'TCH-{YEAR}-{NUMBER}'),

    /*
    |--------------------------------------------------------------------------
    | Document Upload Limits
    |--------------------------------------------------------------------------
    |
    | Default max file size in kilobytes and allowed MIME types.
    | See ARCHITECTURE.md section 6.4 & Rancangan-API-Padindi.md section 7
    |
    */
    'max_file_size_kb' => (int) env('REGISTRATION_MAX_FILE_SIZE_KB', 2048),
    'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],

    /*
    |--------------------------------------------------------------------------
    | Quota Calculation Basis
    |--------------------------------------------------------------------------
    |
    | Determines which status counts against the period quota.
    | Supported: 'accepted', 'verified'
    | See Rancangan-API-Padindi.md section 5.2 & Skema-Database-Padindi.md section 6.2
    |
    */
    'quota_basis' => env('REGISTRATION_QUOTA_BASIS', 'accepted'),

    /*
    |--------------------------------------------------------------------------
    | Data Retention Period (UU PDP Compliance)
    |--------------------------------------------------------------------------
    |
    | Number of days before unaccepted applicant data is purged.
    | See Skema-Database-Padindi.md section 6.9 & 10
    |
    */
    'retention_days' => (int) env('REGISTRATION_RETENTION_DAYS', 365),
];
