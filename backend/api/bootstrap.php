<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

//Google Cloud Storage
// use Google\Cloud\Storage\StorageClient;

// try {
//     $storage = new StorageClient([
//         'keyFilePath' => getcwd() . '/practipro-edb55cab2005.json',
//     ]);
//     $bucketName = 'practipro-bucket';
//     $bucket = $storage->bucket($bucketName);
//     $response = $storage->createBucket($bucketName);
//     echo "Your Bucket $bucketName is created successfully.";
// } catch (Exception $e) {
//     echo $e->getMessage();
// }